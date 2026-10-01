/**
 * utils/jwt.js
 * JWT sign and verify helpers.
 * All secrets come from environment variables – never hardcoded.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT containing the given payload.
 * Expiry is controlled by JWT_EXPIRES_IN (default "7d").
 *
 * @param {object} payload  – data to embed (do NOT include sensitive fields)
 * @returns {string}         signed JWT string
 */
export function signToken(payload) {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifies and decodes a JWT.
 * Throws a JsonWebTokenError or TokenExpiredError on failure.
 *
 * @param {string} token  – raw JWT string
 * @returns {object}       decoded payload
 */
export function verifyToken(token) {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, env.JWT_SECRET);
}
