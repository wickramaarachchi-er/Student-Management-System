/**
 * services/compliance.service.js
 * Core business logic and calculations for ISPM Compliance Tracking & Reporting.
 *
 * Rules:
 *  - Calculates compliance derived 100% from live system evidence (Policy Acknowledgements,
 *    Training Progress, and Quiz Attempts).
 *  - No redundant database tables are created.
 *  - Prevents double-counting: Each current requirement counts exactly once.
 *  - Handles department-targeted policies appropriately.
 *  - Old-version policy acknowledgements do NOT satisfy the current version requirement.
 *  - Unfinished or failed quiz attempts do NOT satisfy the quiz pass requirement.
 *  - Supports safe NO_REQUIREMENTS status when zero requirements apply.
 */
import prisma from '../config/prisma.js';

/**
 * Helper to fetch all base published resources needed for compliance calculations.
 * Used for batch processing to avoid N+1 database queries.
 */
async function fetchComplianceBaseData() {
  const [policies, trainingModules, quizzes] = await Promise.all([
    // Active / Published Policies with their latest version
    prisma.policy.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    }),
    // Published Training Modules
    prisma.trainingModule.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),
    // Published Quizzes with questions
    prisma.quiz.findMany({
      where: {
        trainingModule: { isPublished: true },
        questions: { some: {} },
      },
      include: {
        trainingModule: { select: { id: true, title: true, isPublished: true } },
        questions: { select: { id: true } },
      },
    }),
  ]);

  // Filter out policies without versions
  const validPolicies = policies.filter((p) => p.versions && p.versions.length > 0);

  return {
    policies: validPolicies,
    trainingModules,
    quizzes,
  };
}

/**
 * Calculates detailed compliance and evidence for a single employee.
 *
 * @param {object} employee - User record
 * @param {object} baseData - { policies, trainingModules, quizzes }
 * @returns {Promise<object>}
 */
export async function calculateSingleEmployeeCompliance(employee, baseData = null) {
  if (!baseData) {
    baseData = await fetchComplianceBaseData();
  }

  const { policies, trainingModules, quizzes } = baseData;

  // 1. Filter policies applicable to employee's department
  const applicablePolicies = policies.filter((p) => {
    if (!p.targetDepartment || p.targetDepartment.trim() === '' || p.targetDepartment.trim().toLowerCase() === 'all') {
      return true;
    }
    return employee.department && employee.department.trim().toLowerCase() === p.targetDepartment.trim().toLowerCase();
  });

  const applicableTrainings = trainingModules;
  const applicableQuizzes = quizzes;

  // 2. Fetch employee evidence from database
  const [acknowledgements, trainingProgresses, passedAttempts, allAttempts] = await Promise.all([
    prisma.policyAcknowledgement.findMany({
      where: { userId: employee.id },
      select: { policyId: true, policyVersionId: true, acknowledgedAt: true },
    }),
    prisma.trainingProgress.findMany({
      where: { userId: employee.id },
      select: { trainingModuleId: true, status: true, assignedAt: true, completedAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId: employee.id,
        isPassed: true,
        answers: { some: {} },
      },
      select: { quizId: true, score: true, isPassed: true, submittedAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId: employee.id,
        answers: { some: {} },
      },
      select: { quizId: true, score: true, isPassed: true, submittedAt: true },
      orderBy: { submittedAt: 'desc' },
    }),
  ]);

  // Quick lookup maps
  const ackMap = new Map(); // policyId -> { policyVersionId, acknowledgedAt }
  for (const ack of acknowledgements) {
    ackMap.set(ack.policyId, ack);
  }

  const progressMap = new Map(); // trainingModuleId -> progressRecord
  for (const tp of trainingProgresses) {
    progressMap.set(tp.trainingModuleId, tp);
  }

  const passedQuizSet = new Set(passedAttempts.map((a) => a.quizId));

  const latestAttemptMap = new Map(); // quizId -> latest attempt
  for (const att of allAttempts) {
    if (!latestAttemptMap.has(att.quizId)) {
      latestAttemptMap.set(att.quizId, att);
    }
  }

  // 3. Evaluate Policy Requirements
  let completedPolicyReqs = 0;
  const policyEvidenceList = applicablePolicies.map((pol) => {
    const currentVersion = pol.versions[0];
    const userAck = ackMap.get(pol.id);
    const isAcknowledged = Boolean(userAck && userAck.policyVersionId === currentVersion.id);

    if (isAcknowledged) {
      completedPolicyReqs++;
    }

    return {
      policyId: pol.id,
      title: pol.title,
      category: pol.category,
      targetDepartment: pol.targetDepartment,
      currentVersionId: currentVersion.id,
      currentVersionNumber: currentVersion.versionNumber,
      isAcknowledged,
      acknowledgedAt: isAcknowledged ? userAck.acknowledgedAt : null,
      acknowledgedVersionId: userAck ? userAck.policyVersionId : null,
    };
  });

  // 4. Evaluate Training Requirements
  let completedTrainingReqs = 0;
  const trainingEvidenceList = applicableTrainings.map((mod) => {
    const tp = progressMap.get(mod.id);
    const status = tp ? tp.status : 'NOT_STARTED';
    const isCompleted = status === 'COMPLETED';

    if (isCompleted) {
      completedTrainingReqs++;
    }

    return {
      trainingModuleId: mod.id,
      title: mod.title,
      status,
      assignedAt: tp ? tp.assignedAt : null,
      completedAt: tp ? tp.completedAt : null,
    };
  });

  // 5. Evaluate Quiz Requirements
  let passedQuizReqs = 0;
  const quizEvidenceList = applicableQuizzes.map((qz) => {
    const isPassed = passedQuizSet.has(qz.id);
    const latestAttempt = latestAttemptMap.get(qz.id);

    if (isPassed) {
      passedQuizReqs++;
    }

    return {
      quizId: qz.id,
      title: qz.title,
      passingScore: qz.passingScore,
      trainingModuleId: qz.trainingModuleId,
      trainingModuleTitle: qz.trainingModule?.title || 'General Module',
      isPassed,
      latestScore: latestAttempt ? latestAttempt.score : null,
      submittedAt: latestAttempt ? latestAttempt.submittedAt : null,
    };
  });

  // 6. Overall Totals & Compliance Percentage
  const totalPolicyReqs = applicablePolicies.length;
  const totalTrainingReqs = applicableTrainings.length;
  const totalQuizReqs = applicableQuizzes.length;

  const totalRequirements = totalPolicyReqs + totalTrainingReqs + totalQuizReqs;
  const completedRequirements = completedPolicyReqs + completedTrainingReqs + passedQuizReqs;
  const outstandingRequirements = totalRequirements - completedRequirements;

  let compliancePercentage = 0;
  if (totalRequirements > 0) {
    compliancePercentage = Math.round((completedRequirements / totalRequirements) * 100);
  }

  // Derive Status
  let complianceStatus = 'NO_REQUIREMENTS';
  if (totalRequirements > 0) {
    if (compliancePercentage === 100) {
      complianceStatus = 'COMPLIANT';
    } else if (compliancePercentage > 0) {
      complianceStatus = 'PARTIALLY_COMPLIANT';
    } else {
      complianceStatus = 'NON_COMPLIANT';
    }
  }

  // 7. Generate Outstanding Actions List
  const outstandingActions = [];
  for (const pol of policyEvidenceList) {
    if (!pol.isAcknowledged) {
      outstandingActions.push(`Acknowledge ${pol.title} v${pol.currentVersionNumber}`);
    }
  }
  for (const tr of trainingEvidenceList) {
    if (tr.status !== 'COMPLETED') {
      outstandingActions.push(`Complete ${tr.title}`);
    }
  }
  for (const qz of quizEvidenceList) {
    if (!qz.isPassed) {
      outstandingActions.push(`Pass ${qz.title}`);
    }
  }

  return {
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      role: employee.role,
    },
    summary: {
      totalRequirements,
      completedRequirements,
      outstandingRequirements,
      compliancePercentage,
      complianceStatus,
      policy: {
        total: totalPolicyReqs,
        completed: completedPolicyReqs,
        outstanding: totalPolicyReqs - completedPolicyReqs,
        percentage: totalPolicyReqs > 0 ? Math.round((completedPolicyReqs / totalPolicyReqs) * 100) : 0,
      },
      training: {
        total: totalTrainingReqs,
        completed: completedTrainingReqs,
        outstanding: totalTrainingReqs - completedTrainingReqs,
        percentage: totalTrainingReqs > 0 ? Math.round((completedTrainingReqs / totalTrainingReqs) * 100) : 0,
      },
      quiz: {
        total: totalQuizReqs,
        completed: passedQuizReqs,
        outstanding: totalQuizReqs - passedQuizReqs,
        percentage: totalQuizReqs > 0 ? Math.round((passedQuizReqs / totalQuizReqs) * 100) : 0,
      },
    },
    evidence: {
      policies: policyEvidenceList,
      training: trainingEvidenceList,
      quizzes: quizEvidenceList,
    },
    outstandingActions,
  };
}

/**
 * Calculates organization-wide compliance summary dashboard metrics for COMPLIANCE_OFFICER.
 *
 * @returns {Promise<object>}
 */
export async function getOrganizationComplianceDashboard() {
  const baseData = await fetchComplianceBaseData();

  // Fetch all active employees
  const activeEmployees = await prisma.user.findMany({
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
      role: true,
    },
  });

  const totalEmployees = activeEmployees.length;

  if (totalEmployees === 0) {
    return {
      summary: {
        totalEmployees: 0,
        fullyCompliantCount: 0,
        partiallyCompliantCount: 0,
        nonCompliantCount: 0,
        noRequirementsCount: 0,
        averageCompliancePercentage: 0,
      },
      categorySummaries: {
        policy: { totalRequirements: 0, completed: 0, outstanding: 0, percentage: 0 },
        training: { totalRequirements: 0, completed: 0, outstanding: 0, percentage: 0 },
        quiz: { totalRequirements: 0, completed: 0, outstanding: 0, percentage: 0 },
      },
    };
  }

  // Calculate compliance for each employee in parallel
  const employeeResults = await Promise.all(
    activeEmployees.map((emp) => calculateSingleEmployeeCompliance(emp, baseData))
  );

  let fullyCompliantCount = 0;
  let partiallyCompliantCount = 0;
  let nonCompliantCount = 0;
  let noRequirementsCount = 0;
  let sumPercentage = 0;

  let totalOrgPolicyReqs = 0;
  let completedOrgPolicyReqs = 0;

  let totalOrgTrainingReqs = 0;
  let completedOrgTrainingReqs = 0;

  let totalOrgQuizReqs = 0;
  let completedOrgQuizReqs = 0;

  for (const res of employeeResults) {
    const s = res.summary;
    sumPercentage += s.compliancePercentage;

    if (s.complianceStatus === 'COMPLIANT') fullyCompliantCount++;
    else if (s.complianceStatus === 'PARTIALLY_COMPLIANT') partiallyCompliantCount++;
    else if (s.complianceStatus === 'NON_COMPLIANT') nonCompliantCount++;
    else if (s.complianceStatus === 'NO_REQUIREMENTS') noRequirementsCount++;

    totalOrgPolicyReqs += s.policy.total;
    completedOrgPolicyReqs += s.policy.completed;

    totalOrgTrainingReqs += s.training.total;
    completedOrgTrainingReqs += s.training.completed;

    totalOrgQuizReqs += s.quiz.total;
    completedOrgQuizReqs += s.quiz.completed;
  }

  const averageCompliancePercentage = Math.round(sumPercentage / totalEmployees);

  return {
    summary: {
      totalEmployees,
      fullyCompliantCount,
      partiallyCompliantCount,
      nonCompliantCount,
      noRequirementsCount,
      averageCompliancePercentage,
    },
    categorySummaries: {
      policy: {
        totalRequirements: totalOrgPolicyReqs,
        completed: completedOrgPolicyReqs,
        outstanding: totalOrgPolicyReqs - completedOrgPolicyReqs,
        percentage: totalOrgPolicyReqs > 0 ? Math.round((completedOrgPolicyReqs / totalOrgPolicyReqs) * 100) : 0,
      },
      training: {
        totalRequirements: totalOrgTrainingReqs,
        completed: completedOrgTrainingReqs,
        outstanding: totalOrgTrainingReqs - completedOrgTrainingReqs,
        percentage: totalOrgTrainingReqs > 0 ? Math.round((completedOrgTrainingReqs / totalOrgTrainingReqs) * 100) : 0,
      },
      quiz: {
        totalRequirements: totalOrgQuizReqs,
        completed: completedOrgQuizReqs,
        outstanding: totalOrgQuizReqs - completedOrgQuizReqs,
        percentage: totalOrgQuizReqs > 0 ? Math.round((completedOrgQuizReqs / totalOrgQuizReqs) * 100) : 0,
      },
    },
  };
}

/**
 * Retrieves employee compliance table for COMPLIANCE_OFFICER with search and filters.
 *
 * @param {object} filters - { search, department, status }
 * @returns {Promise<Array>}
 */
export async function getEmployeeComplianceList(filters = {}) {
  const baseData = await fetchComplianceBaseData();

  const where = {
    role: 'EMPLOYEE',
    isActive: true,
  };

  if (filters.department && filters.department !== 'all') {
    where.department = filters.department;
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { department: { contains: q } },
    ];
  }

  const employees = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      role: true,
    },
    orderBy: { lastName: 'asc' },
  });

  const employeeComplianceList = await Promise.all(
    employees.map((emp) => calculateSingleEmployeeCompliance(emp, baseData))
  );

  // Filter by derived complianceStatus if status filter is applied
  let filtered = employeeComplianceList;
  if (filters.status && filters.status !== 'all') {
    const targetStatus = filters.status.toUpperCase();
    filtered = employeeComplianceList.filter((item) => item.summary.complianceStatus === targetStatus);
  }

  return filtered.map((item) => ({
    id: item.employee.id,
    firstName: item.employee.firstName,
    lastName: item.employee.lastName,
    name: `${item.employee.firstName} ${item.employee.lastName}`,
    email: item.employee.email,
    department: item.employee.department,
    totalRequirements: item.summary.totalRequirements,
    completedRequirements: item.summary.completedRequirements,
    outstandingRequirements: item.summary.outstandingRequirements,
    compliancePercentage: item.summary.compliancePercentage,
    complianceStatus: item.summary.complianceStatus,
    outstandingActionsCount: item.outstandingActions.length,
  }));
}
