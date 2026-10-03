/**
 * services/training.service.js
 * Business logic for Training Modules and Employee Training Progress.
 */
import prisma from '../config/prisma.js';
import { createBulkNotifications } from './notification.service.js';

/**
 * List training modules based on user role and filters.
 *
 * @param {object} user - Safe user object (req.user)
 * @param {object} filters - { search, status }
 * @returns {Promise<Array>}
 */
export async function listTrainingModules(user, filters = {}) {
  const isTrainingAdmin = user.role === 'TRAINING_ADMIN';

  const where = {};

  if (!isTrainingAdmin) {
    // Employees ONLY see published modules
    where.isPublished = true;
  } else {
    // Admin filtering
    if (filters.status === 'published') {
      where.isPublished = true;
    } else if (filters.status === 'draft') {
      where.isPublished = false;
    }
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const modules = await prisma.trainingModule.findMany({
    where,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      progress: isTrainingAdmin
        ? {
            select: {
              id: true,
              userId: true,
              status: true,
              progressPercent: true,
              completedAt: true,
            },
          }
        : {
            where: { userId: user.id },
            select: {
              id: true,
              status: true,
              progressPercent: true,
              assignedAt: true,
              completedAt: true,
            },
          },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (isTrainingAdmin) {
    // Attach statistics for training admin
    return modules.map((m) => {
      const totalStarted = m.progress.length;
      const completed = m.progress.filter((p) => p.status === 'COMPLETED').length;
      const inProgress = m.progress.filter((p) => p.status === 'IN_PROGRESS').length;
      const notStarted = m.progress.filter((p) => p.status === 'NOT_STARTED').length;

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        content: m.content,
        resourceUrl: m.resourceUrl,
        creatorId: m.creatorId,
        creator: m.creator,
        isPublished: m.isPublished,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        stats: {
          totalAssigned: totalStarted,
          completed,
          inProgress,
          notStarted,
        },
      };
    });
  }

  // Employee: attach personal progress
  return modules.map((m) => {
    const userProgress = m.progress[0] || null;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      content: m.content,
      resourceUrl: m.resourceUrl,
      creatorId: m.creatorId,
      creator: m.creator,
      isPublished: m.isPublished,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      userProgress: userProgress
        ? {
            id: userProgress.id,
            status: userProgress.status,
            progressPercent: userProgress.progressPercent,
            assignedAt: userProgress.assignedAt,
            completedAt: userProgress.completedAt,
          }
        : {
            status: 'NOT_STARTED',
            progressPercent: 0,
            assignedAt: null,
            completedAt: null,
          },
    };
  });
}

/**
 * Get a single training module by ID.
 *
 * @param {string} id
 * @param {object} user - Safe user object (req.user)
 * @returns {Promise<object>}
 */
export async function getTrainingModuleById(id, user) {
  const isTrainingAdmin = user.role === 'TRAINING_ADMIN';

  const module = await prisma.trainingModule.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!module) {
    const err = new Error('Training module not found.');
    err.status = 404;
    throw err;
  }

  // Employee check: draft modules must not be accessible
  if (!isTrainingAdmin && !module.isPublished) {
    const err = new Error('Training module not found or is not published.');
    err.status = 404;
    throw err;
  }

  if (isTrainingAdmin) {
    // Return module details + stats
    const progressRecords = await prisma.trainingProgress.findMany({
      where: { trainingModuleId: id },
    });
    const completed = progressRecords.filter((p) => p.status === 'COMPLETED').length;
    const inProgress = progressRecords.filter((p) => p.status === 'IN_PROGRESS').length;
    const notStarted = progressRecords.filter((p) => p.status === 'NOT_STARTED').length;

    return {
      ...module,
      stats: {
        totalAssigned: progressRecords.length,
        completed,
        inProgress,
        notStarted,
      },
    };
  }

  // Employee: fetch employee's progress
  const userProgress = await prisma.trainingProgress.findUnique({
    where: {
      userId_trainingModuleId: {
        userId: user.id,
        trainingModuleId: id,
      },
    },
  });

  return {
    ...module,
    userProgress: userProgress
      ? {
          id: userProgress.id,
          status: userProgress.status,
          progressPercent: userProgress.progressPercent,
          assignedAt: userProgress.assignedAt,
          completedAt: userProgress.completedAt,
        }
      : {
          status: 'NOT_STARTED',
          progressPercent: 0,
          assignedAt: null,
          completedAt: null,
        },
  };
}

/**
 * Create a new training module (TRAINING_ADMIN only).
 *
 * @param {object} data - { title, description, content, resourceUrl }
 * @param {string} creatorId
 * @returns {Promise<object>}
 */
export async function createTrainingModule(data, creatorId) {
  return prisma.trainingModule.create({
    data: {
      title: data.title,
      description: data.description || null,
      content: data.content || null,
      resourceUrl: data.resourceUrl || null,
      creatorId,
      isPublished: false,
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

/**
 * Update an existing training module (TRAINING_ADMIN only).
 *
 * @param {string} id
 * @param {object} data - { title, description, content, resourceUrl }
 * @returns {Promise<object>}
 */
export async function updateTrainingModule(id, data) {
  const existing = await prisma.trainingModule.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Training module not found.');
    err.status = 404;
    throw err;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.resourceUrl !== undefined) updateData.resourceUrl = data.resourceUrl;

  return prisma.trainingModule.update({
    where: { id },
    data: updateData,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

/**
 * Publish a training module (TRAINING_ADMIN only).
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function publishTrainingModule(id) {
  const existing = await prisma.trainingModule.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Training module not found.');
    err.status = 404;
    throw err;
  }

  if (existing.isPublished) {
    return existing;
  }

  const updatedModule = await prisma.trainingModule.update({
    where: { id },
    data: { isPublished: true },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // Notify active Employees about new training module
  try {
    const activeEmployees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: { id: true },
    });

    if (activeEmployees.length > 0) {
      await createBulkNotifications({
        recipientIds: activeEmployees.map((e) => e.id),
        title: 'New Training Available',
        message: `"${updatedModule.title}" is now available for completion.`,
        type: 'TRAINING_ASSIGNED',
        resourceRef: updatedModule.id,
      });
    }
  } catch (notifErr) {
    console.error('[training.service] Failed to send training notifications:', notifErr.message);
  }

  return updatedModule;
}

/**
 * Archive/deactivate a training module (TRAINING_ADMIN only).
 * Sets isPublished: false, safely hiding it from active employees while preserving all progress history.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function archiveTrainingModule(id) {
  const existing = await prisma.trainingModule.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Training module not found.');
    err.status = 404;
    throw err;
  }

  return prisma.trainingModule.update({
    where: { id },
    data: { isPublished: false },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

/**
 * Start training for the authenticated employee.
 *
 * @param {string} moduleId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function startTraining(moduleId, userId) {
  const module = await prisma.trainingModule.findUnique({ where: { id: moduleId } });
  if (!module || !module.isPublished) {
    const err = new Error('Training module not found or is not available.');
    err.status = 404;
    throw err;
  }

  const existing = await prisma.trainingProgress.findUnique({
    where: {
      userId_trainingModuleId: {
        userId,
        trainingModuleId: moduleId,
      },
    },
  });

  if (existing) {
    // If already in progress or completed, return cleanly without duplicating
    if (existing.status === 'COMPLETED' || existing.status === 'IN_PROGRESS') {
      return existing;
    }

    // If NOT_STARTED, transition to IN_PROGRESS
    return prisma.trainingProgress.update({
      where: { id: existing.id },
      data: {
        status: 'IN_PROGRESS',
        progressPercent: Math.max(existing.progressPercent, 50),
      },
    });
  }

  // Create new progress record
  return prisma.trainingProgress.create({
    data: {
      userId,
      trainingModuleId: moduleId,
      status: 'IN_PROGRESS',
      progressPercent: 50,
      assignedAt: new Date(),
    },
  });
}

/**
 * Complete training for the authenticated employee.
 *
 * @param {string} moduleId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function completeTraining(moduleId, userId) {
  const module = await prisma.trainingModule.findUnique({ where: { id: moduleId } });
  if (!module || !module.isPublished) {
    const err = new Error('Training module not found or is not available.');
    err.status = 404;
    throw err;
  }

  const existing = await prisma.trainingProgress.findUnique({
    where: {
      userId_trainingModuleId: {
        userId,
        trainingModuleId: moduleId,
      },
    },
  });

  const now = new Date();

  if (existing) {
    // If already COMPLETED, idempotent return
    if (existing.status === 'COMPLETED') {
      return existing;
    }

    return prisma.trainingProgress.update({
      where: { id: existing.id },
      data: {
        status: 'COMPLETED',
        progressPercent: 100,
        completedAt: now,
      },
    });
  }

  // If completing directly without explicit start
  return prisma.trainingProgress.create({
    data: {
      userId,
      trainingModuleId: moduleId,
      status: 'COMPLETED',
      progressPercent: 100,
      assignedAt: now,
      completedAt: now,
    },
  });
}

/**
 * Get personal training progress overview for an authenticated employee.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getMyProgress(userId) {
  // Fetch all published modules
  const publishedModules = await prisma.trainingModule.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      resourceUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all user's progress records
  const userProgressRecords = await prisma.trainingProgress.findMany({
    where: { userId },
    include: {
      trainingModule: {
        select: {
          id: true,
          title: true,
          description: true,
          resourceUrl: true,
          isPublished: true,
        },
      },
    },
  });

  const progressMap = new Map();
  for (const prog of userProgressRecords) {
    progressMap.set(prog.trainingModuleId, prog);
  }

  // Map each published module with the user's progress
  const modulesWithProgress = publishedModules.map((m) => {
    const prog = progressMap.get(m.id);
    return {
      trainingModule: m,
      status: prog ? prog.status : 'NOT_STARTED',
      progressPercent: prog ? prog.progressPercent : 0,
      assignedAt: prog ? prog.assignedAt : null,
      completedAt: prog ? prog.completedAt : null,
    };
  });

  // Calculate summary counts
  const total = publishedModules.length;
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const item of modulesWithProgress) {
    if (item.status === 'COMPLETED') completed++;
    else if (item.status === 'IN_PROGRESS') inProgress++;
    else notStarted++;
  }

  return {
    summary: {
      total,
      completed,
      inProgress,
      notStarted,
    },
    progress: modulesWithProgress,
  };
}

/**
 * Get training progress report for a specific module (TRAINING_ADMIN only).
 *
 * @param {string} moduleId
 * @returns {Promise<object>}
 */
export async function getModuleProgressReport(moduleId) {
  const module = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!module) {
    const err = new Error('Training module not found.');
    err.status = 404;
    throw err;
  }

  // Fetch all active employees
  const employees = await prisma.user.findMany({
    where: {
      role: 'EMPLOYEE',
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  // Fetch progress records for this module
  const progressRecords = await prisma.trainingProgress.findMany({
    where: { trainingModuleId: moduleId },
    select: {
      id: true,
      userId: true,
      status: true,
      progressPercent: true,
      assignedAt: true,
      completedAt: true,
    },
  });

  const progressMap = new Map();
  for (const p of progressRecords) {
    progressMap.set(p.userId, p);
  }

  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  const employeeProgress = employees.map((emp) => {
    const prog = progressMap.get(emp.id);
    const status = prog ? prog.status : 'NOT_STARTED';
    const progressPercent = prog ? prog.progressPercent : 0;
    const assignedAt = prog ? prog.assignedAt : null;
    const completedAt = prog ? prog.completedAt : null;

    if (status === 'COMPLETED') completedCount++;
    else if (status === 'IN_PROGRESS') inProgressCount++;
    else notStartedCount++;

    return {
      employeeId: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      status,
      progressPercent,
      assignedAt,
      completedAt,
    };
  });

  return {
    module: {
      id: module.id,
      title: module.title,
      description: module.description,
      isPublished: module.isPublished,
      createdAt: module.createdAt,
    },
    summary: {
      totalEmployees: employees.length,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
    },
    employees: employeeProgress,
  };
}
