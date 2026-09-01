/**
 * EditorPage.jsx — Coding workspace page (Phase A3)
 *
 * What this page does:
 *   - Renders the Monaco-based Python code editor.
 *   - Manages the code state (controlled).
 *   - Executes code via Code Runner Engine (POST /api/run).
 *   - Displays stdout, stderr, execution time, and process status.
 *   - Supports Ctrl+Enter / Cmd+Enter shortcut to run code.
 *   - Provides Reset Code and Clear Output capabilities.
 *
 * What this page deliberately does NOT do:
 *   - Diagnose errors into conversational guidance (Phase A4).
 *   - Evaluate task test cases / pass-fail scoring (Phase A5).
 *   - Call any AI (Phase A7+).
 */

import { useState, useCallback, useEffect } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import { runCode } from '../services/api';
import './EditorPage.css';

export default function EditorPage() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleClearCode = useCallback(() => {
    setCode(DEFAULT_PYTHON_CODE);
  }, []);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setApiError(null);
  }, []);

  /**
   * Execute code via the backend Code Runner API.
   */
  const handleRun = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setApiError(null);

    try {
      const executionResult = await runCode(code);
      setResult(executionResult);
    } catch (err) {
      setApiError(err.message || 'Failed to connect to backend code runner');
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to execute code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

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
        return (
          <span className="output-badge output-badge--success">
            ● Success (Exit 0)
          </span>
        );
      case 'runtime_error':
        return (
          <span className="output-badge output-badge--error">
            ● Runtime Error
          </span>
        );
      case 'syntax_error':
        return (
          <span className="output-badge output-badge--error">
            ● Syntax Error
          </span>
        );
      case 'timeout':
        return (
          <span className="output-badge output-badge--warning">
            ⏱ Timed Out
          </span>
        );
      default:
        return (
          <span className="output-badge output-badge--error">
            ● {result.status}
          </span>
        );
    }
  };

  return (
    <main className="editor-page" id="main-content">
      {/* Page header */}
      <div className="editor-page__header container">
        <div className="editor-page__title-group">
          <h1 className="editor-page__title">Python Editor & Runner</h1>
          <span className="editor-page__phase-tag">Phase A3 Live</span>
        </div>
        <p className="editor-page__subtitle">
          Write Python code, execute in an isolated process, and view real-time standard output and tracebacks.
        </p>
      </div>

      {/* Main workspace: editor + output side-by-side on wide screens */}
      <div className="editor-page__workspace container">

        {/* Left — Editor panel */}
        <section className="editor-panel" aria-label="Code editor">
          {/* Toolbar */}
          <div className="editor-panel__toolbar">
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

            <button
              id="btn-clear-code"
              className="btn btn--ghost"
              onClick={handleClearCode}
              disabled={isRunning}
              aria-label="Reset editor to default starter code"
              title="Reset code to default"
            >
              <span aria-hidden="true">↺</span>
              Reset
            </button>

            <span className="editor-panel__shortcut-hint">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run
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
            height="480px"
          />
        </section>

        {/* Right — Output Terminal panel (Phase A3 Live) */}
        <section className="output-panel" aria-label="Terminal output">
          <div className="output-panel__header">
            <div className="output-panel__header-left">
              <span className="output-panel__title">Terminal Output</span>
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
                <p className="output-state__text">Executing code in Python subprocess…</p>
              </div>
            )}

            {/* 2. API / Connection error */}
            {!isRunning && apiError && (
              <div className="output-state output-state--api-error">
                <span className="output-state__icon" aria-hidden="true">⚠️</span>
                <p className="output-state__error-title">Backend Execution Failed</p>
                <p className="output-state__error-msg">{apiError}</p>
                <p className="output-state__error-hint">
                  Ensure the Flask backend is running on <code>http://localhost:5000</code>.
                </p>
              </div>
            )}

            {/* 3. Idle state (no run yet) */}
            {!isRunning && !apiError && !result && (
              <div className="output-state output-state--idle">
                <span className="output-state__icon" aria-hidden="true">⚡</span>
                <p className="output-state__text">
                  Press <strong>Run Code</strong> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to execute your code.
                </p>
                <p className="output-state__subtext">
                  Standard output (<code>stdout</code>), runtime errors, and execution metrics will appear here.
                </p>
              </div>
            )}

            {/* 4. Execution Result */}
            {!isRunning && !apiError && result && (
              <div className="output-content">
                {/* Error Summary Banner (if error occurred) */}
                {result.details?.error_type && (
                  <div className="output-error-banner">
                    <span className="output-error-banner__tag">
                      {result.details.error_type}
                    </span>
                    {result.details.line_number && (
                      <span className="output-error-banner__line">
                        Line {result.details.line_number}
                      </span>
                    )}
                    {result.details.error_message && (
                      <span className="output-error-banner__msg">
                        {result.details.error_message}
                      </span>
                    )}
                  </div>
                )}

                {/* Standard Output stream */}
                {result.stdout && (
                  <pre className="output-stream output-stream--stdout">
                    <code>{result.stdout}</code>
                  </pre>
                )}

                {/* Standard Error / Traceback stream */}
                {result.stderr && (
                  <pre className="output-stream output-stream--stderr">
                    <code>{result.stderr}</code>
                  </pre>
                )}

                {/* Empty Output Note */}
                {!result.stdout && !result.stderr && (
                  <p className="output-empty-note">
                    [Process completed with exit code 0 — no output printed]
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
