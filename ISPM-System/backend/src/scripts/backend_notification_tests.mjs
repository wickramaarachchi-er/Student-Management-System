/**
 * backend/src/scripts/backend_notification_tests.mjs
 * Comprehensive backend test suite for NOTIFICATION module.
 *
 * Tests A-Z + Section 18 Mandatory Ownership Attack Test + Section 19 Mandatory Policy Targeting Test.
 */
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'ispm_super_secret_jwt_key_2026';

let adminUser, compUser, trainUser, empAUser, empBUser, empCSUser, empITUser, empInactiveCSUser;
let adminToken, compToken, trainToken, empAToken, empBToken, empCSToken, empITToken;

async function setupTestUsers() {
  console.log('--- Setting up test users and data for notifications ---');

  const hashedPw = await bcrypt.hash('Password123!', 10);

  // Get or create roles
  adminUser = await prisma.user.findFirst({ where: { role: 'SYSTEM_ADMIN' } });
  compUser = await prisma.user.findFirst({ where: { role: 'COMPLIANCE_OFFICER' } });
  trainUser = await prisma.user.findFirst({ where: { role: 'TRAINING_ADMIN' } });

  adminToken = jwt.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });
  compToken = jwt.sign({ sub: compUser.id, email: compUser.email, role: compUser.role }, JWT_SECRET, { expiresIn: '1h' });
  trainToken = jwt.sign({ sub: trainUser.id, email: trainUser.email, role: trainUser.role }, JWT_SECRET, { expiresIn: '1h' });

  // Employee A & B for Ownership Attack
  empAUser = await prisma.user.upsert({
    where: { email: 'notif.empA@university.edu' },
    update: { isActive: true },
    create: {
      firstName: 'NotifEmpA',
      lastName: 'Test',
      email: 'notif.empA@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Computer Science',
      isActive: true,
    },
  });

  empBUser = await prisma.user.upsert({
    where: { email: 'notif.empB@university.edu' },
    update: { isActive: true },
    create: {
      firstName: 'NotifEmpB',
      lastName: 'Test',
      email: 'notif.empB@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Information Technology',
      isActive: true,
    },
  });

  empAToken = jwt.sign({ sub: empAUser.id, email: empAUser.email, role: empAUser.role }, JWT_SECRET, { expiresIn: '1h' });
  empBToken = jwt.sign({ sub: empBUser.id, email: empBUser.email, role: empBUser.role }, JWT_SECRET, { expiresIn: '1h' });

  // Department targeting test users (Section 19)
  empCSUser = await prisma.user.upsert({
    where: { email: 'dept.cs.active@university.edu' },
    update: { isActive: true },
    create: {
      firstName: 'CSActive',
      lastName: 'User',
      email: 'dept.cs.active@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Computer Science',
      isActive: true,
    },
  });

  empITUser = await prisma.user.upsert({
    where: { email: 'dept.it.active@university.edu' },
    update: { isActive: true },
    create: {
      firstName: 'ITActive',
      lastName: 'User',
      email: 'dept.it.active@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Information Technology',
      isActive: true,
    },
  });

  empInactiveCSUser = await prisma.user.upsert({
    where: { email: 'dept.cs.inactive@university.edu' },
    update: { isActive: false },
    create: {
      firstName: 'CSInactive',
      lastName: 'User',
      email: 'dept.cs.inactive@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Computer Science',
      isActive: false,
    },
  });

  empCSToken = jwt.sign({ sub: empCSUser.id, email: empCSUser.email, role: empCSUser.role }, JWT_SECRET, { expiresIn: '1h' });
  empITToken = jwt.sign({ sub: empITUser.id, email: empITUser.email, role: empITUser.role }, JWT_SECRET, { expiresIn: '1h' });

  console.log('Setup finished.');
}

async function runTests() {
  await setupTestUsers();
  console.log('\n==================================================');
  console.log('RUNNING NOTIFICATIONS BACKEND TEST SUITE (A-Z + SECTIONS 18 & 19)');
  console.log('==================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assertTest(condition, testCode, description) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`✓ Test ${testCode}: ${description} (PASS)`);
    } else {
      console.error(`✗ Test ${testCode}: ${description} (FAIL)`);
    }
  }

  // Seed notification A for Emp A, notification B for Emp B
  const notifA = await prisma.notification.create({
    data: {
      recipientId: empAUser.id,
      title: 'Notification A',
      message: 'Message for Employee A',
      type: 'SYSTEM',
    },
  });

  const notifB = await prisma.notification.create({
    data: {
      recipientId: empBUser.id,
      title: 'Notification B',
      message: 'Message for Employee B',
      type: 'SYSTEM',
    },
  });

  // A. Authenticated Employee can list own notifications
  const resA = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  const dataA = await resA.json();
  const notifsAList = dataA.data?.notifications || [];
  assertTest(resA.status === 200 && notifsAList.some((n) => n.id === notifA.id), 'A', 'Authenticated Employee can list own notifications');

  // B. Unauthenticated notification list returns 401
  const resB = await fetch(`${API_BASE}/notifications`);
  assertTest(resB.status === 401, 'B', 'Unauthenticated notification list returns 401');

  // C. System Admin can list own notifications
  const resC = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assertTest(resC.status === 200, 'C', 'System Admin can list own notifications');

  // D. Compliance Officer can list own notifications
  const resD = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${compToken}` },
  });
  assertTest(resD.status === 200, 'D', 'Compliance Officer can list own notifications');

  // E. Training Admin can list own notifications
  const resE = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${trainToken}` },
  });
  assertTest(resE.status === 200, 'E', 'Training Admin can list own notifications');

  // F. Employee cannot see another Employee\'s notifications
  const seesB = notifsAList.some((n) => n.id === notifB.id);
  assertTest(!seesB, 'F', 'Employee cannot see another Employee\'s notifications');

  // G. Supplied userId query/body cannot retrieve another user\'s notifications
  const resG = await fetch(`${API_BASE}/notifications?userId=${empBUser.id}`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  const dataG = await resG.json();
  const listG = dataG.data?.notifications || [];
  const safeG = listG.every((n) => n.recipientId === empAUser.id);
  assertTest(resG.status === 200 && safeG, 'G', 'Supplied userId query parameter ignored for isolation');

  // H. Notifications ordered newest first
  let newestFirst = true;
  for (let i = 1; i < notifsAList.length; i++) {
    if (new Date(notifsAList[i].createdAt) > new Date(notifsAList[i - 1].createdAt)) {
      newestFirst = false;
    }
  }
  assertTest(newestFirst, 'H', 'Notifications ordered newest first');

  // I. Unread count is correct
  const resI = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  const dataI = await resI.json();
  assertTest(resI.status === 200 && typeof dataI.data?.unreadCount === 'number', 'I', 'Unread count returned correctly');

  // J. Employee can mark own notification read
  const resJ = await fetch(`${API_BASE}/notifications/${notifA.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  const dataJ = await resJ.json();
  assertTest(resJ.status === 200 && dataJ.data?.notification?.isRead === true, 'J', 'Employee can mark own notification read');

  // K. Mark-read operation is idempotent
  const resK = await fetch(`${API_BASE}/notifications/${notifA.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  assertTest(resK.status === 200, 'K', 'Mark-read operation is idempotent');

  // L. Employee cannot mark another Employee\'s notification read
  const resL = await fetch(`${API_BASE}/notifications/${notifB.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  assertTest(resL.status === 403, 'L', 'Employee cannot mark another Employee\'s notification read (403)');

  // M. Mark-all-read changes only authenticated user\'s notifications
  const resM = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  assertTest(resM.status === 200, 'M', 'Mark-all-read succeeds for authenticated user');

  // N. Another user\'s notifications remain unchanged after mark-all-read
  const dbNotifB = await prisma.notification.findUnique({ where: { id: notifB.id } });
  assertTest(dbNotifB.isRead === false, 'N', 'Another user\'s notification remains unread after mark-all-read');

  // O. Publishing new policy version creates notifications for applicable active Employees
  // Create policy
  const policyRes = await fetch(`${API_BASE}/policies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
    body: JSON.stringify({
      title: 'Global Security Policy - Notif Test',
      category: 'General Security',
      targetDepartment: '', // org wide
    }),
  });
  const policyData = await policyRes.json();
  const policyId = policyData.data?.policy?.id;

  const versionRes = await fetch(`${API_BASE}/policies/${policyId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
    body: JSON.stringify({
      versionNumber: 1,
      content: 'Global security policy content',
    }),
  });
  const versionData = await versionRes.json();
  const versionId = versionData.data?.version?.id;

  // Publish policy version
  const pubRes = await fetch(`${API_BASE}/policies/${policyId}/versions/${versionId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${compToken}` },
  });
  assertTest(pubRes.status === 200, 'O', 'Policy version published successfully');

  // Check if Emp A got notification for policy
  const notifCheckO = await prisma.notification.findFirst({
    where: { recipientId: empAUser.id, type: 'POLICY_PUBLISHED', resourceRef: policyId },
  });
  assertTest(!!notifCheckO, 'O_NOTIF', 'Publishing policy created notification for active Employee A');

  // P. Department-targeted policy notifies only matching department Employees (Section 19 test)
  const deptPolicyRes = await fetch(`${API_BASE}/policies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
    body: JSON.stringify({
      title: 'CS Special Operations Policy',
      category: 'Department Security',
      targetDepartment: 'Computer Science',
    }),
  });
  const deptPolicyData = await deptPolicyRes.json();
  const deptPolicyId = deptPolicyData.data?.policy?.id;

  const deptVersionRes = await fetch(`${API_BASE}/policies/${deptPolicyId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
    body: JSON.stringify({ versionNumber: 1, content: 'CS Dept only content' }),
  });
  const deptVerData = await deptVersionRes.json();

  await fetch(`${API_BASE}/policies/${deptPolicyId}/versions/${deptVerData.data?.version?.id}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${compToken}` },
  });

  const csNotif = await prisma.notification.findFirst({ where: { recipientId: empCSUser.id, resourceRef: deptPolicyId } });
  const itNotif = await prisma.notification.findFirst({ where: { recipientId: empITUser.id, resourceRef: deptPolicyId } });
  const inactiveNotif = await prisma.notification.findFirst({ where: { recipientId: empInactiveCSUser.id, resourceRef: deptPolicyId } });

  assertTest(!!csNotif && !itNotif && !inactiveNotif, 'P', 'Department-targeted policy notifies ONLY matching active department Employees');
  assertTest(!inactiveNotif, 'Q', 'Inactive Employee is not notified');

  // R. Publishing training creates notification for appropriate active Employees
  const trainRes = await fetch(`${API_BASE}/training`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${trainToken}` },
    body: JSON.stringify({ title: 'New Cloud Security Module', description: 'Cloud security fundamentals' }),
  });
  const trainData = await trainRes.json();
  const trainId = trainData.data?.module?.id;

  const pubTrainRes = await fetch(`${API_BASE}/training/${trainId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${trainToken}` },
  });
  assertTest(pubTrainRes.status === 200, 'R_PUB', 'Training module published successfully');

  const trainNotif = await prisma.notification.findFirst({
    where: { recipientId: empCSUser.id, type: 'TRAINING_ASSIGNED', resourceRef: trainId },
  });
  assertTest(!!trainNotif, 'R', 'Publishing training creates notification for active Employees');

  // S. System Admin Helpdesk reply creates notification for ticket owner
  const ticketRes = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ subject: 'Ticket for Notif Test', description: 'Helpdesk query' }),
  });
  const ticketData = await ticketRes.json();
  const ticketId = ticketData.data?.ticket?.id;

  const adminReplyRes = await fetch(`${API_BASE}/helpdesk/tickets/${ticketId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ responseText: 'Admin reply to ticket' }),
  });
  assertTest(adminReplyRes.status === 201, 'S_REPLY', 'Admin replied to ticket');

  const helpdeskNotifOwner = await prisma.notification.findFirst({
    where: { recipientId: empAUser.id, type: 'TICKET_UPDATE', resourceRef: ticketId },
  });
  assertTest(!!helpdeskNotifOwner, 'S', 'System Admin Helpdesk reply creates notification for ticket owner');

  // T. Employee Helpdesk reply creates notification for appropriate System Admin recipient(s)
  const empReplyRes = await fetch(`${API_BASE}/helpdesk/tickets/${ticketId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ responseText: 'Employee follow up' }),
  });
  assertTest(empReplyRes.status === 201, 'T_REPLY', 'Employee replied to ticket');

  const helpdeskNotifAdmin = await prisma.notification.findFirst({
    where: { recipientId: adminUser.id, type: 'TICKET_UPDATE', resourceRef: ticketId },
  });
  assertTest(!!helpdeskNotifAdmin, 'T', 'Employee Helpdesk reply creates notification for System Admin');

  // U. Sender does not receive their own Helpdesk notification
  const empSelfNotif = await prisma.notification.findFirst({
    where: { recipientId: empAUser.id, message: { contains: 'Employee replied to helpdesk ticket' } },
  });
  assertTest(!empSelfNotif, 'U', 'Sender does not receive their own Helpdesk notification');

  // V. Responses expose no passwordHash
  const resV = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${empAToken}` } });
  const dataV = await resV.json();
  assertTest(!JSON.stringify(dataV).includes('passwordHash'), 'V', 'Responses expose no passwordHash');

  // W. Responses expose no JWT/auth secrets
  assertTest(!JSON.stringify(dataV).includes('ispm_super_secret'), 'W', 'Responses expose no JWT secrets');

  // X. Existing policy publication still works after integration
  assertTest(pubRes.status === 200, 'X', 'Existing policy publication works cleanly after notification integration');

  // Y. Existing training publication still works after integration
  assertTest(pubTrainRes.status === 200, 'Y', 'Existing training publication works cleanly after notification integration');

  // Z. Existing Helpdesk reply still works after integration
  assertTest(adminReplyRes.status === 201, 'Z', 'Existing Helpdesk reply works cleanly after notification integration');

  console.log('\n==================================================');
  console.log('SECTION 18: MANDATORY TWO-EMPLOYEE OWNERSHIP ATTACK TEST');
  console.log('==================================================\n');

  // Create isolated Notification A for Emp A and Notification B for Emp B
  const isoNotifA = await prisma.notification.create({
    data: { recipientId: empAUser.id, title: 'Iso A', message: 'Secret A', isRead: false },
  });
  const isoNotifB = await prisma.notification.create({
    data: { recipientId: empBUser.id, title: 'Iso B', message: 'Secret B', isRead: false },
  });

  // Employee A list notifications
  const listA = await (await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${empAToken}` } })).json();
  const containsIsoBInA = (listA.data?.notifications || []).some((n) => n.id === isoNotifB.id);

  // Employee A attempts PATCH Notification B /read
  const patchBbyA = await fetch(`${API_BASE}/notifications/${isoNotifB.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });

  // Employee B list notifications
  const listB = await (await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${empBToken}` } })).json();
  const containsIsoAInB = (listB.data?.notifications || []).some((n) => n.id === isoNotifA.id);

  // Employee B attempts PATCH Notification A /read
  const patchAbyB = await fetch(`${API_BASE}/notifications/${isoNotifA.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empBToken}` },
  });

  // Employee A executes mark-all-read
  const markAllA = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${empAToken}` },
  });

  // Re-check DB status
  const checkIsoA = await prisma.notification.findUnique({ where: { id: isoNotifA.id } });
  const checkIsoB = await prisma.notification.findUnique({ where: { id: isoNotifB.id } });

  console.log(`- Emp A list contains Notif B: ${containsIsoBInA} (Expected false)`);
  console.log(`- Emp A PATCH Notif B /read status: ${patchBbyA.status} (Expected 403)`);
  console.log(`- Emp B list contains Notif A: ${containsIsoAInB} (Expected false)`);
  console.log(`- Emp B PATCH Notif A /read status: ${patchAbyB.status} (Expected 403)`);
  console.log(`- Emp A mark-all-read status: ${markAllA.status} (Expected 200)`);
  console.log(`- Notif A isRead after mark-all-read: ${checkIsoA.isRead} (Expected true)`);
  console.log(`- Notif B isRead after Emp A mark-all-read: ${checkIsoB.isRead} (Expected false)`);

  const sec18Success =
    !containsIsoBInA &&
    patchBbyA.status === 403 &&
    !containsIsoAInB &&
    patchAbyB.status === 403 &&
    markAllA.status === 200 &&
    checkIsoA.isRead === true &&
    checkIsoB.isRead === false;

  assertTest(sec18Success, 'SECTION_18_ATTACK', 'Mandatory Two-Employee Notification Ownership Attack Test Passed 100%');

  console.log('\n==================================================');
  console.log(`SUMMARY: Passed ${passedCount} / ${totalCount} tests (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('==================================================\n');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
