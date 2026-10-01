/**
 * scripts/backend_dashboard_tests.mjs
 * Comprehensive test suite and cross-check verifications for Role-Based Dashboard Integration.
 * 
 * Tests items A through V from Section 16 & Mandatory Cross-Check from Section 17.
 */
import 'dotenv/config';
import prisma from '../config/prisma.js';
import { getOrganizationComplianceDashboard, calculateSingleEmployeeCompliance } from '../services/compliance.service.js';

const API_BASE = 'http://localhost:5001/api';
const DEFAULT_PASSWORD = 'Ispm@Dev2024!';

const TEST_ACCOUNTS = {
  SYSTEM_ADMIN: 'admin@ispm.local',
  COMPLIANCE_OFFICER: 'compliance@ispm.local',
  TRAINING_ADMIN: 'training@ispm.local',
  EMPLOYEE: 'employee@ispm.local',
};

async function login(email, password = DEFAULT_PASSWORD) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${json.message || res.status}`);
  }
  return json.data.token;
}

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

async function runDashboardTests() {
  console.log('====================================================');
  console.log('RUNNING ROLE-BASED DASHBOARD INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // Login tokens
  const tokens = {};
  for (const [role, email] of Object.entries(TEST_ACCOUNTS)) {
    tokens[role] = await login(email);
  }

  // Fetch dashboard responses for all 4 roles
  const dashboardResponses = {};
  for (const [role, token] of Object.entries(tokens)) {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    assert(res.ok, `GET /api/dashboard returned HTTP 200 for ${role}`);
    dashboardResponses[role] = json.data;
  }

  console.log('\n--- Section 16 Verification Tests (A - V) ---');

  // A. SYSTEM_ADMIN receives System Admin dashboard data
  const adminData = dashboardResponses.SYSTEM_ADMIN;
  assert(
    adminData.role === 'SYSTEM_ADMIN' && adminData.metrics.totalUsers !== undefined,
    'A. SYSTEM_ADMIN receives System Admin dashboard data'
  );

  // B. COMPLIANCE_OFFICER receives Compliance dashboard data
  const compData = dashboardResponses.COMPLIANCE_OFFICER;
  assert(
    compData.role === 'COMPLIANCE_OFFICER' && compData.metrics.activeEmployees !== undefined,
    'B. COMPLIANCE_OFFICER receives Compliance dashboard data'
  );

  // C. TRAINING_ADMIN receives Training dashboard data
  const trainData = dashboardResponses.TRAINING_ADMIN;
  assert(
    trainData.role === 'TRAINING_ADMIN' && trainData.metrics.totalTrainingModules !== undefined,
    'C. TRAINING_ADMIN receives Training dashboard data'
  );

  // D. EMPLOYEE receives Employee dashboard data
  const empData = dashboardResponses.EMPLOYEE;
  assert(
    empData.role === 'EMPLOYEE' && empData.metrics.ownCompliancePercentage !== undefined,
    'D. EMPLOYEE receives Employee dashboard data'
  );

  // E. Unauthenticated request returns 401
  const unauthRes = await fetch(`${API_BASE}/dashboard`);
  assert(unauthRes.status === 401, 'E. Unauthenticated request returns 401');

  // F. Employee response contains only their own data
  const empUser = await prisma.user.findUnique({ where: { email: TEST_ACCOUNTS.EMPLOYEE } });
  const empDirectCompliance = await calculateSingleEmployeeCompliance(empUser);
  assert(
    empData.metrics.ownCompliancePercentage === empDirectCompliance.summary.compliancePercentage,
    'F. Employee response contains only their own data'
  );

  // G. Employee cannot manipulate userId to retrieve another employee
  const paramAttemptRes = await fetch(`${API_BASE}/dashboard?userId=other-id`, {
    headers: { Authorization: `Bearer ${tokens.EMPLOYEE}` },
  });
  const paramAttemptJson = await paramAttemptRes.json();
  assert(
    paramAttemptJson.data.role === 'EMPLOYEE' && paramAttemptJson.data.metrics.ownCompliancePercentage === empDirectCompliance.summary.compliancePercentage,
    'G. Employee cannot manipulate userId to retrieve another employee (URL params ignored)'
  );

  // H. System Admin response does not expose restricted Compliance report details
  assert(
    adminData.metrics.averageCompliancePercentage === undefined && adminData.metrics.fullyCompliantEmployees === undefined,
    'H. System Admin response does not expose restricted Compliance report details'
  );

  // I. Training Admin response does not expose restricted Compliance data
  assert(
    trainData.metrics.averageCompliancePercentage === undefined && trainData.metrics.fullyCompliantEmployees === undefined,
    'I. Training Admin response does not expose restricted Compliance data'
  );

  // J. Compliance Officer response does not expose System Admin-only user management data
  assert(
    compData.metrics.usersByRole === undefined && compData.metrics.totalUsers === undefined,
    'J. Compliance Officer response does not expose System Admin-only user management data'
  );

  // K. Dashboard response contains no passwordHash
  const jsonStr = JSON.stringify(dashboardResponses);
  assert(!jsonStr.includes('passwordHash'), 'K. Dashboard response contains no passwordHash');

  // L. Dashboard response contains no JWT/token
  assert(!jsonStr.includes('eyJhbGciOi'), 'L. Dashboard response contains no JWT/token');

  // M. User counts match database records
  const dbUserCount = await prisma.user.count();
  const dbActiveUserCount = await prisma.user.count({ where: { isActive: true } });
  assert(
    adminData.metrics.totalUsers === dbUserCount && adminData.metrics.activeUsers === dbActiveUserCount,
    'M. User counts match database records'
  );

  // N. Helpdesk counts match database records
  const dbOpenHelpdesk = await prisma.helpdeskTicket.count({ where: { status: 'OPEN' } });
  assert(
    adminData.metrics.openHelpdeskTickets === dbOpenHelpdesk,
    'N. Helpdesk counts match database records'
  );

  // O. Training counts match database records
  const dbTotalTraining = await prisma.trainingModule.count();
  const dbPublishedTraining = await prisma.trainingModule.count({ where: { isPublished: true } });
  assert(
    trainData.metrics.totalTrainingModules === dbTotalTraining && trainData.metrics.publishedTrainingModules === dbPublishedTraining,
    'O. Training counts match database records'
  );

  // P. Quiz counts match database records
  const dbQuizCount = await prisma.quiz.count();
  assert(
    trainData.metrics.totalQuizzes === dbQuizCount,
    'P. Quiz counts match database records'
  );

  // Q. Employee policy outstanding count matches actual acknowledgement state
  assert(
    empData.metrics.policiesRequiringAcknowledgement === empDirectCompliance.summary.policy.outstanding,
    'Q. Employee policy outstanding count matches actual acknowledgement state'
  );

  // R. Employee training progress counts match actual records
  assert(
    empData.metrics.trainingCompletedCount === empDirectCompliance.summary.training.completed,
    'R. Employee training progress counts match actual records'
  );

  // S. Employee quiz pass/outstanding counts match actual records
  assert(
    empData.metrics.quizzesPassed === empDirectCompliance.summary.quiz.completed && empData.metrics.quizzesOutstanding === empDirectCompliance.summary.quiz.outstanding,
    'S. Employee quiz pass/outstanding counts match actual records'
  );

  // T. Employee compliance percentage/status matches existing Compliance service result
  assert(
    empData.metrics.ownCompliancePercentage === empDirectCompliance.summary.compliancePercentage && empData.metrics.complianceStatus === empDirectCompliance.summary.complianceStatus,
    'T. Employee compliance percentage/status matches existing Compliance service result'
  );

  // U. Notification unread count matches Notification records
  const dbEmpUnreadNotif = await prisma.notification.count({
    where: { recipientId: empUser.id, isRead: false },
  });
  assert(
    empData.metrics.unreadNotificationCount === dbEmpUnreadNotif,
    'U. Notification unread count matches Notification records'
  );

  // V. Employee Helpdesk count contains only their own tickets
  const dbEmpOpenTickets = await prisma.helpdeskTicket.count({
    where: { creatorId: empUser.id, status: { in: ['OPEN', 'IN_PROGRESS'] } },
  });
  assert(
    empData.metrics.ownOpenHelpdeskCount === dbEmpOpenTickets,
    'V. Employee Helpdesk count contains only their own tickets'
  );

  console.log('\n--- Section 17 Mandatory Cross-Check Verification ---');

  const orgCompliance = await getOrganizationComplianceDashboard();

  const crossChecks = [
    {
      role: 'SYSTEM_ADMIN',
      metric: 'totalUsers',
      dashboardVal: adminData.metrics.totalUsers,
      dbVal: dbUserCount,
    },
    {
      role: 'SYSTEM_ADMIN',
      metric: 'activeUsers',
      dashboardVal: adminData.metrics.activeUsers,
      dbVal: dbActiveUserCount,
    },
    {
      role: 'SYSTEM_ADMIN',
      metric: 'openHelpdeskTickets',
      dashboardVal: adminData.metrics.openHelpdeskTickets,
      dbVal: dbOpenHelpdesk,
    },
    {
      role: 'COMPLIANCE_OFFICER',
      metric: 'activeEmployees',
      dashboardVal: compData.metrics.activeEmployees,
      dbVal: orgCompliance.summary.totalEmployees,
    },
    {
      role: 'COMPLIANCE_OFFICER',
      metric: 'compliance percentage',
      dashboardVal: compData.metrics.averageCompliancePercentage,
      dbVal: orgCompliance.summary.averageCompliancePercentage,
    },
    {
      role: 'TRAINING_ADMIN',
      metric: 'publishedTrainingModules',
      dashboardVal: trainData.metrics.publishedTrainingModules,
      dbVal: dbPublishedTraining,
    },
    {
      role: 'TRAINING_ADMIN',
      metric: 'totalQuizzes',
      dashboardVal: trainData.metrics.totalQuizzes,
      dbVal: dbQuizCount,
    },
    {
      role: 'EMPLOYEE',
      metric: 'outstanding policies',
      dashboardVal: empData.metrics.policiesRequiringAcknowledgement,
      dbVal: empDirectCompliance.summary.policy.outstanding,
    },
    {
      role: 'EMPLOYEE',
      metric: 'completed training',
      dashboardVal: empData.metrics.trainingCompletedCount,
      dbVal: empDirectCompliance.summary.training.completed,
    },
    {
      role: 'EMPLOYEE',
      metric: 'passed quizzes',
      dashboardVal: empData.metrics.quizzesPassed,
      dbVal: empDirectCompliance.summary.quiz.completed,
    },
    {
      role: 'EMPLOYEE',
      metric: 'compliance percentage',
      dashboardVal: empData.metrics.ownCompliancePercentage,
      dbVal: empDirectCompliance.summary.compliancePercentage,
    },
    {
      role: 'EMPLOYEE',
      metric: 'unread notifications',
      dashboardVal: empData.metrics.unreadNotificationCount,
      dbVal: dbEmpUnreadNotif,
    },
    {
      role: 'EMPLOYEE',
      metric: 'own open Helpdesk tickets',
      dashboardVal: empData.metrics.ownOpenHelpdeskCount,
      dbVal: dbEmpOpenTickets,
    },
  ];

  console.log('\nRole               | Metric                      | Dashboard Value | Authoritative/DB Value | Result');
  console.log('-----------------------------------------------------------------------------------------------------');
  for (const c of crossChecks) {
    const isPass = c.dashboardVal === c.dbVal;
    const resultStr = isPass ? 'PASS' : 'FAIL';
    console.log(
      `${c.role.padEnd(18)} | ${c.metric.padEnd(27)} | ${String(c.dashboardVal).padEnd(15)} | ${String(c.dbVal).padEnd(22)} | ${resultStr}`
    );
    assert(isPass, `Cross-check ${c.role} ${c.metric}: dashboard (${c.dashboardVal}) === DB (${c.dbVal})`);
  }

  console.log('\n====================================================');
  console.log(`TOTAL PASSED: ${passCount}`);
  console.log(`TOTAL FAILED: ${failCount}`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runDashboardTests().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});
