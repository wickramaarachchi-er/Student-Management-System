/**
 * components/auth/PublicOnlyRoute.jsx
 * Wraps routes that should only be accessible when NOT logged in (e.g. /login).
 * If user is already authenticated, redirects them straight to /dashboard.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
