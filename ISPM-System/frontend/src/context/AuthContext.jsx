/**
 * context/AuthContext.jsx
 * Central authentication state for the whole application.
 *
 * Provides:
 *   - user          – safe user profile object or null
 *   - isAuthenticated – derived boolean
 *   - isInitializing  – true while session is being restored on startup
 *   - login(email, password) → { ok, message }
 *   - logout()
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '../services/api.js';
import { loginRequest, getMeRequest } from '../services/auth.service.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ── Session restore on app startup ─────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = tokenStorage.get();

      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const { ok, data } = await getMeRequest();
        if (ok && data?.data?.user) {
          setUser(data.data.user);
        } else {
          // Token is expired / invalid – clear it
          tokenStorage.remove();
          setUser(null);
        }
      } catch {
        tokenStorage.remove();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    restore();
  }, []);

  // ── Login ───────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const { ok, data } = await loginRequest(email, password);

      if (ok && data?.data?.token && data?.data?.user) {
        tokenStorage.set(data.data.token);
        setUser(data.data.user);
        return { ok: true, message: data.message };
      }

      return {
        ok: false,
        message: data?.message ?? 'Login failed. Please try again.',
      };
    } catch {
      return {
        ok: false,
        message: 'Unable to connect to the server. Please try again.',
      };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
