/**
 * api.js — Centralised API communication layer.
 *
 * All fetch calls go through this module so:
 *  - The API base URL is configured in one place.
 *  - Future phases don't scatter hardcoded URLs throughout the UI code.
 *
 * Because Vite proxies /api/* to Flask during development, the base URL
 * is simply an empty string in development. If you need to point to a
 * different host, update VITE_API_BASE_URL in your .env file.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Perform a GET request to the given path.
 * Throws an Error if the response is not OK.
 *
 * @param {string} path  - e.g. '/api/health'
 * @returns {Promise<any>} Parsed JSON body
 */
export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Check the backend health endpoint.
 * @returns {Promise<{ status: string, service: string, phase: string }>}
 */
export async function checkHealth() {
  return apiGet('/api/health');
}
