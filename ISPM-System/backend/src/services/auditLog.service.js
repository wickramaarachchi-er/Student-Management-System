/**
 * services/auditLog.service.js
 * Read-only service for querying AuditLog records.
 *
 * IMPORTANT: This service only provides READ access.
 * AuditLog records are IMMUTABLE – no create/update/delete methods are exposed here.
 * Writing to audit_logs is handled exclusively by audit.service.js → writeAuditLog().
 */
import prisma from '../config/prisma.js';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

/**
 * Validates a date string. Returns a Date object or null for empty input.
 * Throws a RangeError if the string is present but invalid.
 *
 * @param {string|undefined} value
 * @param {string} fieldName  – used in error messages
 * @returns {Date|null}
 */
function parseDate(value, fieldName) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new RangeError(`Invalid date value for "${fieldName}": "${value}"`);
  }
  return d;
}

/**
 * Fetches audit logs with filtering and pagination.
 *
 * @param {object} params
 * @param {string}  [params.search]      - full-text search across action / description / userEmail / entityType / entityId
 * @param {string}  [params.action]      - exact action code filter
 * @param {string}  [params.entityType]  - exact entity type filter
 * @param {string}  [params.userEmail]   - partial email filter
 * @param {string}  [params.dateFrom]    - ISO date string – start of range (inclusive)
 * @param {string}  [params.dateTo]      - ISO date string – end of range (inclusive)
 * @param {number}  [params.page]        - 1-based page number
 * @param {number}  [params.limit]       - records per page (max MAX_LIMIT)
 *
 * @returns {{ logs: AuditLog[], pagination: object }}
 */
export async function getAuditLogs({
  search,
  action,
  entityType,
  userEmail,
  dateFrom,
  dateTo,
  page  = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
} = {}) {
  // --- Validate and clamp pagination params ---
  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  const skip     = (pageNum - 1) * limitNum;

  // --- Date parsing (may throw RangeError) ---
  const from = parseDate(dateFrom, 'dateFrom');
  const to   = parseDate(dateTo,   'dateTo');

  // --- Build Prisma WHERE clause ---
  const where = {};

  // Search: match on action, description, userEmail, entityType, entityId
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { action:      { contains: s } },
      { description: { contains: s } },
      { userEmail:   { contains: s } },
      { entityType:  { contains: s } },
      { entityId:    { contains: s } },
    ];
  }

  // Exact action filter (can combine with search as AND)
  if (action && action.trim()) {
    where.action = action.trim();
  }

  // Exact entityType filter
  if (entityType && entityType.trim()) {
    where.entityType = entityType.trim();
  }

  // Partial userEmail filter
  if (userEmail && userEmail.trim()) {
    where.userEmail = { contains: userEmail.trim() };
  }

  // Date range on createdAt
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) {
      // dateTo is treated as end-of-day inclusive
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.createdAt.lte = endOfDay;
    }
  }

  // --- Execute count + findMany in parallel ---
  const [totalRecords, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      select: {
        id:          true,
        userId:      true,
        userEmail:   true,
        action:      true,
        entityType:  true,
        entityId:    true,
        description: true,
        ipAddress:   true,
        createdAt:   true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum);

  return {
    logs,
    pagination: {
      page:         pageNum,
      limit:        limitNum,
      totalRecords,
      totalPages,
    },
  };
}

/**
 * Returns distinct action codes and entity types present in the audit_logs table.
 * Used to populate filter dropdowns on the frontend.
 *
 * @returns {{ actions: string[], entityTypes: string[] }}
 */
export async function getAuditLogMeta() {
  const [rawActions, rawEntityTypes] = await Promise.all([
    prisma.$queryRaw`SELECT DISTINCT action FROM audit_logs ORDER BY action ASC`,
    prisma.$queryRaw`SELECT DISTINCT entityType FROM audit_logs WHERE entityType IS NOT NULL ORDER BY entityType ASC`,
  ]);

  return {
    actions:     rawActions.map((r) => r.action),
    entityTypes: rawEntityTypes.map((r) => r.entityType),
  };
}
