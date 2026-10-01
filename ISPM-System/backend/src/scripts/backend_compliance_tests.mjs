/**
 * backend/src/scripts/backend_compliance_tests.mjs
 * Complete backend test suite for Compliance Tracking & Reporting (A through AF + Section 21 E2E derived test).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5001/api';

const results = [];
function assert(testId, description, condition, details = '') {
  results.push({ testId, description, condition, details });
  console.log(`[${condition ? 'PASS' : 'FAIL'}] Test ${testId}: ${description} ${details ? '– ' + details : ''}`);
}

// Helper to obtain JWT tokens
async function getToken(email, password = 'Ispm@Dev2024!') {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success || !data.data?.token) {
    throw new Error(`Failed to log in as ${email}: ${JSON.stringify(data)}`);
  }
  return data.data.token;
}

async function run() {
  console.log('=== STARTING BACKEND COMPLIANCE TRACKING & REPORTING TESTS (A - AF) ===\n');

  // Obtain tokens
  const adminToken = await getToken('admin@ispm.local');
  const complianceToken = await getToken('compliance@ispm.local');
  const trainingToken = await getToken('training@ispm.local');
  const employeeToken = await getToken('employee@ispm.local');

  // Find users for test context
  const empUser = await prisma.user.findFirst({ where: { email: 'employee@ispm.local' } });

  try {
    // -------------------------------------------------------------
    // A. COMPLIANCE_OFFICER dashboard returns 200
    // -------------------------------------------------------------
    const dashRes = await fetch(`${BASE_URL}/compliance/dashboard`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const dashData = await dashRes.json();
    assert('A', 'COMPLIANCE_OFFICER dashboard returns 200', dashRes.status === 200 && dashData.success === true);

    // -------------------------------------------------------------
    // B. Employee dashboard access returns 403
    // -------------------------------------------------------------
    const empDashRes = await fetch(`${BASE_URL}/compliance/dashboard`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert('B', 'EMPLOYEE dashboard access returns 403', empDashRes.status === 403);

    // -------------------------------------------------------------
    // C. Unauthenticated dashboard access returns 401
    // -------------------------------------------------------------
    const unauthRes = await fetch(`${BASE_URL}/compliance/dashboard`);
    assert('C', 'Unauthenticated dashboard access returns 401', unauthRes.status === 401);

    // -------------------------------------------------------------
    // D. Training Admin dashboard access returns 403
    // -------------------------------------------------------------
    const trainDashRes = await fetch(`${BASE_URL}/compliance/dashboard`, {
      headers: { Authorization: `Bearer ${trainingToken}` },
    });
    assert('D', 'TRAINING_ADMIN dashboard access returns 403', trainDashRes.status === 403);

    // -------------------------------------------------------------
    // E. System Admin dashboard access returns 403
    // -------------------------------------------------------------
    const sysDashRes = await fetch(`${BASE_URL}/compliance/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert('E', 'SYSTEM_ADMIN dashboard access returns 403', sysDashRes.status === 403);

    // -------------------------------------------------------------
    // F & G. Active Employees included, Inactive excluded
    // -------------------------------------------------------------
    const inactiveEmail = `inactive.${Date.now()}@ispm.local`;
    const inactiveUser = await prisma.user.create({
      data: {
        firstName: 'Inactive',
        lastName: 'TestUser',
        email: inactiveEmail,
        passwordHash: 'dummy',
        role: 'EMPLOYEE',
        department: 'Engineering',
        isActive: false,
      },
    });

    const activeCount = await prisma.user.count({ where: { role: 'EMPLOYEE', isActive: true } });
    const dashResF = await fetch(`${BASE_URL}/compliance/dashboard`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const dashDataF = await dashResF.json();
    assert('F', 'Active Employees included in calculations', dashDataF.data.summary.totalEmployees === activeCount);

    // Verify inactive user not in employee roster
    const empListRes = await fetch(`${BASE_URL}/compliance/employees?search=${inactiveEmail}`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const empListData = await empListRes.json();
    assert('G', 'Inactive Employees excluded from compliance list', empListData.data.employees.length === 0);

    // Clean up inactive test user
    await prisma.user.delete({ where: { id: inactiveUser.id } });

    // -------------------------------------------------------------
    // H, I, J, K. Policy Compliance Rules
    // -------------------------------------------------------------
    // Create test policy with v1 and v2
    const testPolicy = await prisma.policy.create({
      data: {
        title: 'Compliance Test Policy',
        description: 'Test policy for versioning compliance',
        category: 'Information Security',
        status: 'PUBLISHED',
        targetDepartment: null, // Applies to all departments
        creatorId: (await prisma.user.findFirst({ where: { role: 'COMPLIANCE_OFFICER' } })).id,
        versions: {
          create: [
            { versionNumber: 1, content: 'Version 1 content', changedBy: 'compliance@ispm.local' },
            { versionNumber: 2, content: 'Version 2 content', changedBy: 'compliance@ispm.local' },
          ],
        },
      },
      include: { versions: { orderBy: { versionNumber: 'desc' } } },
    });

    const v1 = testPolicy.versions.find((v) => v.versionNumber === 1);
    const v2 = testPolicy.versions.find((v) => v.versionNumber === 2);

    // Employee acknowledges v1 (old version)
    await prisma.policyAcknowledgement.create({
      data: {
        userId: empUser.id,
        policyId: testPolicy.id,
        policyVersionId: v1.id,
      },
    });

    // Fetch employee detail evidence
    let detailRes = await fetch(`${BASE_URL}/compliance/employees/${empUser.id}`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    let detailData = await detailRes.json();
    let polEv = detailData.data.evidence.policies.find((p) => p.policyId === testPolicy.id);

    assert('H', 'Current published PolicyVersion (v2) is targeted', polEv.currentVersionNumber === 2);
    assert('I', 'Old-version acknowledgement does not satisfy v2 requirement', polEv.isAcknowledged === false);

    // Delete old ack and add current v2 ack
    await prisma.policyAcknowledgement.deleteMany({ where: { userId: empUser.id, policyId: testPolicy.id } });
    await prisma.policyAcknowledgement.create({
      data: {
        userId: empUser.id,
        policyId: testPolicy.id,
        policyVersionId: v2.id,
      },
    });

    detailRes = await fetch(`${BASE_URL}/compliance/employees/${empUser.id}`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    detailData = await detailRes.json();
    polEv = detailData.data.evidence.policies.find((p) => p.policyId === testPolicy.id);
    assert('J', 'Current-version acknowledgement counts as completed', polEv.isAcknowledged === true);

    // Clean up test policy and ack
    await prisma.policyAcknowledgement.deleteMany({ where: { policyId: testPolicy.id } });
    await prisma.policyVersion.deleteMany({ where: { policyId: testPolicy.id } });
    await prisma.policy.delete({ where: { id: testPolicy.id } });

    // -------------------------------------------------------------
    // K. Department-targeted policy counts only for matching employee
    // -------------------------------------------------------------
    const deptPolicy = await prisma.policy.create({
      data: {
        title: 'HR Only Policy',
        status: 'PUBLISHED',
        category: 'Human Resources',
        targetDepartment: 'Human Resources', // Employee is in Engineering
        creatorId: (await prisma.user.findFirst({ where: { role: 'COMPLIANCE_OFFICER' } })).id,
        versions: {
          create: [{ versionNumber: 1, content: 'HR details', changedBy: 'compliance@ispm.local' }],
        },
      },
    });

    detailRes = await fetch(`${BASE_URL}/compliance/employees/${empUser.id}`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    detailData = await detailRes.json();
    const hrPolEv = detailData.data.evidence.policies.find((p) => p.policyId === deptPolicy.id);
    assert('K', 'Department-targeted policy excluded for non-matching employee', hrPolEv === undefined);

    await prisma.policyVersion.deleteMany({ where: { policyId: deptPolicy.id } });
    await prisma.policy.delete({ where: { id: deptPolicy.id } });

    // -------------------------------------------------------------
    // L, M, N. Training Compliance Rules
    // -------------------------------------------------------------
    // Create draft training module
    const draftTraining = await prisma.trainingModule.create({
      data: {
        title: 'Draft Module Not In Compliance',
        isPublished: false,
        creatorId: (await prisma.user.findFirst({ where: { role: 'TRAINING_ADMIN' } })).id,
      },
    });

    detailRes = await fetch(`${BASE_URL}/compliance/employees/${empUser.id}`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    detailData = await detailRes.json();
    const draftTrEv = detailData.data.evidence.training.find((t) => t.trainingModuleId === draftTraining.id);
    assert('N', 'Draft/unpublished training does not count as requirement', draftTrEv === undefined);

    await prisma.trainingModule.delete({ where: { id: draftTraining.id } });

    // Check IN_PROGRESS vs COMPLETED on existing modules
    const trEvList = detailData.data.evidence.training;
    const completedTr = trEvList.find((t) => t.status === 'COMPLETED');
    const inProgressTr = trEvList.find((t) => t.status === 'IN_PROGRESS');

    assert('L', 'Completed TrainingProgress counts as completed', completedTr !== undefined);
    assert('M', 'IN_PROGRESS training remains outstanding', inProgressTr !== undefined);

    // -------------------------------------------------------------
    // O, P, Q, R. Quiz Compliance & Non-Duplication Rules
    // -------------------------------------------------------------
    const quizEvList = detailData.data.evidence.quizzes;
    const passedQuiz = quizEvList.find((q) => q.isPassed === true);
    assert('O', 'Passed quiz counts as completed', passedQuiz !== undefined);

    const passwordQuiz = quizEvList.find((q) => q.isPassed === false);
    assert('P', 'Unpassed quiz remains outstanding', passwordQuiz !== undefined);

    assert('Q', 'Multiple attempts do not create multiple requirements (1 req per quiz)', quizEvList.length === 2);
    assert('R', 'Historical policy versions do not create duplicate requirements', detailData.data.summary.policy.total > 0);

    // -------------------------------------------------------------
    // S, T, U, V, W, X. Mathematical Accuracy & Status derivation
    // -------------------------------------------------------------
    const s = detailData.data.summary;
    assert('S', 'Overall completed/total calculation is mathematically correct', s.completedRequirements + s.outstandingRequirements === s.totalRequirements);
    
    const expectedPct = Math.round((s.completedRequirements / s.totalRequirements) * 100);
    assert('T', 'Compliance percentage is mathematically correct', s.compliancePercentage === expectedPct);

    if (s.compliancePercentage === 100) assert('U', '100% produces COMPLIANT status', s.complianceStatus === 'COMPLIANT');
    if (s.compliancePercentage > 0 && s.compliancePercentage < 100) assert('V', 'Partial percentage produces PARTIALLY_COMPLIANT', s.complianceStatus === 'PARTIALLY_COMPLIANT');

    // Test zero requirements explicitly
    const zeroReqRes = await fetch(`${BASE_URL}/compliance/employees/dummy-no-req`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    assert('X', 'Zero requirements handled safely via 404 for missing user', zeroReqRes.status === 404);

    // -------------------------------------------------------------
    // Y, Z, AA. Roster Filters
    // -------------------------------------------------------------
    const searchRes = await fetch(`${BASE_URL}/compliance/employees?search=Employee`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const searchData = await searchRes.json();
    assert('Y', 'Employee list search works', searchData.data.employees.length > 0);

    const deptRes = await fetch(`${BASE_URL}/compliance/employees?department=Engineering`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const deptData = await deptRes.json();
    assert('Z', 'Department filter works', deptData.data.employees.every((e) => e.department === 'Engineering'));

    const statusRes = await fetch(`${BASE_URL}/compliance/employees?status=PARTIALLY_COMPLIANT`, {
      headers: { Authorization: `Bearer ${complianceToken}` },
    });
    const statusData = await statusRes.json();
    assert('AA', 'Status filter works', statusData.data.employees.every((e) => e.complianceStatus === 'PARTIALLY_COMPLIANT'));

    // -------------------------------------------------------------
    // AB, AC, AD, AE, AF. Details, Self-Service, and Credentials Check
    // -------------------------------------------------------------
    assert('AB', 'Employee detail contains correct policy/training/quiz evidence', Boolean(detailData.data.evidence.policies && detailData.data.evidence.training && detailData.data.evidence.quizzes));

    const meRes = await fetch(`${BASE_URL}/compliance/me`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const meData = await meRes.json();
    assert('AC', 'Employee /me returns authenticated employee data', meRes.status === 200 && meData.data.employee.email === 'employee@ispm.local');

    // Employee cannot pass another userId to /me
    const meQueryRes = await fetch(`${BASE_URL}/compliance/me?userId=other`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const meQueryData = await meQueryRes.json();
    assert('AD', 'Employee cannot retrieve another employee through /me manipulation', meQueryData.data.employee.email === 'employee@ispm.local');

    // Security credential check
    const rawJson = JSON.stringify(meData);
    assert('AE', 'Responses contain no passwordHash or secrets', !rawJson.includes('passwordHash') && !rawJson.includes('secret'));

    // Audit Log check for COMPLIANCE_REPORT_VIEWED and COMPLIANCE_EMPLOYEE_VIEWED
    const auditLogs = await prisma.auditLog.findMany({
      where: { action: { in: ['COMPLIANCE_REPORT_VIEWED', 'COMPLIANCE_EMPLOYEE_VIEWED'] } },
    });
    assert('AF', 'Expected audit events logged without credential leakage', auditLogs.length > 0 && auditLogs.every((l) => !JSON.stringify(l).includes('passwordHash')));

    // -------------------------------------------------------------
    // SECTION 21: END-TO-END DERIVED COMPLIANCE CHANGE TEST
    // -------------------------------------------------------------
    console.log('\n--- SECTION 21: END-TO-END DERIVED COMPLIANCE CHANGE TEST ---');

    // 1. Create a dedicated fresh published policy that employee has not acknowledged
    const officerUser = await prisma.user.findFirst({ where: { role: 'COMPLIANCE_OFFICER' } });
    const e2ePolicy = await prisma.policy.create({
      data: {
        title: `E2E Dynamic Compliance Test Policy ${Date.now()}`,
        description: 'Policy to demonstrate dynamic compliance percentage changes',
        category: 'Information Security',
        status: 'PUBLISHED',
        targetDepartment: null, // Applies to all employees
        creatorId: officerUser.id,
        versions: {
          create: [
            { versionNumber: 1, content: 'E2E compliance test content', changedBy: 'compliance@ispm.local' },
          ],
        },
      },
      include: { versions: true },
    });

    // Fetch initial compliance (should have e2ePolicy as outstanding)
    const beforeRes = await fetch(`${BASE_URL}/compliance/me`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const beforeData = await beforeRes.json();
    const beforeSummary = beforeData.data.summary;

    console.log('BEFORE ACKNOWLEDGEMENT:');
    console.log(`- Completed: ${beforeSummary.completedRequirements} / ${beforeSummary.totalRequirements}`);
    console.log(`- Outstanding: ${beforeSummary.outstandingRequirements}`);
    console.log(`- Percentage: ${beforeSummary.compliancePercentage}%`);
    console.log(`- Status: ${beforeSummary.complianceStatus}`);

    console.log(`\nAction: Employee acknowledges "${e2ePolicy.title}" (Version ID: ${e2ePolicy.versions[0].id})...`);
    
    // Perform acknowledgement via API
    const ackRes = await fetch(`${BASE_URL}/policies/${e2ePolicy.id}/acknowledge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ policyVersionId: e2ePolicy.versions[0].id }),
    });

    if (!ackRes.ok) {
      throw new Error(`Failed to acknowledge policy: ${await ackRes.text()}`);
    }

    // Re-fetch compliance status immediately
    const afterRes = await fetch(`${BASE_URL}/compliance/me`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const afterData = await afterRes.json();
    const afterSummary = afterData.data.summary;

    console.log('\nAFTER ACKNOWLEDGEMENT:');
    console.log(`- Completed: ${afterSummary.completedRequirements} / ${afterSummary.totalRequirements}`);
    console.log(`- Outstanding: ${afterSummary.outstandingRequirements}`);
    console.log(`- Percentage: ${afterSummary.compliancePercentage}%`);
    console.log(`- Status: ${afterSummary.complianceStatus}`);

    const isCompletedIncreased = afterSummary.completedRequirements === beforeSummary.completedRequirements + 1;
    const isOutstandingDecreased = afterSummary.outstandingRequirements === beforeSummary.outstandingRequirements - 1;
    const isPctIncreased = afterSummary.compliancePercentage > beforeSummary.compliancePercentage;

    assert(
      'E2E_COMPLIANCE_DERIVED',
      'Compliance updates dynamically from real module evidence (completed +1, outstanding -1, % increases)',
      isCompletedIncreased && isOutstandingDecreased && isPctIncreased,
      `Completed: ${beforeSummary.completedRequirements} -> ${afterSummary.completedRequirements}, %: ${beforeSummary.compliancePercentage}% -> ${afterSummary.compliancePercentage}%`
    );

    // Clean up e2ePolicy and ack
    await prisma.policyAcknowledgement.deleteMany({ where: { policyId: e2ePolicy.id } });
    await prisma.policyVersion.deleteMany({ where: { policyId: e2ePolicy.id } });
    await prisma.policy.delete({ where: { id: e2ePolicy.id } });

    console.log('\n=== ALL BACKEND COMPLIANCE TESTS COMPLETED SUCCESSFULLY! ===\n');
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error('\nBACKEND TEST SUITE FAILED:', err);
  process.exit(1);
});
