/**
 * controllers/dashboard.controller.js
 * Controller handling dashboard summary endpoint.
 */
import { getDashboardDataForUser } from '../services/dashboard.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * GET /api/dashboard
 * Authenticated user gets dashboard payload specific to their role.
 */
export async function getDashboardSummary(req, res) {
  try {
    const data = await getDashboardDataForUser(req.user);
    return sendSuccess(res, {
      message: 'Dashboard summary retrieved successfully.',
      data,
    });
  } catch (err) {
    console.error('[DashboardController] getDashboardSummary error:', err);
    return sendError(res, { status: 500, message: 'Internal server error while retrieving dashboard metrics.' });
  }
}
