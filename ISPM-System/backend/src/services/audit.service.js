/**
 * services/audit.service.js
 * Centralised audit-log writer.
 *
 * Rules:
 *  - userId is nullable (pre-auth events such as failed logins)
 *  - Never log passwords, tokens, or secrets
 *  - Errors inside the audit writer must NOT crash the main request flow
 */
import prisma from '../config/prisma.js';

/**
 * @typedef {object} AuditParams
 * @property {string|null}  [userId]      – authenticated user's CUID (null for pre-auth)
 * @property {string|null}  [userEmail]   – snapshot of email for pre-auth events
 * @property {string}       action        – short action code e.g. LOGIN_SUCCESS
 * @property {string|null}  [entityType]  – model name e.g. "User"
 * @property {string|null}  [entityId]    – entity CUID
 * @property {string|null}  [description] – human-readable detail (no secrets)
 * @property {string|null}  [ipAddress]   – client IP (IPv4 or IPv6)
 */

/**
 * Writes a record to the audit_logs table.
 * Silently swallows errors so a logging failure never breaks the API.
 *
 * @param {AuditParams} params
 */
export async function writeAuditLog(params) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userEmail: params.userEmail ?? null,
        action: params.action,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        description: params.description ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    // Log to stderr but never propagate – audit failures must not block the API
    console.error('[AuditLog] Failed to write audit entry:', err.message);
  }
}

/**
 * Extracts a best-effort client IP from an Express request.
 * Handles X-Forwarded-For when a proxy is in front.
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For may contain a comma-separated list; take the first
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}
