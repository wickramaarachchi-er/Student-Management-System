/**
 * services/policy.service.js
 * Business logic for Information Security Policies, Versioning, and Acknowledgements.
 */
import prisma from '../config/prisma.js';
import { createBulkNotifications, notifyRoleOfEmployeeAction } from './notification.service.js';

/**
 * Helper to determine the current published PolicyVersion for a given policy.
 *
 * Logic:
 * 1. Policy must have status === 'PUBLISHED'.
 * 2. Look for the most recent POLICY_PUBLISHED audit log for this policy to find the exact published versionId.
 * 3. Fallback: match version created on or before policy.publishedAt, or highest versionNumber.
 *
 * @param {string} policyId
 * @returns {Promise<object|null>}
 */
export async function getPublishedVersion(policyId) {
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
    },
  });

  if (!policy || policy.status !== 'PUBLISHED' || !policy.versions.length) {
    return null;
  }

  // 1. Check the most recent POLICY_PUBLISHED audit log for this policy
  const lastPublishLog = await prisma.auditLog.findFirst({
    where: {
      entityType: 'Policy',
      entityId: policyId,
      action: 'POLICY_PUBLISHED',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (lastPublishLog?.description) {
    const versionIdMatch = lastPublishLog.description.match(/versionId:\s*([a-zA-Z0-9]+)/);
    if (versionIdMatch) {
      const matched = policy.versions.find((v) => v.id === versionIdMatch[1]);
      if (matched) return matched;
    }

    const versionNumMatch = lastPublishLog.description.match(/version\s*(\d+)/i);
    if (versionNumMatch) {
      const num = parseInt(versionNumMatch[1], 10);
      const matched = policy.versions.find((v) => v.versionNumber === num);
      if (matched) return matched;
    }
  }

  // 2. Fallback to versions created on or before publishedAt
  if (policy.publishedAt) {
    const pubDate = new Date(policy.publishedAt);
    const eligible = policy.versions.filter((v) => new Date(v.createdAt) <= pubDate);
    if (eligible.length > 0) return eligible[0];
  }

  // 3. Fallback to the latest version
  return policy.versions[0];
}

/**
 * Checks if a policy applies to a given user based on targetDepartment.
 *
 * Rules:
 * - targetDepartment is null or empty string -> Organization-wide (applies to all users)
 * - targetDepartment matches user.department (case-insensitive) -> Applies to user
 *
 * @param {object} policy
 * @param {object} user
 * @returns {boolean}
 */
export function isPolicyApplicableToUser(policy, user) {
  if (!policy.targetDepartment || policy.targetDepartment.trim() === '') {
    return true; // Org-wide
  }
  if (!user.department) {
    return false; // Policy targets a specific dept, user has no dept
  }
  return policy.targetDepartment.trim().toLowerCase() === user.department.trim().toLowerCase();
}

/**
 * Lists policies tailored to user role.
 *
 * Compliance Officer:
 * - Can view all policies (DRAFT, PUBLISHED, ARCHIVED)
 * - Includes versions and acknowledgement totals
 *
 * Employee:
 * - Only PUBLISHED policies applicable to employee's department
 * - Includes current published version and employee's acknowledgement status
 *
 * @param {object} user - Safe user object from req.user
 * @param {object} [filters]
 * @param {string} [filters.search]
 * @param {string} [filters.category]
 * @param {string} [filters.status]
 * @returns {Promise<Array<object>>}
 */
export async function listPolicies(user, filters = {}) {
  const isCompliance = user.role === 'COMPLIANCE_OFFICER';

  const where = {};

  if (isCompliance) {
    if (filters.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(filters.status)) {
      where.status = filters.status;
    }
  } else {
    // Employee only sees PUBLISHED policies
    where.status = 'PUBLISHED';
  }

  if (filters.category && filters.category.trim()) {
    where.category = filters.category.trim();
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const policies = await prisma.policy.findMany({
    where,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
      acknowledgements: {
        where: isCompliance ? {} : { userId: user.id },
        select: {
          id: true,
          userId: true,
          policyVersionId: true,
          acknowledgedAt: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Post-process policies based on role
  if (isCompliance) {
    // For Compliance Officer, attach publishedVersion info and acknowledgement counts
    const results = [];
    for (const p of policies) {
      const pubVersion = p.status === 'PUBLISHED' ? await getPublishedVersion(p.id) : null;
      results.push({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        targetDepartment: p.targetDepartment,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        creator: p.creator,
        versionCount: p.versions.length,
        currentVersion: pubVersion ? { id: pubVersion.id, versionNumber: pubVersion.versionNumber } : null,
        acknowledgementCount: p.acknowledgements.length,
      });
    }
    return results;
  }

  // For Employee: Filter by department applicability and compute acknowledgement status
  const employeePolicies = [];
  for (const p of policies) {
    if (!isPolicyApplicableToUser(p, user)) {
      continue;
    }

    const currentPublishedVer = await getPublishedVersion(p.id);
    if (!currentPublishedVer) {
      continue; // Published policy has no published version
    }

    // Check if employee acknowledged this specific published version
    const ack = p.acknowledgements.find((a) => a.policyVersionId === currentPublishedVer.id);

    employeePolicies.push({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      status: p.status,
      targetDepartment: p.targetDepartment,
      publishedAt: p.publishedAt,
      currentVersion: {
        id: currentPublishedVer.id,
        versionNumber: currentPublishedVer.versionNumber,
        createdAt: currentPublishedVer.createdAt,
      },
      acknowledged: !!ack,
      acknowledgedAt: ack ? ack.acknowledgedAt : null,
    });
  }

  return employeePolicies;
}

/**
 * Retrieves a single policy with details.
 *
 * @param {string} policyId
 * @param {object} user - Safe user object from req.user
 * @returns {Promise<object>}
 */
export async function getPolicyById(policyId, user) {
  const isCompliance = user.role === 'COMPLIANCE_OFFICER';

  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
    },
  });

  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  // Employee checks
  if (!isCompliance) {
    if (policy.status !== 'PUBLISHED') {
      const err = new Error('Policy not found or is not published.');
      err.status = 404;
      throw err;
    }

    if (!isPolicyApplicableToUser(policy, user)) {
      const err = new Error('You do not have permission to view this policy.');
      err.status = 403;
      throw err;
    }

    const currentVersion = await getPublishedVersion(policy.id);
    if (!currentVersion) {
      const err = new Error('No published version found for this policy.');
      err.status = 404;
      throw err;
    }

    // Check user acknowledgement for this published version
    const ack = await prisma.policyAcknowledgement.findUnique({
      where: {
        userId_policyVersionId: {
          userId: user.id,
          policyVersionId: currentVersion.id,
        },
      },
    });

    return {
      id: policy.id,
      title: policy.title,
      description: policy.description,
      category: policy.category,
      status: policy.status,
      targetDepartment: policy.targetDepartment,
      publishedAt: policy.publishedAt,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      currentVersion: {
        id: currentVersion.id,
        versionNumber: currentVersion.versionNumber,
        content: currentVersion.content,
        changedBy: currentVersion.changedBy,
        createdAt: currentVersion.createdAt,
      },
      acknowledged: !!ack,
      acknowledgedAt: ack ? ack.acknowledgedAt : null,
    };
  }

  // Compliance Officer gets complete policy info including all versions
  const currentPublishedVer = policy.status === 'PUBLISHED' ? await getPublishedVersion(policy.id) : null;

  return {
    ...policy,
    currentVersionId: currentPublishedVer ? currentPublishedVer.id : null,
    currentVersionNumber: currentPublishedVer ? currentPublishedVer.versionNumber : null,
  };
}

/**
 * Creates a new policy (Metadata). Starts in DRAFT status.
 *
 * @param {object} policyData
 * @param {string} creatorId
 * @returns {Promise<object>}
 */
export async function createPolicy(policyData, creatorId) {
  return prisma.policy.create({
    data: {
      title: policyData.title.trim(),
      description: policyData.description ? policyData.description.trim() : null,
      category: policyData.category.trim(),
      targetDepartment: policyData.targetDepartment?.trim() || null,
      status: 'DRAFT',
      creatorId,
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      versions: true,
    },
  });
}

/**
 * Updates policy metadata.
 *
 * @param {string} policyId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export async function updatePolicy(policyId, updateData) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  const data = {};
  if (updateData.title !== undefined) data.title = updateData.title.trim();
  if (updateData.description !== undefined) {
    data.description = updateData.description ? updateData.description.trim() : null;
  }
  if (updateData.category !== undefined) data.category = updateData.category.trim();
  if (updateData.targetDepartment !== undefined) {
    data.targetDepartment = updateData.targetDepartment?.trim() || null;
  }

  return prisma.policy.update({
    where: { id: policyId },
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });
}

/**
 * Creates a new policy version for an existing policy.
 *
 * @param {string} policyId
 * @param {object} versionData
 * @param {string} userEmail
 * @returns {Promise<object>}
 */
export async function createPolicyVersion(policyId, versionData, userEmail) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  if (policy.status === 'ARCHIVED') {
    const err = new Error('Cannot add a new version to an archived policy.');
    err.status = 400;
    throw err;
  }

  const versionNumber = Number(versionData.versionNumber);

  // Check unique versionNumber for this policy
  const existing = await prisma.policyVersion.findUnique({
    where: {
      policyId_versionNumber: {
        policyId,
        versionNumber,
      },
    },
  });

  if (existing) {
    const err = new Error(`Version number ${versionNumber} already exists for this policy.`);
    err.status = 409;
    throw err;
  }

  const newVersion = await prisma.policyVersion.create({
    data: {
      policyId,
      versionNumber,
      content: versionData.content,
      changedBy: userEmail,
    },
  });

  return newVersion;
}

/**
 * Publishes a specific policy version.
 *
 * Atomic transaction:
 * - Updates Policy status to PUBLISHED and publishedAt to now()
 * - Notifies matching active employees
 *
 * @param {string} policyId
 * @param {string} versionId
 * @returns {Promise<{ policy: object, version: object }>}
 */
export async function publishPolicyVersion(policyId, versionId) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  const version = await prisma.policyVersion.findUnique({ where: { id: versionId } });
  if (!version || version.policyId !== policyId) {
    const err = new Error('Specified version does not belong to this policy.');
    err.status = 404;
    throw err;
  }

  const now = new Date();

  const updatedPolicy = await prisma.policy.update({
    where: { id: policyId },
    data: {
      status: 'PUBLISHED',
      publishedAt: now,
    },
    include: {
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });

  // Trigger Notifications for matching active Employees
  try {
    const userWhere = {
      role: 'EMPLOYEE',
      isActive: true,
    };
    if (updatedPolicy.targetDepartment && updatedPolicy.targetDepartment.trim() !== '') {
      userWhere.department = updatedPolicy.targetDepartment.trim();
    }

    const matchingEmployees = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (matchingEmployees.length > 0) {
      await createBulkNotifications({
        recipientIds: matchingEmployees.map((e) => e.id),
        title: 'Policy Update Required',
        message: `A new version of "${updatedPolicy.title}" requires your acknowledgement.`,
        type: 'POLICY_PUBLISHED',
        resourceRef: updatedPolicy.id,
      });
    }
  } catch (notifErr) {
    console.error('[policy.service] Failed to send publication notifications:', notifErr.message);
  }

  return { policy: updatedPolicy, version };
}

/**
 * Archives an existing policy.
 *
 * @param {string} policyId
 * @returns {Promise<object>}
 */
export async function archivePolicy(policyId) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  return prisma.policy.update({
    where: { id: policyId },
    data: { status: 'ARCHIVED' },
  });
}

/**
 * Acknowledges the current published version of a policy by an Employee.
 *
 * @param {string} policyId
 * @param {object} user - Employee safe user object
 * @returns {Promise<object>}
 */
export async function acknowledgePolicy(policyId, user) {
  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  if (policy.status !== 'PUBLISHED') {
    const err = new Error('Cannot acknowledge an unpublished or archived policy.');
    err.status = 400;
    throw err;
  }

  // Check department applicability
  if (!isPolicyApplicableToUser(policy, user)) {
    const err = new Error('This policy does not apply to your department.');
    err.status = 403;
    throw err;
  }

  // Resolve current published version
  const currentVersion = await getPublishedVersion(policyId);
  if (!currentVersion) {
    const err = new Error('No published version found for this policy.');
    err.status = 400;
    throw err;
  }

  // Check existing acknowledgement for this version
  const existingAck = await prisma.policyAcknowledgement.findUnique({
    where: {
      userId_policyVersionId: {
        userId: user.id,
        policyVersionId: currentVersion.id,
      },
    },
  });

  if (existingAck) {
    return {
      acknowledgement: existingAck,
      isNew: false,
      version: currentVersion,
    };
  }

  // Create new acknowledgement record
  const newAck = await prisma.policyAcknowledgement.create({
    data: {
      userId: user.id,
      policyId: policy.id,
      policyVersionId: currentVersion.id,
      acknowledgedAt: new Date(),
    },
  });

  await notifyRoleOfEmployeeAction({
    role: 'COMPLIANCE_OFFICER', employeeId: user.id, title: 'Policy Read and Acknowledged',
    message: 'read and acknowledged "' + policy.title + '" (version ' + currentVersion.versionNumber + ').',
    resourceRef: policy.id,
  });
  return {
    acknowledgement: newAck,
    isNew: true,
    version: currentVersion,
  };
}

/**
 * Retrieves the acknowledgement report for the current published version of a policy.
 * (Compliance Officer only)
 *
 * @param {string} policyId
 * @returns {Promise<object>}
 */
export async function getPolicyAcknowledgements(policyId) {
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });

  if (!policy) {
    const err = new Error('Policy not found.');
    err.status = 404;
    throw err;
  }

  const currentVersion = await getPublishedVersion(policyId);
  if (!currentVersion) {
    return {
      policy: { id: policy.id, title: policy.title, status: policy.status },
      currentVersion: null,
      summary: { totalEligible: 0, acknowledged: 0, pending: 0, complianceRate: 0 },
      acknowledgements: [],
    };
  }

  // Find all active employees applicable to this policy
  const userWhere = {
    role: 'EMPLOYEE',
    isActive: true,
  };
  if (policy.targetDepartment && policy.targetDepartment.trim() !== '') {
    userWhere.department = policy.targetDepartment.trim();
  }

  const applicableEmployees = await prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
    },
    orderBy: { lastName: 'asc' },
  });

  // Get all acknowledgements for this policyVersionId
  const acks = await prisma.policyAcknowledgement.findMany({
    where: {
      policyVersionId: currentVersion.id,
    },
    select: {
      userId: true,
      acknowledgedAt: true,
    },
  });

  const ackMap = new Map(acks.map((a) => [a.userId, a.acknowledgedAt]));

  const records = applicableEmployees.map((emp) => {
    const ackDate = ackMap.get(emp.id);
    return {
      userId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department || 'General',
      acknowledged: !!ackDate,
      acknowledgedAt: ackDate || null,
    };
  });

  const acknowledgedCount = records.filter((r) => r.acknowledged).length;
  const totalCount = records.length;
  const complianceRate = totalCount > 0 ? Math.round((acknowledgedCount / totalCount) * 100) : 100;

  return {
    policy: {
      id: policy.id,
      title: policy.title,
      category: policy.category,
      targetDepartment: policy.targetDepartment,
      status: policy.status,
    },
    currentVersion: {
      id: currentVersion.id,
      versionNumber: currentVersion.versionNumber,
      createdAt: currentVersion.createdAt,
    },
    summary: {
      totalEligible: totalCount,
      acknowledged: acknowledgedCount,
      pending: totalCount - acknowledgedCount,
      complianceRate,
    },
    acknowledgements: records,
  };
}
