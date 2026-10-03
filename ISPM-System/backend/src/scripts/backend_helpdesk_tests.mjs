/**
 * backend/src/scripts/backend_helpdesk_tests.mjs
 * Comprehensive test script for HELPDESK / SECURITY QUERY module.
 *
 * Tests A-Z + Section 14 Mandatory Ownership Attack Test.
 */
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'ispm_super_secret_jwt_key_2026';

let adminToken, compToken, trainToken, empAToken, empBToken;
let empAUser, empBUser, adminUser;
let ticketAId, ticketBId;

async function setupTestUsers() {
  console.log('--- Setting up test users ---');

  // Fetch admin, comp officer, train admin from DB or generate tokens
  const admin = await prisma.user.findFirst({ where: { role: 'SYSTEM_ADMIN' } });
  const comp = await prisma.user.findFirst({ where: { role: 'COMPLIANCE_OFFICER' } });
  const train = await prisma.user.findFirst({ where: { role: 'TRAINING_ADMIN' } });

  adminUser = admin;
  adminToken = jwt.sign({ sub: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });
  compToken = jwt.sign({ sub: comp.id, email: comp.email, role: comp.role }, JWT_SECRET, { expiresIn: '1h' });
  trainToken = jwt.sign({ sub: train.id, email: train.email, role: train.role }, JWT_SECRET, { expiresIn: '1h' });

  // Create or reuse Employee A and Employee B for ownership attack testing
  const hashedPw = await bcrypt.hash('Password123!', 10);

  empAUser = await prisma.user.upsert({
    where: { email: 'helpdesk.employeeA@university.edu' },
    update: {},
    create: {
      firstName: 'EmployeeA',
      lastName: 'HelpdeskTest',
      email: 'helpdesk.employeeA@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Computer Science',
    },
  });

  empBUser = await prisma.user.upsert({
    where: { email: 'helpdesk.employeeB@university.edu' },
    update: {},
    create: {
      firstName: 'EmployeeB',
      lastName: 'HelpdeskTest',
      email: 'helpdesk.employeeB@university.edu',
      passwordHash: hashedPw,
      role: 'EMPLOYEE',
      department: 'Information Technology',
    },
  });

  empAToken = jwt.sign({ sub: empAUser.id, email: empAUser.email, role: empAUser.role }, JWT_SECRET, { expiresIn: '1h' });
  empBToken = jwt.sign({ sub: empBUser.id, email: empBUser.email, role: empBUser.role }, JWT_SECRET, { expiresIn: '1h' });

  console.log('Test users ready: Employee A ID:', empAUser.id, 'Employee B ID:', empBUser.id);
}

async function runTests() {
  await setupTestUsers();
  console.log('\n==================================================');
  console.log('RUNNING HELPDESK BACKEND TEST SUITE (A-Z + SECTION 14)');
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

  // A. Employee can create a ticket
  const resA = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({
      subject: 'Phishing Email Query - Ticket A',
      description: 'I received a suspicious email claiming to be IT support.',
      priority: 'HIGH',
      creatorId: 'FAKE_CREATOR_ID_ATTEMPT',
    }),
  });
  const dataA = await resA.json();
  assertTest(resA.status === 201 && dataA.data?.ticket?.id, 'A', 'Employee A can create Ticket A');
  ticketAId = dataA.data?.ticket?.id;

  // B. System Admin cannot use Employee ticket-creation endpoint (Employee-only)
  const resB = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ subject: 'Admin ticket', description: 'Testing admin creation' }),
  });
  assertTest(resB.status === 403, 'B', 'System Admin blocked from Employee ticket-creation endpoint');

  // C. Compliance Officer cannot create a ticket
  const resC = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${compToken}` },
    body: JSON.stringify({ subject: 'Comp ticket', description: 'Testing comp creation' }),
  });
  assertTest(resC.status === 403, 'C', 'Compliance Officer blocked from creating ticket');

  // D. Training Admin cannot create a ticket
  const resD = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${trainToken}` },
    body: JSON.stringify({ subject: 'Train ticket', description: 'Testing train creation' }),
  });
  assertTest(resD.status === 403, 'D', 'Training Admin blocked from creating ticket');

  // E. Unauthenticated creation returns 401
  const resE = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: 'Unauth ticket', description: 'Testing unauth creation' }),
  });
  assertTest(resE.status === 401, 'E', 'Unauthenticated creation returns 401');

  // F. Created ticket owner equals req.user.id
  assertTest(dataA.data?.ticket?.creatorId === empAUser.id, 'F', 'Created ticket owner equals req.user.id');

  // G. Supplied fake userId cannot change ownership
  assertTest(dataA.data?.ticket?.creatorId !== 'FAKE_CREATOR_ID_ATTEMPT', 'G', 'Supplied fake userId ignored for ownership');

  // Create Ticket B for Employee B
  const resTicketB = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empBToken}` },
    body: JSON.stringify({
      subject: 'MFA Reset Request - Ticket B',
      description: 'Lost my hardware security token.',
      priority: 'MEDIUM',
    }),
  });
  const dataTicketB = await resTicketB.json();
  ticketBId = dataTicketB.data?.ticket?.id;

  // H. Employee ticket list contains only their own tickets
  const resH = await fetch(`${API_BASE}/helpdesk/tickets`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  const dataH = await resH.json();
  const empATickets = dataH.data?.tickets || [];
  const onlyOwnA = empATickets.every((t) => t.creatorId === empAUser.id);
  assertTest(resH.status === 200 && onlyOwnA && empATickets.some((t) => t.id === ticketAId), 'H', 'Employee list contains ONLY their own tickets');

  // I. System Admin can list all tickets
  const resI = await fetch(`${API_BASE}/helpdesk/tickets`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dataI = await resI.json();
  const allTickets = dataI.data?.tickets || [];
  const containsBoth = allTickets.some((t) => t.id === ticketAId) && allTickets.some((t) => t.id === ticketBId);
  assertTest(resI.status === 200 && containsBoth, 'I', 'System Admin can list all tickets');

  // J. Employee can retrieve their own ticket
  const resJ = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  assertTest(resJ.status === 200, 'J', 'Employee can retrieve their own ticket');

  // K. Employee cannot retrieve another Employee\'s ticket
  const resK = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  assertTest(resK.status === 403, 'K', 'Employee cannot retrieve another Employee\'s ticket (403)');

  // L. System Admin can retrieve any ticket
  const resL = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assertTest(resL.status === 200, 'L', 'System Admin can retrieve any ticket');

  // M. Employee can reply to their own ticket
  const resM = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ responseText: 'Here is an update on my ticket.' }),
  });
  const dataM = await resM.json();
  assertTest(resM.status === 201 && dataM.data?.response?.id, 'M', 'Employee can reply to their own ticket');

  // N. Employee cannot reply to another Employee\'s ticket
  const resN = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ responseText: 'Malicious reply attempt by Employee A on Ticket B.' }),
  });
  assertTest(resN.status === 403, 'N', 'Employee cannot reply to another Employee\'s ticket (403)');

  // O. System Admin can reply to Employee ticket
  const resO = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ responseText: 'IT Admin investigating your inquiry.' }),
  });
  const dataO = await resO.json();
  assertTest(resO.status === 201 && dataO.data?.response?.id, 'O', 'System Admin can reply to Employee ticket');

  // P. Response author is derived from req.user.id
  assertTest(dataO.data?.response?.responderId === adminUser.id, 'P', 'Response author derived from req.user.id');

  // Q. Empty response is rejected
  const resQ = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ responseText: '   ' }),
  });
  assertTest(resQ.status === 400, 'Q', 'Empty response rejected with 400');

  // R. System Admin can update ticket status
  const resR = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'RESOLVED' }),
  });
  const dataR = await resR.json();
  assertTest(resR.status === 200 && dataR.data?.ticket?.status === 'RESOLVED', 'R', 'System Admin can update ticket status');

  // S. Employee cannot update ticket status
  const resS = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ status: 'CLOSED' }),
  });
  assertTest(resS.status === 403, 'S', 'Employee cannot update ticket status (403)');

  // T. Invalid ticket status is rejected
  const resT = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'INVALID_STATUS' }),
  });
  assertTest(resT.status === 400, 'T', 'Invalid status rejected with 400');

  // U. Invalid priority is rejected
  const resU = await fetch(`${API_BASE}/helpdesk/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ subject: 'Test Priority', description: 'Test desc', priority: 'ULTRA_HIGH' }),
  });
  assertTest(resU.status === 400, 'U', 'Invalid priority rejected with 400');

  // V. Responses returned in chronological order
  const resV = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dataV = await resV.json();
  const responsesV = dataV.data?.ticket?.responses || [];
  let isChronological = true;
  for (let i = 1; i < responsesV.length; i++) {
    if (new Date(responsesV[i].createdAt) < new Date(responsesV[i - 1].createdAt)) {
      isChronological = false;
    }
  }
  assertTest(resV.status === 200 && responsesV.length >= 2 && isChronological, 'V', 'Responses returned in chronological order');

  // W. passwordHash is not exposed
  const hasPasswordHash = JSON.stringify(dataV).includes('passwordHash');
  assertTest(!hasPasswordHash, 'W', 'passwordHash is not exposed');

  // X. JWT/authentication secrets are not exposed
  const hasSecrets = JSON.stringify(dataV).includes('ispm_super_secret');
  assertTest(!hasSecrets, 'X', 'JWT secrets not exposed');

  // Y. Helpdesk audit events are recorded
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: { in: ['HELPDESK_TICKET_CREATED', 'HELPDESK_RESPONSE_ADDED', 'HELPDESK_STATUS_CHANGED'] } },
  });
  assertTest(auditLogs.length >= 3, 'Y', 'Helpdesk audit events recorded in database');

  // Z. Audit logs contain no credentials/tokens
  const auditStr = JSON.stringify(auditLogs);
  const auditClean = !auditStr.includes('passwordHash') && !auditStr.includes('Bearer');
  assertTest(auditClean, 'Z', 'Audit logs contain no credentials or tokens');

  console.log('\n==================================================');
  console.log('SECTION 14: MANDATORY TWO-EMPLOYEE OWNERSHIP ATTACK TEST');
  console.log('==================================================\n');

  // Attempt 1: Employee A -> GET Ticket B
  const atk1 = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}`, {
    headers: { Authorization: `Bearer ${empAToken}` },
  });
  console.log(`- Attempt 1: Employee A GET Ticket B -> Status ${atk1.status} (Expected 403)`);

  // Attempt 2: Employee A -> POST response to Ticket B
  const atk2 = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empAToken}` },
    body: JSON.stringify({ responseText: 'Unauthorized response from A to B' }),
  });
  console.log(`- Attempt 2: Employee A POST response Ticket B -> Status ${atk2.status} (Expected 403)`);

  // Attempt 3: Employee B -> GET Ticket A
  const atk3 = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}`, {
    headers: { Authorization: `Bearer ${empBToken}` },
  });
  console.log(`- Attempt 3: Employee B GET Ticket A -> Status ${atk3.status} (Expected 403)`);

  // Attempt 4: Employee B -> POST response to Ticket A
  const atk4 = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empBToken}` },
    body: JSON.stringify({ responseText: 'Unauthorized response from B to A' }),
  });
  console.log(`- Attempt 4: Employee B POST response Ticket A -> Status ${atk4.status} (Expected 403)`);

  // Verification: SYSTEM_ADMIN can retrieve and respond to BOTH
  const adminGetA = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const adminGetB = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const adminRespA = await fetch(`${API_BASE}/helpdesk/tickets/${ticketAId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ responseText: 'System Admin resolution note for Ticket A' }),
  });
  const adminRespB = await fetch(`${API_BASE}/helpdesk/tickets/${ticketBId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ responseText: 'System Admin resolution note for Ticket B' }),
  });

  const attackTestSuccess =
    atk1.status === 403 &&
    atk2.status === 403 &&
    atk3.status === 403 &&
    atk4.status === 403 &&
    adminGetA.status === 200 &&
    adminGetB.status === 200 &&
    adminRespA.status === 201 &&
    adminRespB.status === 201;

  assertTest(attackTestSuccess, 'SECTION_14_ATTACK_TEST', 'Mandatory Two-Employee Ownership Attack Test Passed 100%');

  console.log('\n==================================================');
  console.log(`SUMMARY: Passed ${passedCount} / ${totalCount} tests (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('==================================================\n');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
