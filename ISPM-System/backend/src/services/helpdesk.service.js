/**
 * services/helpdesk.service.js
 * Business logic for Helpdesk tickets and responses.
 */
import prisma from '../config/prisma.js';
import { createNotification, createBulkNotifications, notifyRoleOfEmployeeAction } from './notification.service.js';

const USER_SELECT_SAFE = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
};

/**
 * Lists tickets depending on user role.
 * EMPLOYEE: Only tickets created by user.
 * SYSTEM_ADMIN: All tickets.
 */
export async function getTicketsList({ userId, userRole, status, priority, search }) {
  const where = {};

  // Ownership filter for Employees
  if (userRole === 'EMPLOYEE') {
    where.creatorId = userId;
  }

  // Enum filters
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }

  // Search filter (subject or description)
  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [
      { subject: { contains: term } },
      { description: { contains: term } },
    ];
  }

  const tickets = await prisma.helpdeskTicket.findMany({
    where,
    include: {
      creator: { select: USER_SELECT_SAFE },
      responses: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { responder: { select: USER_SELECT_SAFE } },
      },
      _count: { select: { responses: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return tickets;
}

/**
 * Retrieves a single ticket with full conversation history.
 * Checks ownership if user is an Employee.
 */
export async function getTicketById(ticketId, { userId, userRole }) {
  const ticket = await prisma.helpdeskTicket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: USER_SELECT_SAFE },
      responses: {
        orderBy: { createdAt: 'asc' },
        include: { responder: { select: USER_SELECT_SAFE } },
      },
    },
  });

  if (!ticket) {
    return { error: 'NOT_FOUND', message: 'Helpdesk ticket not found.' };
  }

  // Ownership verification: Employees can ONLY view their own ticket
  if (userRole === 'EMPLOYEE' && ticket.creatorId !== userId) {
    return { error: 'FORBIDDEN', message: 'Access denied to this helpdesk ticket.' };
  }

  return { ticket };
}

/**
 * Creates a new helpdesk ticket (EMPLOYEE).
 */
export async function createTicket({ creatorId, subject, description, priority = 'MEDIUM' }) {
  const ticket = await prisma.helpdeskTicket.create({
    data: {
      creatorId,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'OPEN',
    },
    include: {
      creator: { select: USER_SELECT_SAFE },
    },
  });

  await notifyRoleOfEmployeeAction({
    role: 'SYSTEM_ADMIN', employeeId: creatorId, title: 'New Helpdesk Ticket',
    message: 'raised a ticket: "' + ticket.subject + '" (' + ticket.priority + ' priority).',
    type: 'TICKET_UPDATE', resourceRef: ticket.id,
  });
  return ticket;
}

/**
 * Adds a response to a helpdesk ticket.
 * SYSTEM_ADMIN: can reply to any ticket.
 * EMPLOYEE: can reply ONLY to own ticket.
 */
export async function addTicketResponse({ ticketId, responderId, userRole, responseText }) {
  const ticket = await prisma.helpdeskTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { error: 'NOT_FOUND', message: 'Helpdesk ticket not found.' };
  }

  // Ownership verification for Employees
  if (userRole === 'EMPLOYEE' && ticket.creatorId !== responderId) {
    return { error: 'FORBIDDEN', message: 'You cannot reply to another user\'s ticket.' };
  }

  const response = await prisma.ticketResponse.create({
    data: {
      ticketId,
      responderId,
      responseText: responseText.trim(),
    },
    include: {
      responder: { select: USER_SELECT_SAFE },
    },
  });

  // Touch ticket updatedAt & optionally update status if admin replies and ticket was OPEN
  let nextStatus = ticket.status;
  if (userRole === 'SYSTEM_ADMIN' && ticket.status === 'OPEN') {
    nextStatus = 'IN_PROGRESS';
  }

  await prisma.helpdeskTicket.update({
    where: { id: ticketId },
    data: {
      status: nextStatus,
      updatedAt: new Date(),
    },
  });

  // Trigger Notification for recipient(s)
  try {
    if (userRole === 'SYSTEM_ADMIN') {
      // Admin replied -> Notify ticket owner if different from responder
      if (ticket.creatorId && ticket.creatorId !== responderId) {
        await createNotification({
          recipientId: ticket.creatorId,
          title: 'Helpdesk Reply',
          message: 'A System Administrator replied to your security query.',
          type: 'TICKET_UPDATE',
          resourceRef: ticketId,
        });
      }
    } else {
      // Employee replied -> Notify active System Admins
      const activeAdmins = await prisma.user.findMany({
        where: { role: 'SYSTEM_ADMIN', isActive: true },
        select: { id: true },
      });

      const adminIds = activeAdmins.map((a) => a.id).filter((id) => id !== responderId);
      if (adminIds.length > 0) {
        await createBulkNotifications({
          recipientIds: adminIds,
          title: 'Helpdesk Follow-up Reply',
          message: `An employee replied to helpdesk ticket: "${ticket.subject}".`,
          type: 'TICKET_UPDATE',
          resourceRef: ticketId,
        });
      }
    }
  } catch (notifErr) {
    console.error('[helpdesk.service] Failed to send ticket response notifications:', notifErr.message);
  }

  return { response };
}

/**
 * Updates ticket status (SYSTEM_ADMIN only).
 */
export async function updateTicketStatus({ ticketId, status }) {
  const ticket = await prisma.helpdeskTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { error: 'NOT_FOUND', message: 'Helpdesk ticket not found.' };
  }

  const updatedTicket = await prisma.helpdeskTicket.update({
    where: { id: ticketId },
    data: {
      status,
      updatedAt: new Date(),
    },
    include: {
      creator: { select: USER_SELECT_SAFE },
    },
  });

  return { ticket: updatedTicket };
}
