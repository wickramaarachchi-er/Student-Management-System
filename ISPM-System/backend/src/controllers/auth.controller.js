/**
 * controllers/auth.controller.js
 * Handles HTTP concerns for authentication routes.
 * Business logic lives in auth.service.js.
 */
import { z } from 'zod';
import { loginUser } from '../services/auth.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/* ── Validation schemas ──────────────────────────────────── */

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .max(255),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(200),
});

/* ── Controllers ─────────────────────────────────────────── */

/**
 * POST /api/auth/login
 *
 * Validates credentials, signs a JWT, records an audit entry.
 * Generic error message prevents email/password enumeration.
 */
export async function login(req, res, next) {
  const ip = getClientIp(req);

  // 1. Validate request body with Zod
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, {
      status: 400,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { email, password } = parsed.data;

  try {
    // 2. Attempt login (throws 401 on failure)
    const { token, user } = await loginUser(email, password);

    // 3. Audit: successful login
    await writeAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      description: `User logged in successfully`,
      ipAddress: ip,
    });

    // 4. Respond – token + safe user (no passwordHash)
    return sendSuccess(res, {
      status: 200,
      message: 'Login successful',
      data: { token, user },
    });
  } catch (err) {
    // 5. Audit: failed login attempt (no password stored)
    await writeAuditLog({
      userId: null,
      userEmail: email.trim().toLowerCase(),
      action: 'LOGIN_FAILED',
      entityType: 'User',
      entityId: null,
      description: err.message === 'Invalid email or password'
        ? 'Failed login attempt – invalid credentials'
        : `Failed login attempt – ${err.message}`,
      ipAddress: ip,
    });

    // Surface 401s directly; unexpected errors go to global handler
    if (err.status === 401) {
      return sendError(res, { status: 401, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user's profile.
 * Requires the authenticate middleware to run first.
 */
export async function getMe(req, res) {
  // req.user is populated by authenticate middleware (no passwordHash)
  return sendSuccess(res, {
    status: 200,
    message: 'Current user retrieved successfully',
    data: { user: req.user },
  });
}
