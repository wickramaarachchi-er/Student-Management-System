/**
 * controllers/auditLog.controller.js
 * Express controllers for the read-only Audit Log API.
 *
 * RBAC: SYSTEM_ADMIN and COMPLIANCE_OFFICER only.
 * No POST / PATCH / DELETE endpoints are defined.
 */
import { getAuditLogs, getAuditLogMeta } from '../services/auditLog.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * GET /api/audit-logs
 *
 * Query params:
 *   search, action, entityType, userEmail,
 *   dateFrom, dateTo, page, limit
 */
export async function listAuditLogs(req, res) {
  try {
    const {
      search,
      action,
      entityType,
      userEmail,
      dateFrom,
      dateTo,
      page  = '1',
      limit = '20',
    } = req.query;

    // Validate page is a positive integer
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return sendError(res, { status: 400, message: 'Query parameter "page" must be a positive integer.' });
    }

    // Validate limit is a positive integer
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return sendError(res, { status: 400, message: 'Query parameter "limit" must be a positive integer.' });
    }

    let result;
    try {
      result = await getAuditLogs({
        search,
        action,
        entityType,
        userEmail,
        dateFrom,
        dateTo,
        page:  pageNum,
        limit: limitNum,
      });
    } catch (err) {
      if (err instanceof RangeError) {
        return sendError(res, { status: 400, message: err.message });
      }
      throw err;
    }

    return sendSuccess(res, {
      message: 'Audit logs retrieved successfully.',
      data: {
        logs:       result.logs,
        pagination: result.pagination,
      },
    });
  } catch (err) {
    console.error('[AuditLog] listAuditLogs error:', err.message);
    return sendError(res, { status: 500, message: 'Internal server error while retrieving audit logs.' });
  }
}

/**
 * GET /api/audit-logs/meta
 * Returns distinct action codes and entity types for filter dropdowns.
 */
export async function getAuditMeta(req, res) {
  try {
    const meta = await getAuditLogMeta();
    return sendSuccess(res, {
      message: 'Audit log metadata retrieved successfully.',
      data: meta,
    });
  } catch (err) {
    console.error('[AuditLog] getAuditMeta error:', err.message);
    return sendError(res, { status: 500, message: 'Internal server error while retrieving audit log metadata.' });
  }
}
