/**
 * App.jsx
 * Application routing configuration.
 *
 * Routes:
 *  - /login       – Public only (redirects to /dashboard if logged in)
 *  - /            – Redirects to /dashboard
 *  - /dashboard   – Protected (requires authenticated user)
 *  - /users       – Protected (SYSTEM_ADMIN only)
 *  - /policies    – Protected (COMPLIANCE_OFFICER, EMPLOYEE)
 *  - /compliance  – Protected (COMPLIANCE_OFFICER only)
 *  - /reports     – Protected (COMPLIANCE_OFFICER only)
 *  - /training    – Protected (TRAINING_ADMIN, EMPLOYEE)
 *  - /quizzes     – Protected (TRAINING_ADMIN, EMPLOYEE)
 *  - /training-progress – Protected (TRAINING_ADMIN only)
 *  - /my-progress – Protected (EMPLOYEE only)
 *  - /helpdesk    – Protected (SYSTEM_ADMIN, EMPLOYEE)
 *  - /notifications – Protected (All authenticated)
 *  - /audit-logs  – Protected (SYSTEM_ADMIN, COMPLIANCE_OFFICER)
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import PoliciesPage from './pages/PoliciesPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* User Management – SYSTEM_ADMIN only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['SYSTEM_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <ProtectedRoute roles={['COMPLIANCE_OFFICER', 'EMPLOYEE']}>
              <PoliciesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/compliance"
          element={
            <ProtectedRoute roles={['COMPLIANCE_OFFICER']}>
              <ComingSoonPage
                title="Compliance Monitoring"
                description="Monitor real-time compliance metrics, department adherence, and policy completion rates."
                icon="award"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['COMPLIANCE_OFFICER']}>
              <ComingSoonPage
                title="Compliance Reports"
                description="Generate audit-ready compliance reports and ISO 27001 readiness assessments."
                icon="chart"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN', 'EMPLOYEE']}>
              <ComingSoonPage
                title="Security Awareness Training"
                description="Interactive cybersecurity awareness modules covering phishing, passwords, and data handling."
                icon="academic-cap"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN', 'EMPLOYEE']}>
              <ComingSoonPage
                title="Knowledge Assessments & Quizzes"
                description="Evaluate cybersecurity knowledge retention with scenario-based security questions."
                icon="clipboard-list"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training-progress"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN']}>
              <ComingSoonPage
                title="Training Progress Oversight"
                description="Track organization-wide course completions and employee certification milestones."
                icon="trending-up"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-progress"
          element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <ComingSoonPage
                title="My Security Progress"
                description="View your completed training certifications, quiz scores, and signed policies."
                icon="user-check"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/helpdesk"
          element={
            <ProtectedRoute roles={['SYSTEM_ADMIN', 'EMPLOYEE']}>
              <ComingSoonPage
                title="Security Helpdesk"
                description="Submit security inquiries, report phishing incidents, or request guidance."
                icon="helpdesk"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ComingSoonPage
              title="System Notifications"
              description="Review security advisories, policy updates, and training deadline notifications."
              icon="bell"
            />
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute roles={['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
              <ComingSoonPage
                title="Security Audit Logs"
                description="Inspect tamper-evident records of authentication events, policy edits, and administrative actions."
                icon="shield-check"
              />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
