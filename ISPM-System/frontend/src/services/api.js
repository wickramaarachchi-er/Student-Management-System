/**
 * services/api.js
 * Base fetch wrapper.
 * All API calls in the application go through here – base URL is read
 * once from the Vite env variable so it is never hardcoded in components.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error('[api] VITE_API_BASE_URL is not set. Check your .env file.');
}

/**
 * Internal token getter – reads from localStorage.
 * Centralised here so the storage key is defined in one place.
 */
const TOKEN_KEY = 'ispm_access_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Makes an authenticated (or unauthenticated) API request.
 *
 * @param {string} path     – e.g. '/auth/login' (leading slash required)
 * @param {RequestInit} options – standard fetch options
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiFetch(path, options = {}) {
  const token = tokenStorage.get();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (e.g. 204 No Content)
  }

  return { ok: response.ok, status: response.status, data };
}
