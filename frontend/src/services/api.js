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
 * Perform a POST request to the given path with a JSON body.
 * Throws an Error if the response is not OK.
 *
 * @param {string} path  - e.g. '/api/run'
 * @param {object} body  - Request payload object
 * @returns {Promise<any>} Parsed JSON body
 */
export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error ?? `HTTP ${response.status}`);
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

/**
 * Execute Python source code via the Code Runner Engine (Phase A3/A4).
 *
 * @param {string} code  - Python source code to execute
 * @param {string} [stdin=""] - Optional standard input string
 * @returns {Promise<{
 *   status: string,
 *   stdout: string,
 *   stderr: string,
 *   exit_code: number|null,
 *   execution_time_ms: number,
 *   timed_out: boolean,
 *   error: string|null,
 *   details: {
 *     error_type: string|null,
 *     error_message: string|null,
 *     line_number: number|null
 *   },
 *   diagnostic: {
 *     has_diagnostic: boolean,
 *     error_type: string|null,
 *     title: string,
 *     friendly_explanation: string,
 *     hint: string|null,
 *     line_number: number|null,
 *     code_snippet: string|null,
 *     category: string,
 *     confidence: string
 *   }|null
 * }>}
 */
export async function runCode(code, stdin = '') {
  return apiPost('/api/run', { code, stdin });
}

/**
 * Generate educational diagnostic for code and error details (Phase A4).
 *
 * @param {string} code - Python source code
 * @param {object} [errorDetails={}] - Optional error details (error_type, error_message, line_number, stderr, timed_out)
 * @returns {Promise<{
 *   has_diagnostic: boolean,
 *   error_type: string|null,
 *   title: string,
 *   friendly_explanation: string,
 *   hint: string|null,
 *   line_number: number|null,
 *   code_snippet: string|null,
 *   category: string,
 *   confidence: string
 * }>}
 */
export async function diagnoseCode(code, errorDetails = {}) {
  return apiPost('/api/diagnose', { code, ...errorDetails });
}
