/**
 * services/user.service.js
 * Business logic for user management operations.
 */
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

export const SAFE_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Lists users with filtering and search support.
 *
 * @param {object} filters
 * @param {string} [filters.search]
 * @param {string} [filters.role]
 * @param {string} [filters.status] - 'active' | 'inactive' | 'all'
 * @returns {Promise<Array<object>>}
 */
export async function listUsers({ search, role, status } = {}) {
  const where = {};

  // Role filter
  if (role && ['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'TRAINING_ADMIN', 'EMPLOYEE'].includes(role)) {
    where.role = role;
  }

  // Status filter
  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  // Search filter across firstName, lastName, email, department
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { department: { contains: q } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: SAFE_USER_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieves a single user by ID.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });
}

/**
 * Finds user by email.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

/**
 * Creates a new user with a hashed password.
 *
 * @param {object} userData
 * @returns {Promise<object>} Safe user profile
 */
export async function createUser(userData) {
  const normalisedEmail = userData.email.trim().toLowerCase();

  // Check unique email
  const existing = await findUserByEmail(normalisedEmail);
  if (existing) {
    const err = new Error('A user with this email address already exists.');
    err.status = 409;
    throw err;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  const newUser = await prisma.user.create({
    data: {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: normalisedEmail,
      passwordHash,
      role: userData.role,
      department: userData.department ? userData.department.trim() : null,
      phone: userData.phone ? userData.phone.trim() : null,
      isActive: true,
    },
    select: SAFE_USER_SELECT,
  });

  return newUser;
}

/**
 * Updates profile fields for an existing user.
 *
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>} Safe user profile
 */
export async function updateUser(id, updateData) {
  const existing = await findUserById(id);
  if (!existing) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const data = {};

  if (updateData.firstName !== undefined) data.firstName = updateData.firstName.trim();
  if (updateData.lastName !== undefined) data.lastName = updateData.lastName.trim();

  if (updateData.email !== undefined) {
    const normalisedEmail = updateData.email.trim().toLowerCase();
    if (normalisedEmail !== existing.email) {
      const emailInUse = await findUserByEmail(normalisedEmail);
      if (emailInUse && emailInUse.id !== id) {
        const err = new Error('A user with this email address already exists.');
        err.status = 409;
        throw err;
      }
      data.email = normalisedEmail;
    }
  }

  if (updateData.role !== undefined) data.role = updateData.role;
  if (updateData.department !== undefined) data.department = updateData.department ? updateData.department.trim() : null;
  if (updateData.phone !== undefined) data.phone = updateData.phone ? updateData.phone.trim() : null;

  return prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_SELECT,
  });
}

/**
 * Updates activation status of an existing user.
 *
 * @param {string} id
 * @param {boolean} isActive
 * @param {string} actingAdminId
 * @returns {Promise<object>} Safe user profile
 */
export async function setUserStatus(id, isActive, actingAdminId) {
  const existing = await findUserById(id);
  if (!existing) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  // Safety rule: Self-deactivation prevention
  if (id === actingAdminId && !isActive) {
    const err = new Error('Administrators cannot deactivate their own account.');
    err.status = 400;
    throw err;
  }

  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: SAFE_USER_SELECT,
  });
}
