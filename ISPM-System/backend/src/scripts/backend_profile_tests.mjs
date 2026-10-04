import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { changeUserPassword } from '../services/auth.service.js';
import { changePassword } from '../controllers/auth.controller.js';

// Exercise password verification and persistence without modifying the database.
const originalFind = prisma.user.findUnique;
const originalUpdate = prisma.user.updateMany;
const originalAudit = prisma.auditLog.create;
const originalHash = await bcrypt.hash('CurrentPass123!', 4);
let storedHash = originalHash;
let writes = 0;
let audits = [];
prisma.user.findUnique = async ({ where }) => ({ id: where.id, isActive: true, passwordHash: storedHash });
prisma.user.updateMany = async ({ where, data }) => {
  assert.equal(where.passwordHash, storedHash);
  assert.equal(where.isActive, true);
  storedHash = data.passwordHash;
  writes++;
  return { count: 1 };
};
prisma.auditLog.create = async ({ data }) => { audits.push(data); };
function response() {
  return { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
try {
  await assert.rejects(changeUserPassword('self', 'WrongPassword', 'NewPassword123!'), /Current password is incorrect/);
  await assert.rejects(changeUserPassword('self', 'CurrentPass123!', 'CurrentPass123!'), /different/);
  assert.equal(writes, 0);
  for (const role of ['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'TRAINING_ADMIN', 'EMPLOYEE']) {
    storedHash = originalHash;
    const res = response();
    await changePassword({ user: { id: role, role, email: 'test@example.com' }, headers: {},
      body: { currentPassword: 'CurrentPass123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' } }, res, (err) => { throw err; });
    assert.equal(res.code, 200);
    assert.equal(res.body.success, true);
    assert.equal(await bcrypt.compare('NewPassword123!', storedHash), true);
    assert.equal(await bcrypt.compare('CurrentPass123!', storedHash), false);
    assert.equal(audits.at(-1).userId, role);
    assert.equal(audits.at(-1).action, 'PASSWORD_CHANGED');
    assert.equal(JSON.stringify(audits).includes('Password123!'), false);
  }
  for (const body of [
    {},
    { currentPassword: 'x', newPassword: 'short', confirmPassword: 'short' },
    { currentPassword: 'x', newPassword: 'NewPassword123!', confirmPassword: 'Mismatch123!' },
    { currentPassword: 'x', newPassword: 'é'.repeat(37), confirmPassword: 'é'.repeat(37) },
    { currentPassword: 'x', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!', userId: 'other-user' },
  ]) {
    const res = response();
    await changePassword({ body }, res, (err) => { throw err; });
    assert.equal(res.code, 400);
  }
  assert.equal(writes, 4);
  prisma.user.updateMany = async () => ({ count: 0 });
  await assert.rejects(changeUserPassword('self', 'NewPassword123!', 'AnotherPassword123!'), (err) => err.status === 409);
  prisma.user.findUnique = async () => null;
  await assert.rejects(changeUserPassword('self', 'x', 'AnotherPassword123!'), (err) => err.status === 401);
  console.log('Profile password checks passed: all four roles, verification, hashing, validation, audit safety, and concurrent updates.');
} finally {
  prisma.user.findUnique = originalFind;
  prisma.user.updateMany = originalUpdate;
  prisma.auditLog.create = originalAudit;
  await prisma.$disconnect();
}
