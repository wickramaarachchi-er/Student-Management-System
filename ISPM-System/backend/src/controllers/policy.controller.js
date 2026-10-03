/**
 * controllers/policy.controller.js
 * HTTP controllers for Information Security Policy Management and Acknowledgements.
 */
import { z } from 'zod';
import * as policyService from '../services/policy.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Zod Schemas
const createPolicySchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(1, 'Title cannot be empty').max(255),
  description: z.string().trim().optional().nullable(),
  category: z.string({ required_error: 'Category is required' }).trim().min(1, 'Category cannot be empty').max(100),
  targetDepartment: z.string().trim().max(100).optional().nullable(),
});

const updatePolicySchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1, 'Category cannot be empty').max(100).optional(),
  targetDepartment: z.string().trim().max(100).optional().nullable(),
});

const createVersionSchema = z.object({
  versionNumber: z.coerce.number({ required_error: 'Version number is required' }).int().positive('Version number must be a positive integer'),
  content: z.string({ required_error: 'Content is required' }).trim().min(1, 'Policy content cannot be empty'),
  changeSummary: z.string().trim().optional().nullable(),
});

/**
 * GET /api/policies
 */
export async function getPolicies(req, res, next) {
  try {
    const { search, category, status } = req.query;
    const policies = await policyService.listPolicies(req.user, { search, category, status });

    return sendSuccess(res, {
      status: 200,
      message: 'Policies retrieved successfully',
      data: { policies, total: policies.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/policies/:id
 */
export async function getPolicy(req, res, next) {
  try {
    const { id } = req.params;
    const policy = await policyService.getPolicyById(id, req.user);

    return sendSuccess(res, {
      status: 200,
      message: 'Policy retrieved successfully',
      data: { policy },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/policies (COMPLIANCE_OFFICER only)
 */
export async function createPolicy(req, res, next) {
  try {
    const parsed = createPolicySchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const newPolicy = await policyService.createPolicy(parsed.data, req.user.id);

    // Audit Log
    await writeAuditLog({
      action: 'POLICY_CREATED',
      userId: req.user.id,
      entityType: 'Policy',
      entityId: newPolicy.id,
      description: `Policy created: "${newPolicy.title}" (${newPolicy.category}) by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Policy created successfully',
      data: { policy: newPolicy },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/policies/:id (COMPLIANCE_OFFICER only)
 */
export async function updatePolicy(req, res, next) {
  try {
    const { id } = req.params;

    const parsed = updatePolicySchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid update data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    if (Object.keys(parsed.data).length === 0) {
      return sendError(res, { status: 400, message: 'No valid update fields provided.' });
    }

    const updated = await policyService.updatePolicy(id, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'POLICY_UPDATED',
      userId: req.user.id,
      entityType: 'Policy',
      entityId: updated.id,
      description: `Policy metadata updated: "${updated.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Policy updated successfully',
      data: { policy: updated },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/policies/:id/versions (COMPLIANCE_OFFICER only)
 */
export async function createPolicyVersion(req, res, next) {
  try {
    const { id } = req.params;

    const parsed = createVersionSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid version data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const newVersion = await policyService.createPolicyVersion(id, parsed.data, req.user.email);

    // Audit Log
    await writeAuditLog({
      action: 'POLICY_VERSION_CREATED',
      userId: req.user.id,
      entityType: 'PolicyVersion',
      entityId: newVersion.id,
      description: `Policy version ${newVersion.versionNumber} created for policy ${id} by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: `Version ${newVersion.versionNumber} created successfully`,
      data: { version: newVersion },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/policies/:id/versions/:versionId/publish (COMPLIANCE_OFFICER only)
 */
export async function publishPolicyVersion(req, res, next) {
  try {
    const { id, versionId } = req.params;

    const { policy, version } = await policyService.publishPolicyVersion(id, versionId);

    // Audit Log (records versionId for unambiguous identification)
    await writeAuditLog({
      action: 'POLICY_PUBLISHED',
      userId: req.user.id,
      entityType: 'Policy',
      entityId: policy.id,
      description: `Policy "${policy.title}" published with version ${version.versionNumber} (versionId: ${version.id}) by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: `Policy published with version ${version.versionNumber} successfully`,
      data: { policy, publishedVersion: version },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/policies/:id/archive (COMPLIANCE_OFFICER only)
 */
export async function archivePolicy(req, res, next) {
  try {
    const { id } = req.params;

    const archived = await policyService.archivePolicy(id);

    // Audit Log
    await writeAuditLog({
      action: 'POLICY_ARCHIVED',
      userId: req.user.id,
      entityType: 'Policy',
      entityId: archived.id,
      description: `Policy archived: "${archived.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Policy archived successfully',
      data: { policy: archived },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/policies/:id/acknowledge (EMPLOYEE only)
 */
export async function acknowledgePolicy(req, res, next) {
  try {
    const { id } = req.params;

    const result = await policyService.acknowledgePolicy(id, req.user);

    // Audit Log if newly acknowledged
    if (result.isNew) {
      await writeAuditLog({
        action: 'POLICY_ACKNOWLEDGED',
        userId: req.user.id,
        entityType: 'PolicyAcknowledgement',
        entityId: result.acknowledgement.id,
        description: `Policy "${id}" version ${result.version.versionNumber} acknowledged by ${req.user.email}`,
        ipAddress: getClientIp(req),
      });
    }

    return sendSuccess(res, {
      status: result.isNew ? 201 : 200,
      message: result.isNew ? 'Policy acknowledged successfully' : 'Policy version already acknowledged',
      data: {
        acknowledgement: result.acknowledgement,
        isNew: result.isNew,
      },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/policies/:id/acknowledgements (COMPLIANCE_OFFICER only)
 */
export async function getPolicyAcknowledgements(req, res, next) {
  try {
    const { id } = req.params;

    const report = await policyService.getPolicyAcknowledgements(id);

    return sendSuccess(res, {
      status: 200,
      message: 'Policy acknowledgement report retrieved successfully',
      data: report,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}
