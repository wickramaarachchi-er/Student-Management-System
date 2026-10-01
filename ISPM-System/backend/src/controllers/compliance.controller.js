/**
 * controllers/compliance.controller.js
 * Controller for Compliance Tracking and Reporting endpoints.
 */
import prisma from '../config/prisma.js';
import {
  getOrganizationComplianceDashboard,
  getEmployeeComplianceList,
  calculateSingleEmployeeCompliance,
} from '../services/compliance.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';

/**
 * GET /api/compliance/dashboard
 * COMPLIANCE_OFFICER only.
 * Returns organization-wide compliance summary metrics and category statistics.
 */
export async function getDashboard(req, res) {
  try {
    const data = await getOrganizationComplianceDashboard();

    // Audit Log
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'COMPLIANCE_REPORT_VIEWED',
      entityType: 'System',
      entityId: 'organization_dashboard',
      description: `Compliance Officer ${req.user.email} viewed organization compliance dashboard`,
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('[compliance.controller] Error loading dashboard:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve compliance dashboard metrics.',
    });
  }
}

/**
 * GET /api/compliance/employees
 * COMPLIANCE_OFFICER only.
 * Returns active employee compliance roster with optional search, department, and status filters.
 */
export async function getEmployeesList(req, res) {
  try {
    const { search, department, status } = req.query;

    const employees = await getEmployeeComplianceList({
      search,
      department,
      status,
    });

    return res.status(200).json({
      success: true,
      data: {
        employees,
        count: employees.length,
      },
    });
  } catch (err) {
    console.error('[compliance.controller] Error listing employee compliance:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee compliance roster.',
    });
  }
}

/**
 * GET /api/compliance/employees/:userId
 * COMPLIANCE_OFFICER only.
 * Returns detailed compliance evidence for a specific employee.
 */
export async function getEmployeeDetails(req, res) {
  try {
    const { userId } = req.params;

    const employee = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'EMPLOYEE',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or inactive.',
      });
    }

    const data = await calculateSingleEmployeeCompliance(employee);

    // Audit Log
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'COMPLIANCE_EMPLOYEE_VIEWED',
      entityType: 'User',
      entityId: employee.id,
      description: `Compliance Officer ${req.user.email} inspected compliance evidence for employee ${employee.email}`,
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('[compliance.controller] Error loading employee compliance detail:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee compliance evidence.',
    });
  }
}

/**
 * GET /api/compliance/me
 * EMPLOYEE only.
 * Returns authenticated employee's own compliance summary, category evidence, and outstanding actions.
 */
export async function getMyCompliance(req, res) {
  try {
    const employee = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: 'EMPLOYEE',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const data = await calculateSingleEmployeeCompliance(employee);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('[compliance.controller] Error loading personal compliance:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your compliance status.',
    });
  }
}
