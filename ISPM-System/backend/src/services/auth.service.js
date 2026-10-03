/**
 * services/auth.service.js
 * Business logic for authentication.
 * Controllers call these functions; they should not directly touch req/res.
 */
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';

/**
 * Fields selected from the DB for any authenticated user context.
 * passwordHash is intentionally excluded.
 */
const SAFE_USER_SELECT = {
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
 * Attempts to log a user in.
 *
 * @param {string} email     – raw email from request body
 * @param {string} password  – raw password from request body (never logged/stored)
 *
 * @returns {{ token: string, user: object }}
 *
 * @throws {Error} with .status 401 for any authentication failure.
 *                 Generic message to prevent email/password enumeration.
 */
export async function loginUser(email, password) {
  // 1. Normalise email (trim + lowercase)
  const normalisedEmail = email.trim().toLowerCase();

  // 2. Find user – include passwordHash only for comparison, then discard
  const userWithHash = await prisma.user.findUnique({
    where: { email: normalisedEmail },
  });

  // Generic error – never reveal whether email or password was wrong
  const authError = new Error('Invalid email or password');
  authError.status = 401;

  // 3. Email not found
  if (!userWithHash) {
    throw authError;
  }

  // 4. Inactive account
  if (!userWithHash.isActive) {
    const inactiveError = new Error('Your account has been deactivated. Please contact an administrator.');
    inactiveError.status = 401;
    throw inactiveError;
  }

  // 5. Compare password (constant-time bcrypt compare)
  const passwordMatch = await bcrypt.compare(password, userWithHash.passwordHash);
  if (!passwordMatch) {
    throw authError;
  }

  // 6. Build safe user object (no passwordHash)
  const user = {
    id: userWithHash.id,
    firstName: userWithHash.firstName,
    lastName: userWithHash.lastName,
    email: userWithHash.email,
    role: userWithHash.role,
    department: userWithHash.department,
    phone: userWithHash.phone,
    isActive: userWithHash.isActive,
    createdAt: userWithHash.createdAt,
    updatedAt: userWithHash.updatedAt,
  };

  // 7. Sign JWT – embed only non-sensitive identity fields
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return { token, user };
}

/**
 * Loads a safe user profile by ID for the /me endpoint.
 * Returns null if the user does not exist or is inactive.
 *
 * @param {string} userId
 * @returns {object|null}
 */
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user || !user.isActive) return null;
  return user;
}
