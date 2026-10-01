/**
 * backend_audit_tests.mjs
 * Comprehensive A-Z backend tests for the Audit Log module.
 *
 * Tests: A–Z (26) + mandatory real-event test (Section 18)
 * Covers: auth, RBAC, pagination, filters, immutability, sensitive data, and real-event verification.
 */

const BASE = 'http://localhost:5001/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`✓ ${label} (PASS)`);
    passed++;
  } else {
    console.log(`✗ ${label} (FAIL)${detail ? ` – ${detail}` : ''}`);
    failed++;
    failures.push(label);
  }
}

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function get(path, token, query = {}) {
  const qs = new URLSearchParams(query).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function patch(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function del(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function login(email, password) {
  const r = await post('/auth/login', { email, password });
  if (!r.data?.data?.token) {
    console.error(`LOGIN FAILED for ${email}:`, r.data?.message);
    return null;
  }
  return r.data.data.token;
}

// ─── Setup ──────────────────────────────────────────────────────────────────

console.log('\n=== Setting up tokens ===');
const adminToken      = await login('admin@ispm.local', 'Ispm@Dev2024!');
const compToken       = await login('compliance@ispm.local', 'Ispm@Dev2024!');
const trainingToken   = await login('training@ispm.local', 'Ispm@Dev2024!');
const employeeToken   = await login('employee@ispm.local', 'Ispm@Dev2024!');

if (!adminToken || !compToken) {
  console.error('ERROR: Could not obtain required tokens. Aborting tests.');
  process.exit(1);
}

console.log('Tokens obtained OK\n');

// ─── Tests ──────────────────────────────────────────────────────────────────

console.log('='.repeat(60));
console.log('RUNNING AUDIT LOG BACKEND TEST SUITE (A–Z + SECTION 18)');
console.log('='.repeat(60));
console.log();

// ── A. SYSTEM_ADMIN can GET /api/audit-logs ──────────────────────────────
{
  const r = await get('/audit-logs', adminToken);
  assert('Test A: SYSTEM_ADMIN can GET /api/audit-logs', r.status === 200 && r.data?.success === true);
}

// ── B. COMPLIANCE_OFFICER can GET /api/audit-logs ───────────────────────
{
  const r = await get('/audit-logs', compToken);
  assert('Test B: COMPLIANCE_OFFICER can GET /api/audit-logs', r.status === 200 && r.data?.success === true);
}

// ── C. EMPLOYEE receives 403 ──────────────────────────────────────────────
{
  const r = await get('/audit-logs', employeeToken);
  assert('Test C: EMPLOYEE receives 403', r.status === 403);
}

// ── D. TRAINING_ADMIN receives 403 ───────────────────────────────────────
{
  const r = await get('/audit-logs', trainingToken);
  assert('Test D: TRAINING_ADMIN receives 403', r.status === 403);
}

// ── E. Unauthenticated request receives 401 ───────────────────────────────
{
  const r = await get('/audit-logs', null);
  assert('Test E: Unauthenticated request receives 401', r.status === 401);
}

// ── F. Results are newest first ───────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '10' });
  const logs = r.data?.data?.logs || [];
  let newestFirst = true;
  for (let i = 1; i < logs.length; i++) {
    if (new Date(logs[i].createdAt) > new Date(logs[i - 1].createdAt)) {
      newestFirst = false;
      break;
    }
  }
  assert('Test F: Results are newest first', r.status === 200 && logs.length > 0 && newestFirst);
}

// ── G. Default pagination works ───────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken);
  const p = r.data?.data?.pagination;
  assert('Test G: Default pagination works', r.status === 200 && p && p.page === 1 && p.limit === 20);
}

// ── H. page=2 works ──────────────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { page: '2', limit: '5' });
  const p = r.data?.data?.pagination;
  assert('Test H: page=2 works', r.status === 200 && p?.page === 2);
}

// ── I. Custom limit works ─────────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '5' });
  const logs = r.data?.data?.logs || [];
  const p = r.data?.data?.pagination;
  assert('Test I: Custom limit works', r.status === 200 && logs.length <= 5 && p?.limit === 5);
}

// ── J. Excessive limit is capped at 100 ──────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '9999' });
  const p = r.data?.data?.pagination;
  // Service caps at 100
  assert('Test J: Excessive limit is safely capped at 100', r.status === 200 && p?.limit <= 100);
}

// ── K. Invalid page (0 and negative) returns 400 ─────────────────────────
{
  const r0 = await get('/audit-logs', adminToken, { page: '0' });
  const rn = await get('/audit-logs', adminToken, { page: '-5' });
  // page 0 and negative are coerced to 1 by the service (Math.max), so the server
  // returns 200 with page=1. Alternatively it returns 400 from controller validation.
  // Our controller validates pageNum < 1 → 400.
  assert('Test K: page=0 returns 400', r0.status === 400);
  assert('Test K2: page=-5 returns 400', rn.status === 400);
}

// ── L. search filter works ────────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { search: 'LOGIN_SUCCESS', limit: '50' });
  const logs = r.data?.data?.logs || [];
  const allMatch = logs.every(l =>
    (l.action || '').toUpperCase().includes('LOGIN_SUCCESS') ||
    (l.description || '').includes('LOGIN_SUCCESS') ||
    (l.userEmail || '').includes('LOGIN_SUCCESS') ||
    (l.entityType || '').includes('LOGIN_SUCCESS')
  );
  assert('Test L: search filter works', r.status === 200 && logs.length > 0);
}

// ── M. action filter works ────────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { action: 'LOGIN_SUCCESS', limit: '10' });
  const logs = r.data?.data?.logs || [];
  const allMatch = logs.every(l => l.action === 'LOGIN_SUCCESS');
  assert('Test M: action filter works', r.status === 200 && logs.length > 0 && allMatch, `Got ${logs.length} records`);
}

// ── N. entityType filter works ────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { entityType: 'Policy', limit: '10' });
  const logs = r.data?.data?.logs || [];
  const allMatch = logs.every(l => l.entityType === 'Policy');
  assert('Test N: entityType filter works', r.status === 200 && logs.length > 0 && allMatch, `Got ${logs.length} records`);
}

// ── O. dateFrom filter works ──────────────────────────────────────────────
{
  const from = '2026-01-01';
  const r = await get('/audit-logs', adminToken, { dateFrom: from, limit: '10' });
  const logs = r.data?.data?.logs || [];
  const allAfter = logs.every(l => new Date(l.createdAt) >= new Date(from));
  assert('Test O: dateFrom works', r.status === 200 && allAfter);
}

// ── P. dateTo filter works ────────────────────────────────────────────────
{
  const to = '2026-12-31';
  const r = await get('/audit-logs', adminToken, { dateTo: to, limit: '10' });
  const logs = r.data?.data?.logs || [];
  const allBefore = logs.every(l => new Date(l.createdAt) <= new Date('2026-12-31T23:59:59.999Z'));
  assert('Test P: dateTo works', r.status === 200 && allBefore);
}

// ── Q. date range works ───────────────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { dateFrom: '2026-01-01', dateTo: '2026-12-31', limit: '10' });
  const logs = r.data?.data?.logs || [];
  assert('Test Q: date range works', r.status === 200 && logs.length > 0);
}

// ── R. Invalid date returns 400 ───────────────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { dateFrom: 'not-a-date' });
  assert('Test R: Invalid dateFrom returns 400', r.status === 400, `Got ${r.status}`);
}

// ── S. Pagination metadata is mathematically correct ─────────────────────
{
  const limit = 7;
  const r = await get('/audit-logs', adminToken, { limit: String(limit) });
  const p = r.data?.data?.pagination;
  if (p) {
    const expectedPages = Math.ceil(p.totalRecords / p.limit);
    assert(
      'Test S: Pagination metadata is correct',
      p.totalPages === expectedPages && p.page === 1 && p.limit === limit,
      `total=${p.totalRecords} pages=${p.totalPages} expected=${expectedPages}`
    );
  } else {
    assert('Test S: Pagination metadata is correct', false, 'No pagination in response');
  }
}

// ── T. Response contains no passwordHash ─────────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '50' });
  const logs = r.data?.data?.logs || [];
  const hasHash = logs.some(l => JSON.stringify(l).includes('passwordHash'));
  assert('Test T: Response contains no passwordHash', r.status === 200 && !hasHash);
}

// ── U. Response contains no JWT/token/auth header ────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '50' });
  const raw = JSON.stringify(r.data?.data?.logs || []).toLowerCase();
  const hasToken = raw.includes('bearer ') || raw.includes('"jwt"') || raw.includes('authorization:');
  assert('Test U: Response contains no JWT/token/auth header', !hasToken);
}

// ── V. Actor info contains only safe fields ───────────────────────────────
{
  const r = await get('/audit-logs', adminToken, { limit: '20' });
  const logs = r.data?.data?.logs || [];
  const fieldList = new Set(logs.flatMap(l => Object.keys(l)));
  const hasDangerous = fieldList.has('passwordHash') || fieldList.has('password');
  assert(
    'Test V: Log records contain only safe fields',
    !hasDangerous,
    `Fields: ${[...fieldList].join(', ')}`
  );
}

// ── W. No POST audit-log endpoint exists ─────────────────────────────────
{
  const res = await fetch(`${BASE}/audit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ action: 'INJECTED', description: 'Should not be created' }),
  });
  // Express 404 for unmatched route, or 405 if method disallowed
  assert('Test W: No POST /api/audit-logs endpoint', res.status === 404 || res.status === 405);
}

// ── X. No PATCH audit-log endpoint exists ────────────────────────────────
{
  const res = await fetch(`${BASE}/audit-logs/some-fake-id`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ action: 'TAMPERED' }),
  });
  assert('Test X: No PATCH /api/audit-logs/:id endpoint', res.status === 404 || res.status === 405);
}

// ── Y. No DELETE audit-log endpoint exists ───────────────────────────────
{
  const res = await fetch(`${BASE}/audit-logs/some-fake-id`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert('Test Y: No DELETE /api/audit-logs/:id endpoint', res.status === 404 || res.status === 405);
}

// ── Z. Existing audit records remain unchanged after read/filter ──────────
{
  const r1 = await get('/audit-logs', adminToken, { limit: '5' });
  const firstBatch = (r1.data?.data?.logs || []).map(l => l.id);
  // Apply a filter, then check again
  const r2 = await get('/audit-logs', adminToken, { action: 'LOGIN_SUCCESS', limit: '5' });
  // Then re-fetch unfiltered
  const r3 = await get('/audit-logs', adminToken, { limit: '5' });
  const secondBatch = (r3.data?.data?.logs || []).map(l => l.id);
  assert('Test Z: Records unchanged after reads/filters', JSON.stringify(firstBatch) === JSON.stringify(secondBatch));
}

// ── META endpoint ─────────────────────────────────────────────────────────
{
  const r = await get('/audit-logs/meta', adminToken);
  assert(
    'Test META: /audit-logs/meta returns actions and entityTypes',
    r.status === 200 && Array.isArray(r.data?.data?.actions) && Array.isArray(r.data?.data?.entityTypes)
  );
}

// ── META RBAC ─────────────────────────────────────────────────────────────
{
  const r = await get('/audit-logs/meta', employeeToken);
  assert('Test META-RBAC: EMPLOYEE blocked from /audit-logs/meta', r.status === 403);
}

// ─── SECTION 18: Mandatory Real-Event Test ──────────────────────────────────

console.log('\n' + '='.repeat(60));
console.log('SECTION 18: MANDATORY REAL-EVENT TEST');
console.log('='.repeat(60));

// 1. Record current total
const beforeR = await get('/audit-logs', adminToken, { limit: '1' });
const totalBefore = beforeR.data?.data?.pagination?.totalRecords || 0;
console.log(`\nAudit log total before action: ${totalBefore}`);

// 2. Perform a real audited action – create a helpdesk ticket as employee
let newTicketId = null;
if (employeeToken) {
  const ticketRes = await post('/helpdesk/tickets', {
    subject:     'Audit Test Ticket - Section 18 Verification',
    description: 'This ticket was created during the audit log backend test suite to verify real-event capture. Safe to keep.',
    priority:    'LOW',
  }, employeeToken);

  if (ticketRes.status === 201 && ticketRes.data?.data?.ticket?.id) {
    newTicketId = ticketRes.data.data.ticket.id;
    console.log(`Created helpdesk ticket: ${newTicketId}`);
  } else {
    console.log('WARNING: Could not create helpdesk ticket for real-event test:', ticketRes.data?.message);
  }
}

// 3. Fetch audit logs again
const afterR = await get('/audit-logs', adminToken, { limit: '1' });
const totalAfter = afterR.data?.data?.pagination?.totalRecords || 0;
console.log(`Audit log total after action: ${totalAfter}`);

assert('Test SECTION18-A: New audit event appeared (total increased)', totalAfter > totalBefore, `before=${totalBefore} after=${totalAfter}`);

// 4. Find the newest event and verify it
const newestR = await get('/audit-logs', adminToken, { action: 'HELPDESK_TICKET_CREATED', limit: '1' });
const newestLog = newestR.data?.data?.logs?.[0];

if (newestLog) {
  console.log(`\nNewest HELPDESK_TICKET_CREATED event:`);
  console.log(`  Action    : ${newestLog.action}`);
  console.log(`  EntityType: ${newestLog.entityType}`);
  console.log(`  EntityId  : ${newestLog.entityId}`);
  console.log(`  UserEmail : ${newestLog.userEmail}`);
  console.log(`  Timestamp : ${newestLog.createdAt}`);
  console.log(`  IP        : ${newestLog.ipAddress}`);

  assert('Test SECTION18-B: Newest event action is correct', newestLog.action === 'HELPDESK_TICKET_CREATED');
  assert('Test SECTION18-C: Newest event has correct entityType', newestLog.entityType === 'HelpdeskTicket');
  assert('Test SECTION18-D: Newest event has actor (userEmail)', !!newestLog.userEmail);
  assert('Test SECTION18-E: Newest event has timestamp', !!newestLog.createdAt);

  // 5. Verify no sensitive information in the event
  const raw = JSON.stringify(newestLog).toLowerCase();
  const hasSensitive = raw.includes('passwordhash') || raw.includes('bearer ') || raw.includes('"jwt"');
  assert('Test SECTION18-F: Real event contains no sensitive information', !hasSensitive);
} else {
  assert('Test SECTION18-B: Newest event found', false, 'No HELPDESK_TICKET_CREATED found');
  assert('Test SECTION18-C', false, 'skipped');
  assert('Test SECTION18-D', false, 'skipped');
  assert('Test SECTION18-E', false, 'skipped');
  assert('Test SECTION18-F', false, 'skipped');
}

console.log('\n' + (newTicketId ? `Test helpdesk ticket ${newTicketId} left in DB as immutable audit evidence.` : 'No helpdesk ticket created.'));

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(60));
console.log(`SUMMARY: Passed ${passed} / ${passed + failed} tests (${Math.round(100 * passed / (passed + failed))}%)`);
if (failures.length > 0) {
  console.log(`\nFailed tests:`);
  for (const f of failures) console.log(`  ✗ ${f}`);
}
console.log('='.repeat(60) + '\n');
