/**
 * components/auth/ProtectedRoute.jsx
 * Wraps routes that require authentication.
 *
 * - While session is restoring → show a loading screen
 * - Unauthenticated → redirect to /login (with return URL preserved)
 * - Authenticated without required role → redirect to /dashboard (403 UX)
 * - Authenticated with correct role → render children
 *
 * Usage:
 *   <ProtectedRoute>                         // any authenticated user
 *   <ProtectedRoute roles={['SYSTEM_ADMIN']} // specific roles only
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (UX only – backend enforces the real authorization)
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
