/**
 * middleware/authorize.js
 * Role-Based Access Control (RBAC) middleware factory.
 *
 * Usage (after authenticate middleware):
 *   router.get('/admin-only', authenticate, authorizeRoles('SYSTEM_ADMIN'), handler)
 *   router.get('/multi-role', authenticate, authorizeRoles('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER'), handler)
 *
 * Returns:
 *   401 – if no authenticated user is present (authenticate not applied)
 *   403 – if the authenticated user's role is not in the allowed list
 *
 * Role is always read from req.user (populated by authenticate middleware
 * from the database), never from the JWT payload directly.
 */
import { sendError } from '../utils/apiResponse.js';

/**
 * Valid system roles – kept here as the single source of truth for RBAC.
 * @type {readonly string[]}
 */
export const ROLES = Object.freeze([
  'SYSTEM_ADMIN',
  'COMPLIANCE_OFFICER',
  'TRAINING_ADMIN',
  'EMPLOYEE',
]);

/**
 * Returns an Express middleware that restricts access to the specified roles.
 *
 * @param {...string} allowedRoles – one or more role names from ROLES
 * @returns {import('express').RequestHandler}
 */
export function authorizeRoles(...allowedRoles) {
  // Validate at startup that only known roles are passed
  for (const role of allowedRoles) {
    if (!ROLES.includes(role)) {
      throw new Error(`authorizeRoles: unknown role "${role}"`);
    }
  }

  return function roleGuard(req, res, next) {
    // Guard: authenticate middleware must run first
    if (!req.user) {
      return sendError(res, {
        status: 401,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, {
        status: 403,
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
}
