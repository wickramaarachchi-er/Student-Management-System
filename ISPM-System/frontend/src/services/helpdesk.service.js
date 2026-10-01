/**
 * services/helpdesk.service.js
 * Frontend service helper for Helpdesk & Security Query endpoints.
 */
import { apiFetch } from './api.js';

/**
 * Fetch tickets list with optional status, priority, and search filters.
 */
export async function getTicketsRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.priority) query.append('priority', params.priority);
  if (params.search) query.append('search', params.search);

  const queryString = query.toString();
  const path = `/helpdesk/tickets${queryString ? `?${queryString}` : ''}`;
  return apiFetch(path, { method: 'GET' });
}

/**
 * Fetch detailed helpdesk ticket with conversation history.
 */
export async function getTicketDetailsRequest(id) {
  return apiFetch(`/helpdesk/tickets/${id}`, { method: 'GET' });
}

/**
 * Create a new helpdesk ticket (EMPLOYEE).
 */
export async function createTicketRequest(data) {
  return apiFetch('/helpdesk/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Add a response/reply to a helpdesk ticket.
 */
export async function addTicketResponseRequest(id, responseText) {
  return apiFetch(`/helpdesk/tickets/${id}/responses`, {
    method: 'POST',
    body: JSON.stringify({ responseText }),
  });
}

/**
 * Update ticket status (SYSTEM_ADMIN).
 */
export async function updateTicketStatusRequest(id, status) {
  return apiFetch(`/helpdesk/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
