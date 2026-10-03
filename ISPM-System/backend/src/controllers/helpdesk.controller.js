/**
 * controllers/helpdesk.controller.js
 * Express controllers for Helpdesk endpoints.
 */
import { z } from 'zod';
import {
  getTicketsList,
  getTicketById,
  createTicket,
  addTicketResponse,
  updateTicketStatus,
} from '../services/helpdesk.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';

const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters long.').max(255, 'Subject cannot exceed 255 characters.'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters long.').max(5000, 'Description cannot exceed 5000 characters.'),
  priority: z.enum(TICKET_PRIORITIES).optional().default('MEDIUM'),
});

const addResponseSchema = z.object({
  responseText: z.string().trim().min(1, 'Response text cannot be empty.').max(5000, 'Response text cannot exceed 5000 characters.'),
});

const updateStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES, {
    errorMap: () => ({ message: 'Invalid ticket status provided.' }),
  }),
});

/**
 * GET /api/helpdesk/tickets
 * EMPLOYEE: list own tickets
 * SYSTEM_ADMIN: list all tickets
 */
export async function getTickets(req, res) {
  try {
    const { status, priority, search } = req.query;

    if (status && !TICKET_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status filter value.' });
    }
    if (priority && !TICKET_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority filter value.' });
    }

    const tickets = await getTicketsList({
      userId: req.user.id,
      userRole: req.user.role,
      status,
      priority,
      search,
    });

    return res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (err) {
    console.error('[helpdesk.controller] Error listing tickets:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve helpdesk tickets.',
    });
  }
}

/**
 * GET /api/helpdesk/tickets/:id
 * Allowed: SYSTEM_ADMIN or EMPLOYEE who owns the ticket
 */
export async function getTicketDetails(req, res) {
  try {
    const { id } = req.params;

    const result = await getTicketById(id, {
      userId: req.user.id,
      userRole: req.user.role,
    });

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: result.message });
    }
    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      data: { ticket: result.ticket },
    });
  } catch (err) {
    console.error('[helpdesk.controller] Error getting ticket details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket details.',
    });
  }
}

/**
 * POST /api/helpdesk/tickets
 * EMPLOYEE only
 */
export async function handleCreateTicket(req, res) {
  try {
    const parseResult = createTicketSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(' ');
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { subject, description, priority } = parseResult.data;

    const ticket = await createTicket({
      creatorId: req.user.id,
      subject,
      description,
      priority,
    });

    // Audit Log
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'HELPDESK_TICKET_CREATED',
      entityType: 'HelpdeskTicket',
      entityId: ticket.id,
      description: `User ${req.user.email} created helpdesk ticket "${ticket.subject}"`,
      ipAddress: getClientIp(req),
    });

    return res.status(201).json({
      success: true,
      message: 'Helpdesk ticket submitted successfully.',
      data: { ticket },
    });
  } catch (err) {
    console.error('[helpdesk.controller] Error creating ticket:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create helpdesk ticket.',
    });
  }
}

/**
 * POST /api/helpdesk/tickets/:id/responses
 * SYSTEM_ADMIN (any ticket) or EMPLOYEE (own ticket)
 */
export async function handleAddResponse(req, res) {
  try {
    const { id } = req.params;

    const parseResult = addResponseSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(' ');
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { responseText } = parseResult.data;

    const result = await addTicketResponse({
      ticketId: id,
      responderId: req.user.id,
      userRole: req.user.role,
      responseText,
    });

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: result.message });
    }
    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: result.message });
    }

    // Audit Log
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'HELPDESK_RESPONSE_ADDED',
      entityType: 'HelpdeskTicket',
      entityId: id,
      description: `User ${req.user.email} (${req.user.role}) added response to helpdesk ticket ${id}`,
      ipAddress: getClientIp(req),
    });

    return res.status(201).json({
      success: true,
      message: 'Response added to ticket successfully.',
      data: { response: result.response },
    });
  } catch (err) {
    console.error('[helpdesk.controller] Error adding response:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add response to ticket.',
    });
  }
}

/**
 * PATCH /api/helpdesk/tickets/:id/status
 * SYSTEM_ADMIN only
 */
export async function handleUpdateStatus(req, res) {
  try {
    const { id } = req.params;

    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(' ');
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { status } = parseResult.data;

    const result = await updateTicketStatus({
      ticketId: id,
      status,
    });

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: result.message });
    }

    // Audit Log
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'HELPDESK_STATUS_CHANGED',
      entityType: 'HelpdeskTicket',
      entityId: id,
      description: `System Admin ${req.user.email} updated ticket ${id} status to ${status}`,
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      data: { ticket: result.ticket },
    });
  } catch (err) {
    console.error('[helpdesk.controller] Error updating ticket status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket status.',
    });
  }
}
