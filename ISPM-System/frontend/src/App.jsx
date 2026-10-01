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
import TrainingPage from './pages/TrainingPage.jsx';
import TrainingProgressPage from './pages/TrainingProgressPage.jsx';
import MyProgressPage from './pages/MyProgressPage.jsx';
import QuizzesPage from './pages/QuizzesPage.jsx';
import ComplianceDashboardPage from './pages/ComplianceDashboardPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
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
              <ComplianceDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['COMPLIANCE_OFFICER']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN', 'EMPLOYEE']}>
              <TrainingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN', 'EMPLOYEE']}>
              <QuizzesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training-progress"
          element={
            <ProtectedRoute roles={['TRAINING_ADMIN']}>
              <TrainingProgressPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-progress"
          element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <MyProgressPage />
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
