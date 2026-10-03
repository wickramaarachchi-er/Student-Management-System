/**
 * services/dashboard.service.js
 * Business logic for role-based dashboard metrics in ISPM System.
 * 
 * Rules:
 *  - Derives all metrics dynamically from live database records.
 *  - No Dashboard database table (dashboard data is strictly derived).
 *  - Enforces strict role isolation at the service level.
 *  - No passwordHash or authentication tokens returned.
 */
import prisma from '../config/prisma.js';
import { getOrganizationComplianceDashboard, calculateSingleEmployeeCompliance } from './compliance.service.js';

/**
 * Retrieves role-specific dashboard metrics based on authenticated user's role.
 *
 * @param {object} user - Authenticated user record from req.user
 * @returns {Promise<object>}
 */
export async function getDashboardDataForUser(user) {
  const { id: userId, role } = user;

  switch (role) {
    case 'SYSTEM_ADMIN': {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        systemAdminCount,
        complianceOfficerCount,
        trainingAdminCount,
        employeeCount,
        openHelpdeskTickets,
        inProgressHelpdeskTickets,
        recentHelpdeskTickets,
        recentSystemActivity,
        unreadNotificationCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { role: 'SYSTEM_ADMIN' } }),
        prisma.user.count({ where: { role: 'COMPLIANCE_OFFICER' } }),
        prisma.user.count({ where: { role: 'TRAINING_ADMIN' } }),
        prisma.user.count({ where: { role: 'EMPLOYEE' } }),
        prisma.helpdeskTicket.count({ where: { status: 'OPEN' } }),
        prisma.helpdeskTicket.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.helpdeskTicket.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true,
            creator: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        }),
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            entityType: true,
            description: true,
            userEmail: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      return {
        role: 'SYSTEM_ADMIN',
        metrics: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByRole: {
            SYSTEM_ADMIN: systemAdminCount,
            COMPLIANCE_OFFICER: complianceOfficerCount,
            TRAINING_ADMIN: trainingAdminCount,
            EMPLOYEE: employeeCount,
          },
          openHelpdeskTickets,
          inProgressHelpdeskTickets,
          unresolvedHelpdeskCount: openHelpdeskTickets + inProgressHelpdeskTickets,
          unreadNotificationCount,
        },
        recentHelpdeskTickets,
        recentSystemActivity,
      };
    }

    case 'COMPLIANCE_OFFICER': {
      const complianceOverview = await getOrganizationComplianceDashboard();

      const [
        totalPolicies,
        activePublishedPolicies,
        draftPolicies,
        archivedPolicies,
        publishedPolicies,
        activeEmployeesList,
        recentPolicies,
        unreadNotificationCount,
      ] = await Promise.all([
        prisma.policy.count(),
        prisma.policy.count({ where: { status: 'PUBLISHED' } }),
        prisma.policy.count({ where: { status: 'DRAFT' } }),
        prisma.policy.count({ where: { status: 'ARCHIVED' } }),
        prisma.policy.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
            acknowledgements: { select: { userId: true, policyVersionId: true } },
          },
        }),
        prisma.user.findMany({
          where: { role: 'EMPLOYEE', isActive: true },
          select: { id: true, department: true },
        }),
        prisma.policy.findMany({
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            targetDepartment: true,
            updatedAt: true,
          },
        }),
        prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      // Calculate how many published policies have pending employee acknowledgements
      let policiesRequiringAcknowledgement = 0;
      for (const pol of publishedPolicies) {
        if (!pol.versions || pol.versions.length === 0) continue;
        const currentVersionId = pol.versions[0].id;
        const targetDept = pol.targetDepartment ? pol.targetDepartment.trim().toLowerCase() : 'all';

        const applicableEmps = activeEmployeesList.filter((e) => {
          if (!targetDept || targetDept === 'all') return true;
          return e.department && e.department.trim().toLowerCase() === targetDept;
        });

        const ackUserIds = new Set(
          pol.acknowledgements
            .filter((a) => a.policyVersionId === currentVersionId)
            .map((a) => a.userId)
        );

        const unackEmps = applicableEmps.filter((e) => !ackUserIds.has(e.id));
        if (unackEmps.length > 0) {
          policiesRequiringAcknowledgement++;
        }
      }

      return {
        role: 'COMPLIANCE_OFFICER',
        metrics: {
          activeEmployees: complianceOverview.summary.totalEmployees,
          fullyCompliantEmployees: complianceOverview.summary.fullyCompliantCount,
          partiallyCompliantEmployees: complianceOverview.summary.partiallyCompliantCount,
          nonCompliantEmployees: complianceOverview.summary.nonCompliantCount,
          averageCompliancePercentage: complianceOverview.summary.averageCompliancePercentage,
          categorySummaries: complianceOverview.categorySummaries,
          totalPolicies,
          activePublishedPolicies,
          draftPolicies,
          archivedPolicies,
          policiesRequiringAcknowledgement,
          unreadNotificationCount,
        },
        recentPolicies,
      };
    }

    case 'TRAINING_ADMIN': {
      const [
        totalTrainingModules,
        publishedTrainingModules,
        unpublishedTrainingModules,
        totalQuizzes,
        totalProgressRecords,
        completedProgressRecords,
        totalQuizAttempts,
        passedQuizAttempts,
        unreadNotificationCount,
      ] = await Promise.all([
        prisma.trainingModule.count(),
        prisma.trainingModule.count({ where: { isPublished: true } }),
        prisma.trainingModule.count({ where: { isPublished: false } }),
        prisma.quiz.count(),
        prisma.trainingProgress.count(),
        prisma.trainingProgress.count({ where: { status: 'COMPLETED' } }),
        prisma.quizAttempt.count(),
        prisma.quizAttempt.count({ where: { isPassed: true } }),
        prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      const completionRate =
        totalProgressRecords > 0
          ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
          : 0;

      const quizPassRate =
        totalQuizAttempts > 0
          ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
          : 0;

      return {
        role: 'TRAINING_ADMIN',
        metrics: {
          totalTrainingModules,
          publishedTrainingModules,
          unpublishedTrainingModules,
          totalQuizzes,
          totalProgressRecords,
          completedProgressRecords,
          completionRate,
          totalQuizAttempts,
          passedQuizAttempts,
          quizPassRate,
          unreadNotificationCount,
        },
      };
    }

    case 'EMPLOYEE':
    default: {
      const empRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, email: true, department: true, role: true },
      });

      const complianceData = await calculateSingleEmployeeCompliance(empRecord);

      const [unreadNotificationCount, ownOpenHelpdeskCount] = await Promise.all([
        prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
        prisma.helpdeskTicket.count({
          where: { creatorId: userId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
      ]);

      // Build structured attention items dynamically from real DB data
      const attentionItems = [];

      // Outstanding Policy acknowledgements
      for (const pol of complianceData.evidence.policies) {
        if (!pol.isAcknowledged) {
          attentionItems.push({
            id: `pol-${pol.policyId}`,
            type: 'POLICY',
            title: `Acknowledge Policy: ${pol.title}`,
            detail: `Version ${pol.currentVersionNumber} requires your signature.`,
            link: '/policies',
          });
        }
      }

      // Training modules needing completion
      for (const tr of complianceData.evidence.training) {
        if (tr.status !== 'COMPLETED') {
          attentionItems.push({
            id: `tr-${tr.trainingModuleId}`,
            type: 'TRAINING',
            title: `Complete Training: ${tr.title}`,
            detail: `Status: ${tr.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}.`,
            link: '/training',
          });
        }
      }

      // Outstanding Quizzes
      for (const qz of complianceData.evidence.quizzes) {
        if (!qz.isPassed) {
          attentionItems.push({
            id: `qz-${qz.quizId}`,
            type: 'QUIZ',
            title: `Pass Quiz: ${qz.title}`,
            detail: `Module: ${qz.trainingModuleTitle} (Passing score: ${qz.passingScore}%).`,
            link: '/quizzes',
          });
        }
      }

      // Unread notifications alert
      if (unreadNotificationCount > 0) {
        attentionItems.push({
          id: 'notif-unread',
          type: 'NOTIFICATION',
          title: `You have ${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? 's' : ''}`,
          detail: 'Check your notifications inbox for security advisories and updates.',
          link: '/notifications',
        });
      }

      // Open helpdesk ticket alert
      if (ownOpenHelpdeskCount > 0) {
        attentionItems.push({
          id: 'ticket-open',
          type: 'HELPDESK',
          title: `You have ${ownOpenHelpdeskCount} open security ticket${ownOpenHelpdeskCount > 1 ? 's' : ''}`,
          detail: 'Track response updates on your open helpdesk tickets.',
          link: '/helpdesk',
        });
      }

      return {
        role: 'EMPLOYEE',
        metrics: {
          policiesRequiringAcknowledgement: complianceData.summary.policy.outstanding,
          acknowledgedPolicyCount: complianceData.summary.policy.completed,
          trainingCompletedCount: complianceData.summary.training.completed,
          trainingInProgressCount: complianceData.evidence.training.filter((t) => t.status === 'IN_PROGRESS').length,
          trainingNotStartedCount: complianceData.evidence.training.filter((t) => t.status === 'NOT_STARTED').length,
          quizzesPassed: complianceData.summary.quiz.completed,
          quizzesOutstanding: complianceData.summary.quiz.outstanding,
          ownCompliancePercentage: complianceData.summary.compliancePercentage,
          complianceStatus: complianceData.summary.complianceStatus,
          unreadNotificationCount,
          ownOpenHelpdeskCount,
        },
        attentionItems,
        evidence: complianceData.evidence,
      };
    }
  }
}
