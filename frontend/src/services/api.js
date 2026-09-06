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

/**
 * Fetch available starter practice tasks (Phase A5).
 *
 * @returns {Promise<{ tasks: Array<object> }>}
 */
export async function getSampleTasks() {
  return apiGet('/api/tasks');
}

/**
 * Evaluate Python code against a task or test case suite (Phase A5).
 *
 * @param {string} code - Python source code submitted by user
 * @param {object|string} taskOrId - TaskDefinition object or task_id string
 * @returns {Promise<{
 *   passed_all: boolean,
 *   status: string,
 *   total_tests: number,
 *   passed_tests: number,
 *   score_percentage: number,
 *   total_execution_time_ms: number,
 *   summary_message: string,
 *   test_results: Array<{
 *     test_case_id: string,
 *     description: string,
 *     passed: boolean,
 *     status: string,
 *     actual_output: string,
 *     expected_output: string,
 *     stdin: string,
 *     is_hidden: boolean,
 *     execution_time_ms: number,
 *     error_message: string|null,
 *     diagnostic: object|null
 *   }>
 * }>}
 */
export async function evaluateTask(code, taskOrId) {
  const payload = typeof taskOrId === 'string'
    ? { code, task_id: taskOrId }
    : { code, task: taskOrId };

  return apiPost('/api/evaluate', payload);
}

/**
 * Fetch 3-tier progressive hints for student code and task context (Phase A6).
 *
 * @param {string} code - Python source code submitted by user
 * @param {object|string|null} [taskOrId=null] - TaskDefinition object or task_id string
 * @param {object|null} [evaluationResult=null] - Optional EvaluationResult object
 * @returns {Promise<{
 *   has_hints: boolean,
 *   rule_id: string|null,
 *   rule_name: string|null,
 *   matched_mistake: string|null,
 *   hints: {
 *     level_1_nudge: string,
 *     level_2_strategy: string,
 *     level_3_clue: string
 *   }|null,
 *   source: string,
 *   total_levels: number
 * }>}
 */
export async function fetchHints(code, taskOrId = null, evaluationResult = null) {
  const payload = { code };
  if (typeof taskOrId === 'string') {
    payload.task_id = taskOrId;
  } else if (taskOrId && typeof taskOrId === 'object') {
    payload.task = taskOrId;
  }
  if (evaluationResult) {
    payload.evaluation_result = evaluationResult;
  }
  return apiPost('/api/hints', payload);
}

/**
 * Ask the AI Tutor for Socratic, contextual guidance (Phase A7).
 *
 * @param {object} params
 * @param {string} params.code - Python source code
 * @param {string} [params.taskId] - Optional task identifier
 * @param {object} [params.task] - Optional TaskDefinition object
 * @param {string} [params.question] - Optional student inquiry
 * @param {object} [params.diagnostic] - Optional A4 diagnostic details
 * @param {object} [params.evaluationResult] - Optional A5 evaluation results
 * @param {object} [params.executionDetails] - Optional A3 execution metrics
 * @returns {Promise<{
 *   success: boolean,
 *   status: string,
 *   socratic_guidance: string,
 *   conceptual_nudge: string,
 *   strategy: string,
 *   structural_clue: string,
 *   source: string,
 *   provider: string,
 *   model: string,
 *   error_message: string|null,
 *   suggested_actions: Array<string>
 * }>}
 */
export async function askAITutor({
  code,
  taskId = null,
  task = null,
  question = '',
  diagnostic = null,
  evaluationResult = null,
  executionDetails = null,
}) {
  const payload = { code };
  if (taskId) payload.task_id = taskId;
  if (task) payload.task = task;
  if (question && question.trim()) payload.question = question.trim();
  if (diagnostic) payload.diagnostic = diagnostic;
  if (evaluationResult) payload.evaluation_result = evaluationResult;
  if (executionDetails) payload.execution_details = executionDetails;

  return apiPost('/api/tutor/ask', payload);
}

/**
 * Retrieve active AI settings with masked API keys (Phase A8).
 *
 * @returns {Promise<{ config: object }>}
 */
export async function getAIConfig() {
  return apiGet('/api/ai/config');
}

/**
 * Update active AI provider and connection settings (Phase A8).
 *
 * @param {object} config - Configuration update payload
 * @returns {Promise<{ success: boolean, message: string, config: object }>}
 */
export async function saveAIConfig(config) {
  return apiPost('/api/ai/config', config);
}

/**
 * Test connectivity, responsiveness, and latency for an AI provider (Phase A8).
 *
 * @param {object} [testParams={}] - Optional parameters to probe before saving
 * @returns {Promise<{
 *   success: boolean,
 *   status: string,
 *   provider: string,
 *   latency_ms: number,
 *   message: string,
 *   details?: object
 * }>}
 */
export async function testAIConnection(testParams = {}) {
  return apiPost('/api/ai/test', testParams);
}

/**
 * Request an on-demand, beginner-friendly AI error explanation (Phase A9).
 *
 * @param {object} payload
 * @param {string} payload.code - Student's Python source code
 * @param {string} payload.error_type - Exception class (e.g. 'SyntaxError', 'NameError')
 * @param {string} [payload.error_message] - Error message or traceback summary
 * @param {number|null} [payload.line_number] - Line number where error occurred
 * @param {string} [payload.traceback] - Raw Python traceback / stderr
 * @param {object} [payload.diagnostic] - Phase A4 deterministic diagnostic object
 * @returns {Promise<{
 *   success: boolean,
 *   status: string,
 *   error_type: string,
 *   headline: string,
 *   what_it_means: string,
 *   why_it_happened: string,
 *   how_to_think_about_it: string,
 *   concepts_to_review: Array<string>,
 *   line_number: number|null,
 *   source: string,
 *   provider: string,
 *   model: string,
 *   error_message?: string
 * }>}
 */
export async function explainErrorWithAI(payload) {
  return apiPost('/api/ai/explain-error', payload);
}

/**
 * Fetch starter challenge templates for Custom Question Mode (Phase A10).
 *
 * @returns {Promise<{ templates: Array<object> }>}
 */
export async function getCustomQuestionTemplates() {
  return apiGet('/api/custom-questions/templates');
}

/**
 * Validate a student-defined custom question object (Phase A10).
 *
 * @param {object} question - Custom question definition
 * @returns {Promise<{ valid: boolean, error?: string, message?: string }>}
 */
export async function validateCustomQuestion(question) {
  return apiPost('/api/custom-questions/validate', { question });
}

/**
 * Evaluate Python code against student-defined custom criteria (Phase A10).
 *
 * @param {string} code - Student's Python source code
 * @param {object} question - Custom question definition with test cases
 * @returns {Promise<object>} EvaluationResult
 */
export async function evaluateCustomQuestion(code, question) {
  return apiPost('/api/custom-questions/evaluate', { code, question });
}

/**
 * Retrieve session assistance metrics summary (Phase A11).
 *
 * @returns {Promise<{
 *   success: boolean,
 *   summary: {
 *     total_assists: number,
 *     hints: {
 *       total: number,
 *       level_1_nudge: number,
 *       level_2_strategy: number,
 *       level_3_structure: number
 *     },
 *     ai_tutor_queries: number,
 *     ai_error_explanations: number,
 *     total_events_logged: number
 *   }
 * }>}
 */
export async function getHelpSummary() {
  return apiGet('/api/help-counter/summary');
}

/**
 * Record a student assistance event (Phase A11).
 *
 * @param {'hint_reveal'|'ai_tutor_ask'|'ai_error_explain'} eventType
 * @param {object} [details={}]
 * @returns {Promise<{ success: boolean, event_type: string, summary: object }>}
 */
export async function recordHelpEvent(eventType, details = {}) {
  return apiPost('/api/help-counter/record', {
    event_type: eventType,
    details
  });
}

/**
 * Reset session assistance counters (Phase A11).
 *
 * @returns {Promise<{ success: boolean, message: string, summary: object }>}
 */
export async function resetHelpCounter() {
  return apiPost('/api/help-counter/reset', {});
}

/**
 * Retrieve recent assistance events for active session (Phase A11).
 *
 * @param {number} [limit=50]
 * @returns {Promise<{ success: boolean, events: Array<object> }>}
 */
export async function getHelpEvents(limit = 50) {
  return apiGet(`/api/help-counter/events?limit=${limit}`);
}

/**
 * Retrieve global student progress and score summary (Phase A12).
 *
 * @returns {Promise<{
 *   success: boolean,
 *   summary: {
 *     total_tasks_available: number,
 *     tasks_attempted: number,
 *     tasks_completed: number,
 *     completion_percentage: number,
 *     total_attempts: number,
 *     average_best_score: number,
 *     total_assists_linked: number,
 *     tasks: object
 *   }
 * }>}
 */
export async function getProgressSummary() {
  return apiGet('/api/progress/summary');
}

/**
 * Record a task evaluation attempt and update cumulative progress (Phase A12).
 *
 * @param {object} params
 * @param {string} params.taskId
 * @param {string} [params.taskTitle]
 * @param {'starter'|'custom'} [params.category='starter']
 * @param {number} params.scorePercentage
 * @param {boolean} params.passedAll
 * @param {number} [params.passedTests=0]
 * @param {number} [params.totalTests=0]
 * @param {object} [params.assistanceSnapshot=null]
 * @returns {Promise<{ success: boolean, task: object, summary: object }>}
 */
export async function recordProgressAttempt({
  taskId,
  taskTitle = null,
  category = 'starter',
  scorePercentage,
  passedAll,
  passedTests = 0,
  totalTests = 0,
  assistanceSnapshot = null,
}) {
  return apiPost('/api/progress/record-attempt', {
    task_id: taskId,
    task_title: taskTitle,
    category,
    score_percentage: scorePercentage,
    passed_all: passedAll,
    passed_tests: passedTests,
    total_tests: totalTests,
    assistance_snapshot: assistanceSnapshot,
  });
}

/**
 * Retrieve progress record and attempt history for a specific task (Phase A12).
 *
 * @param {string} taskId
 * @returns {Promise<{ success: boolean, task: object }>}
 */
export async function getTaskProgress(taskId) {
  return apiGet(`/api/progress/task/${encodeURIComponent(taskId)}`);
}

/**
 * Reset all student progress and score records back to initial state (Phase A12).
 *
 * @returns {Promise<{ success: boolean, message: string, summary: object }>}
 */
export async function resetProgress() {
  return apiPost('/api/progress/reset', {});
}

/**
 * Retrieve all curated Debug Mode challenges (Phase A13).
 *
 * @returns {Promise<{ success: boolean, challenges: Array<object> }>}
 */
export async function getDebugChallenges() {
  return apiGet('/api/debug/challenges');
}

/**
 * Retrieve a single Debug Mode challenge by ID with test cases (Phase A13).
 *
 * @param {string} challengeId
 * @returns {Promise<{ success: boolean, challenge: object }>}
 */
export async function getDebugChallenge(challengeId) {
  return apiGet(`/api/debug/challenges/${encodeURIComponent(challengeId)}`);
}

/**
 * Evaluate student's repaired code against a debug challenge's test cases (Phase A13).
 *
 * @param {string} challengeId
 * @param {string} code
 * @returns {Promise<{
 *   success: boolean,
 *   challenge_id: string,
 *   challenge_title: string,
 *   evaluation: object,
 *   hints: object
 * }>}
 */
export async function evaluateDebugChallenge(challengeId, code) {
  return apiPost('/api/debug/evaluate', {
    challenge_id: challengeId,
    code,
  });
}


