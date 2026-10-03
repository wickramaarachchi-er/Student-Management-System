/**
 * config/env.js
 * Loads and validates environment variables using dotenv.
 * Fail fast if required variables are missing.
 */
import 'dotenv/config';

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key, defaultValue) {
  return process.env[key] ?? defaultValue;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '5001'), 10),

  // Database
  DATABASE_URL: optionalEnv('DATABASE_URL', ''),

  // JWT
  JWT_SECRET: optionalEnv('JWT_SECRET', ''),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

  // CORS – comma-separated list of allowed origins
  CORS_ORIGIN: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
};
