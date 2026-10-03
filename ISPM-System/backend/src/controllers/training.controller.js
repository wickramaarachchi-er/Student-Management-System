/**
 * controllers/training.controller.js
 * HTTP controllers for Training Management and Employee Training Progress.
 */
import { z } from 'zod';
import * as trainingService from '../services/training.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Zod Schemas
const createTrainingSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(1, 'Title cannot be empty').max(255),
  description: z.string().trim().optional().nullable(),
  content: z.string().trim().optional().nullable(),
  resourceUrl: z.string().trim().max(500, 'Resource URL must be 500 characters or less').optional().nullable(),
});

const updateTrainingSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().trim().optional().nullable(),
  content: z.string().trim().optional().nullable(),
  resourceUrl: z.string().trim().max(500, 'Resource URL must be 500 characters or less').optional().nullable(),
});

/**
 * GET /api/training
 * TRAINING_ADMIN: returns all modules with management stats
 * EMPLOYEE: returns available published modules with employee progress
 */
export async function getTrainingModules(req, res, next) {
  try {
    const { search, status } = req.query;
    const modules = await trainingService.listTrainingModules(req.user, { search, status });

    return sendSuccess(res, {
      status: 200,
      message: 'Training modules retrieved successfully',
      data: { modules, total: modules.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/training/my-progress
 * EMPLOYEE only: returns personal training progress overview
 */
export async function getMyProgress(req, res, next) {
  try {
    const data = await trainingService.getMyProgress(req.user.id);

    return sendSuccess(res, {
      status: 200,
      message: 'Personal training progress retrieved successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/training/:id
 * Returns training module details.
 */
export async function getTrainingModule(req, res, next) {
  try {
    const { id } = req.params;
    const module = await trainingService.getTrainingModuleById(id, req.user);

    return sendSuccess(res, {
      status: 200,
      message: 'Training module retrieved successfully',
      data: { module },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/training
 * TRAINING_ADMIN only: create new module
 */
export async function createTrainingModule(req, res, next) {
  try {
    const parsed = createTrainingSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const newModule = await trainingService.createTrainingModule(parsed.data, req.user.id);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_CREATED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: newModule.id,
      description: `Training module created: "${newModule.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Training module created successfully',
      data: { module: newModule },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/training/:id
 * TRAINING_ADMIN only: update module metadata / content
 */
export async function updateTrainingModule(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = updateTrainingSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const updated = await trainingService.updateTrainingModule(id, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_UPDATED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: updated.id,
      description: `Training module updated: "${updated.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Training module updated successfully',
      data: { module: updated },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/training/:id/publish
 * TRAINING_ADMIN only: publish module
 */
export async function publishTrainingModule(req, res, next) {
  try {
    const { id } = req.params;
    const published = await trainingService.publishTrainingModule(id);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_PUBLISHED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: published.id,
      description: `Training module published: "${published.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Training module published successfully',
      data: { module: published },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/training/:id/archive
 * TRAINING_ADMIN only: archive/deactivate module
 */
export async function archiveTrainingModule(req, res, next) {
  try {
    const { id } = req.params;
    const archived = await trainingService.archiveTrainingModule(id);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_ARCHIVED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: archived.id,
      description: `Training module archived/deactivated: "${archived.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Training module archived successfully',
      data: { module: archived },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/training/:id/start
 * EMPLOYEE only: start training module
 */
export async function startTraining(req, res, next) {
  try {
    const { id } = req.params;
    // Always use req.user.id - never trust client input
    const progress = await trainingService.startTraining(id, req.user.id);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_STARTED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: id,
      description: `Training started by ${req.user.email} (progressId: ${progress.id})`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Training started successfully',
      data: { progress },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/training/:id/complete
 * EMPLOYEE only: complete training module content
 */
export async function completeTraining(req, res, next) {
  try {
    const { id } = req.params;
    // Always use req.user.id - never trust client input
    const progress = await trainingService.completeTraining(id, req.user.id);

    // Audit Log
    await writeAuditLog({
      action: 'TRAINING_COMPLETED',
      userId: req.user.id,
      entityType: 'TrainingModule',
      entityId: id,
      description: `Training content marked complete by ${req.user.email} (progressId: ${progress.id})`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Training marked as completed successfully',
      data: { progress },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/training/:id/progress
 * TRAINING_ADMIN only: progress report for a module
 */
export async function getModuleProgressReport(req, res, next) {
  try {
    const { id } = req.params;
    const report = await trainingService.getModuleProgressReport(id);

    return sendSuccess(res, {
      status: 200,
      message: 'Training progress report retrieved successfully',
      data: report,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}
