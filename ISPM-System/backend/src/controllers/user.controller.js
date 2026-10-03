/**
 * controllers/user.controller.js
 * HTTP controllers for user management endpoints.
 */
import { z } from 'zod';
import * as userService from '../services/user.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const SYSTEM_ROLES = ['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'TRAINING_ADMIN', 'EMPLOYEE'];

// Zod schema for user creation
const createUserSchema = z.object({
  firstName: z.string({ required_error: 'First name is required' }).trim().min(1, 'First name cannot be empty').max(100),
  lastName: z.string({ required_error: 'Last name is required' }).trim().min(1, 'Last name cannot be empty').max(100),
  email: z.string({ required_error: 'Email is required' }).trim().email('Please enter a valid email address').max(255),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
  role: z.enum(SYSTEM_ROLES, {
    errorMap: () => ({ message: 'Invalid role specified. Must be one of the four recognized system roles.' }),
  }),
  department: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
});

// Zod schema for updating user profile
const updateUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').max(100).optional(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').max(100).optional(),
  email: z.string().trim().email('Please enter a valid email address').max(255).optional(),
  role: z.enum(SYSTEM_ROLES, {
    errorMap: () => ({ message: 'Invalid role specified. Must be one of the four recognized system roles.' }),
  }).optional(),
  department: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
});

// Zod schema for status update
const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status boolean is required' }),
});

/**
 * GET /api/users
 */
export async function getUsers(req, res, next) {
  try {
    const { search, role, status } = req.query;
    const users = await userService.listUsers({ search, role, status });

    return sendSuccess(res, {
      status: 200,
      message: 'Users retrieved successfully',
      data: { users, total: users.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id
 */
export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.findUserById(id);

    if (!user) {
      return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, {
      status: 200,
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users
 */
export async function createUser(req, res, next) {
  try {
    // 1. Zod input validation
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    // 2. Reject arbitrary fields such as passwordHash
    if (req.body.passwordHash) {
      return sendError(res, { status: 400, message: 'Direct assignment of passwordHash is not allowed.' });
    }

    // 3. Create user
    const newUser = await userService.createUser(parsed.data);

    // 4. Audit Log
    await writeAuditLog({
      action: 'USER_CREATED',
      userId: req.user.id,
      entityType: 'User',
      entityId: newUser.id,
      description: `User account created: ${newUser.email} with role ${newUser.role}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: 'User created successfully',
      data: { user: newUser },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/users/:id
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;

    // Check if password change was attempted through this endpoint
    if (req.body.password !== undefined || req.body.passwordHash !== undefined) {
      return sendError(res, {
        status: 400,
        message: 'Password cannot be modified through this endpoint.',
      });
    }

    // Validate body
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid update data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    if (Object.keys(parsed.data).length === 0) {
      return sendError(res, { status: 400, message: 'No valid update fields provided.' });
    }

    const updatedUser = await userService.updateUser(id, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'USER_UPDATED',
      userId: req.user.id,
      entityType: 'User',
      entityId: updatedUser.id,
      description: `User account updated: ${updatedUser.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/users/:id/status
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'isActive boolean is required.' });
    }

    const { isActive } = parsed.data;
    const updatedUser = await userService.setUserStatus(id, isActive, req.user.id);

    // Audit Log
    const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    await writeAuditLog({
      action,
      userId: req.user.id,
      entityType: 'User',
      entityId: updatedUser.id,
      description: `User account ${isActive ? 'activated' : 'deactivated'}: ${updatedUser.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: updatedUser },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}
