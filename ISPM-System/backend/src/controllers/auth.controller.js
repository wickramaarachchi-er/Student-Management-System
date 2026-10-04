/**
 * controllers/auth.controller.js
 * Handles HTTP concerns for authentication routes.
 * Business logic lives in auth.service.js.
 */
import { z } from 'zod';
import { loginUser, changeUserPassword } from '../services/auth.service.js';
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(200),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'New password must be no more than 72 UTF-8 bytes'),
  confirmPassword: z.string().min(1, 'Please confirm your new password').max(200),
}).strict().refine((value) => value.newPassword === value.confirmPassword, {
  message: 'New passwords do not match', path: ['confirmPassword'],
});

export async function changePassword(req, res, next) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, { status: 400, message: parsed.error.errors[0].message,
      errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const { currentPassword, newPassword } = parsed.data;
    await changeUserPassword(req.user.id, currentPassword, newPassword);
    await writeAuditLog({
      userId: req.user.id, userEmail: req.user.email, action: 'PASSWORD_CHANGED',
      entityType: 'User', entityId: req.user.id,
      description: 'User changed their own password', ipAddress: getClientIp(req),
    });
    return sendSuccess(res, { message: 'Your password has been changed successfully.' });
  } catch (err) {
    next(err);
  }
}
