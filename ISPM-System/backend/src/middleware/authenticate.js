/**
 * middleware/authenticate.js
 * JWT authentication middleware.
 *
 * Usage: router.get('/protected', authenticate, handler)
 *
 * On success, attaches a safe user object to req.user.
 * On failure, responds with HTTP 401.
 *
 * Security guarantees:
 *  - Reads token from Authorization: Bearer <token> only
 *  - Verifies JWT signature and expiry via jsonwebtoken
 *  - Re-loads the user from the database (role cannot be spoofed by token)
 *  - Rejects missing, deactivated, or deleted users
 *  - Never logs the full token or Authorization header
 */
import { verifyToken } from '../utils/jwt.js';
import { getUserById } from '../services/auth.service.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        status: 401,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // 2. Verify JWT (throws on expired / invalid signature)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      const isExpired = jwtErr.name === 'TokenExpiredError';
      return sendError(res, {
        status: 401,
        message: isExpired
          ? 'Your session has expired. Please log in again.'
          : 'Invalid or malformed authentication token.',
      });
    }

    // 3. Load current user from DB (so role/isActive is always fresh)
    const userId = decoded.sub;
    if (!userId) {
      return sendError(res, { status: 401, message: 'Invalid token payload.' });
    }

    const user = await getUserById(userId);

    // 4. Reject if user was deleted or deactivated since token was issued
    if (!user) {
      return sendError(res, {
        status: 401,
        message: 'Account not found or has been deactivated.',
      });
    }

    // 5. Attach safe user to request (no passwordHash)
    req.user = user;

    next();
  } catch (err) {
    next(err); // Unexpected errors → global error handler
  }
}
