/**
 * EditorPage.jsx — Coding workspace page (Phase A5)
 *
 * What this page does:
 *   - Renders the Monaco-based Python code editor.
 *   - Manages the code state (controlled).
 *   - Supports Free Play Mode (isolated execution via POST /api/run).
 *   - Supports Task Evaluation Mode (multi-test case grading via POST /api/evaluate).
 *   - Renders educational Code Diagnostic cards (Phase A4).
 *   - Renders Task Evaluation breakdown and diffs (Phase A5).
 *   - Supports Ctrl+Enter shortcut to run/evaluate code.
 *
 * What this page deliberately does NOT do:
 *   - Call any AI / LLM APIs (Phase A7+).
 *   - Store progress to persistent database (Phase A12).
 */

import { useState, useCallback, useEffect } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import DiagnosticCard from '../components/DiagnosticCard';
import TaskEvaluationPanel from '../components/TaskEvaluationPanel';
import AITutorPanel from '../components/AITutorPanel';
import { runCode, evaluateTask, getSampleTasks, fetchHints } from '../services/api';
import './EditorPage.css';

export default function EditorPage() {
  const [mode, setMode] = useState('editor'); // 'editor' (Free Play) | 'task' (Evaluation)
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);

  // Runner & Diagnostics state (Free Play Mode)
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(true);

  // Tasks & Evaluator state (Task Evaluation Mode)
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [hintsData, setHintsData] = useState(null);

  // Load sample practice tasks on mount
  useEffect(() => {
    getSampleTasks()
      .then((data) => {
        if (data?.tasks?.length > 0) {
          setTasks(data.tasks);
          setActiveTask(data.tasks[0]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load sample tasks:', err);
      });
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleSelectTask = useCallback((taskId) => {
    const selected = tasks.find((t) => t.id === taskId);
    if (selected) {
      setActiveTask(selected);
      setEvaluationResult(null);
      setHintsData(null);
      if (selected.starter_code) {
        setCode(selected.starter_code);
      }
    }
  }, [tasks]);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'task' && activeTask && activeTask.starter_code && code === DEFAULT_PYTHON_CODE) {
      setCode(activeTask.starter_code);
    }
  };

  const handleResetCode = useCallback(() => {
    if (mode === 'task' && activeTask?.starter_code) {
      setCode(activeTask.starter_code);
    } else {
      setCode(DEFAULT_PYTHON_CODE);
    }
    setResult(null);
    setEvaluationResult(null);
    setHintsData(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, [mode, activeTask]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, []);

  /**
   * Execute code via the backend Code Runner API (Free Play).
   */
  const handleRun = useCallback(async () => {
    if (isRunning || isEvaluating) return;

    setIsRunning(true);
    setApiError(null);
    setShowDiagnostic(true);

    try {
      const executionResult = await runCode(code);
      setResult(executionResult);
    } catch (err) {
      setApiError(err.message || 'Failed to connect to backend code runner');
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning, isEvaluating]);

  /**
   * Evaluate code against all test cases for the active task (Phase A5/A6).
   */
  const handleEvaluate = useCallback(async () => {
    if (!activeTask || isEvaluating || isRunning) return;

    setIsEvaluating(true);
    setApiError(null);

    try {
      const evalRes = await evaluateTask(code, activeTask);
      setEvaluationResult(evalRes);

      // Phase A6: If solution did not pass all tests, fetch progressive hints
      if (!evalRes.passed_all) {
        try {
          const hintRes = await fetchHints(code, activeTask.id, evalRes);
          setHintsData(hintRes);
        } catch (hintErr) {
          console.warn('Hints service unavailable:', hintErr);
        }
      } else {
        // Solution passed 100% — clear hints
        setHintsData(null);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to evaluate task on backend');
    } finally {
      setIsEvaluating(false);
    }
  }, [code, activeTask, isEvaluating, isRunning]);

  // Keyboard shortcut: Ctrl+Enter executes or evaluates depending on mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (mode === 'task') {
          handleEvaluate();
        } else {
          handleRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleRun, handleEvaluate]);

  // Helper to render status badge in terminal header
  const renderStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="output-badge output-badge--running" aria-live="polite">
          <span className="output-spinner" aria-hidden="true" />
          Running…
        </span>
      );
    }

    if (apiError) {
      return (
        <span className="output-badge output-badge--error">
          Connection Error
        </span>
      );
    }

    if (!result) {
      return <span className="output-badge output-badge--idle">Ready</span>;
    }

    switch (result.status) {
      case 'success':
        return <span className="output-badge output-badge--success">● Success (Exit 0)</span>;
      case 'runtime_error':
        return <span className="output-badge output-badge--error">● Runtime Error</span>;
      case 'syntax_error':
        return <span className="output-badge output-badge--error">● Syntax Error</span>;
      case 'timeout':
        return <span className="output-badge output-badge--warning">⏱ Timed Out</span>;
      default:
        return <span className="output-badge output-badge--error">● {result.status}</span>;
    }
  };

  return (
    <main className="editor-page" id="main-content">
      {/* Page header */}
      <div className="editor-page__header container">
        <div className="editor-page__title-group">
          <h1 className="editor-page__title">
            {mode === 'task' ? 'Task Evaluation & Practice' : 'Python Editor & Diagnostics'}
          </h1>
          <span className="editor-page__phase-tag">Phase A7 Live</span>
        </div>
        <p className="editor-page__subtitle">
          {mode === 'task'
            ? 'Solve structured programming tasks and evaluate your solution against test cases in real-time.'
            : 'Write Python code, execute in an isolated sandbox, and receive instant beginner-friendly error diagnostics.'}
        </p>

        {/* Mode Switcher Tabs */}
        <div className="mode-switcher" role="tablist" aria-label="Editor Modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'editor'}
            className={`mode-tab ${mode === 'editor' ? 'mode-tab--active' : ''}`}
            onClick={() => handleSwitchMode('editor')}
          >
            <span aria-hidden="true">⚡</span> Free Play Mode
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'task'}
            className={`mode-tab ${mode === 'task' ? 'mode-tab--active' : ''}`}
            onClick={() => handleSwitchMode('task')}
          >
            <span aria-hidden="true">🎯</span> Task Evaluation Mode
          </button>
        </div>
      </div>

      {/* Main workspace: editor + (output OR task panel) side-by-side */}
      <div className="editor-page__workspace container">

        {/* Left — Editor panel */}
        <section className="editor-panel" aria-label="Code editor">
          {/* Toolbar */}
          <div className="editor-panel__toolbar">
            {mode === 'task' ? (
              <>
                <button
                  id="btn-evaluate-task"
                  className="btn btn--primary"
                  onClick={handleEvaluate}
                  disabled={isEvaluating || isRunning}
                  aria-label="Evaluate task against all test cases"
                  title="Run test suite against solution (Ctrl+Enter)"
                >
                  <span aria-hidden="true">{isEvaluating ? '⏳' : '⚡'}</span>
                  {isEvaluating ? 'Evaluating…' : 'Evaluate Task'}
                </button>

                <button
                  id="btn-run-code"
                  className="btn btn--secondary"
                  onClick={handleRun}
                  disabled={isRunning || isEvaluating}
                  aria-label="Run code in terminal"
                  title="Run in terminal without grading"
                >
                  <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                  {isRunning ? 'Running…' : 'Run Script'}
                </button>
              </>
            ) : (
              <button
                id="btn-run-code"
                className="btn btn--primary"
                onClick={handleRun}
                disabled={isRunning}
                aria-label={isRunning ? 'Executing code…' : 'Run code (Ctrl+Enter)'}
                title="Execute Python code (Shortcut: Ctrl+Enter)"
              >
                <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                {isRunning ? 'Running…' : 'Run Code'}
              </button>
            )}

            <button
              id="btn-clear-code"
              className="btn btn--ghost"
              onClick={handleResetCode}
              disabled={isRunning || isEvaluating}
              aria-label="Reset editor code"
              title="Reset code"
            >
              <span aria-hidden="true">↺</span>
              Reset
            </button>

            <span className="editor-panel__shortcut-hint">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to {mode === 'task' ? 'evaluate' : 'run'}
            </span>

            {/* Character count */}
            <span className="editor-panel__char-count" aria-live="polite">
              {code.length} chars
            </span>
          </div>

          {/* Monaco editor */}
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            height="500px"
          />
        </section>

        {/* Right — Panel changes based on Mode */}
        {mode === 'task' ? (
          /* Task Evaluation Mode Panel */
          <section className="task-panel" aria-label="Task Evaluation Results">
            <TaskEvaluationPanel
              code={code}
              tasks={tasks}
              activeTask={activeTask}
              onSelectTask={handleSelectTask}
              evaluationResult={evaluationResult}
              isEvaluating={isEvaluating}
              hintsData={hintsData}
            />
          </section>
        ) : (
          /* Free Play Mode Terminal Panel */
          <section className="output-panel" aria-label="Terminal output and diagnostics">
            <div className="output-panel__header">
              <div className="output-panel__header-left">
                <span className="output-panel__title">Terminal & Diagnostics</span>
                {renderStatusBadge()}
              </div>

              <div className="output-panel__header-right">
                {result && result.execution_time_ms !== undefined && (
                  <span className="output-panel__timing" title="Execution duration">
                    {result.execution_time_ms} ms
                  </span>
                )}
                {(result || apiError) && (
                  <button
                    className="output-panel__btn-clear"
                    onClick={handleClearOutput}
                    title="Clear output terminal"
                    aria-label="Clear output"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="output-panel__body">
              {/* 1. Loading state */}
              {isRunning && (
                <div className="output-state output-state--running">
                  <div className="output-pulse-loader" aria-hidden="true" />
                  <p className="output-state__text">Executing code and analyzing diagnostics…</p>
                </div>
              )}

              {/* 2. API / Connection error */}
              {!isRunning && apiError && (
                <div className="output-state output-state--api-error">
                  <span className="output-state__icon" aria-hidden="true">⚠️</span>
                  <p className="output-state__error-title">Backend Connection Failed</p>
                  <p className="output-state__error-msg">{apiError}</p>
                  <p className="output-state__error-hint">
                    Ensure the Flask backend is running on <code>http://localhost:5000</code>.
                  </p>
                </div>
              )}

              {/* 3. Idle state (no run yet) */}
              {!isRunning && !apiError && !result && (
                <div className="output-state output-state--idle">
                  <span className="output-state__icon" aria-hidden="true">💡</span>
                  <p className="output-state__text">
                    Press <strong>Run Code</strong> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to execute your code.
                  </p>
                  <p className="output-state__subtext">
                    Standard output (<code>stdout</code>), plain-English error diagnostics, and hints will appear here.
                  </p>
                </div>
              )}

              {/* 4. Execution Result & Diagnostic Card */}
              {!isRunning && !apiError && result && (
                <div className="output-content">
                  {showDiagnostic && result.diagnostic && result.diagnostic.has_diagnostic && (
                    <DiagnosticCard
                      diagnostic={result.diagnostic}
                      code={code}
                      executionResult={result}
                      onClose={() => setShowDiagnostic(false)}
                    />
                  )}


                  {result.stdout && (
                    <div className="output-stream-container">
                      <span className="output-stream-label">Standard Output</span>
                      <pre className="output-stream output-stream--stdout">
                        <code>{result.stdout}</code>
                      </pre>
                    </div>
                  )}

                  {result.stderr && (
                    <div className="output-stream-container">
                      <span className="output-stream-label output-stream-label--error">Raw Python Traceback</span>
                      <pre className="output-stream output-stream--stderr">
                        <code>{result.stderr}</code>
                      </pre>
                    </div>
                  )}

                  {!result.stdout && !result.stderr && (
                    <p className="output-empty-note">
                      [Process completed with exit code 0 — no output printed]
                    </p>
                  )}
                </div>
              )}

              {/* Phase A7: AI Tutor Panel in Free Play Mode */}
              {!isRunning && (
                <AITutorPanel
                  code={code}
                  diagnostic={result?.diagnostic}
                  executionDetails={result}
                />
              )}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
