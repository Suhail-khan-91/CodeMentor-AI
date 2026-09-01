/**
 * EditorPage.jsx — Coding workspace page (Phase A2)
 *
 * What this page does:
 *   - Renders the Monaco-based Python code editor.
 *   - Manages the code state (controlled).
 *   - Provides Clear/Reset and Run Code buttons.
 *
 * What this page deliberately does NOT do:
 *   - Execute Python code (Phase A3).
 *   - Display real output (Phase A3).
 *   - Diagnose errors (Phase A4).
 *   - Call any AI (Phase A7+).
 *
 * Architecture note:
 *   Code state lives here, NOT inside CodeEditor.
 *   When Phase A3 lands, only this file (or a dedicated hook) needs
 *   to call the run API — the CodeEditor component stays untouched.
 */

import { useState, useCallback } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import './EditorPage.css';

export default function EditorPage() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [isRunning, setIsRunning] = useState(false); // will be wired in A3

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleClear = useCallback(() => {
    setCode(DEFAULT_PYTHON_CODE);
  }, []);

  /**
   * handleRun — UI stub for Phase A2.
   * Phase A3 will replace this with a real API call to /api/run.
   * Do NOT add execution logic here yet.
   */
  const handleRun = useCallback(() => {
    // Intentionally a no-op in A2.
    // Phase A3 will: setIsRunning(true), call apiPost('/api/run', { code }), etc.
    console.log('[A2] Run button clicked — execution will be wired in Phase A3.');
  }, []);

  return (
    <main className="editor-page" id="main-content">
      {/* Page header */}
      <div className="editor-page__header container">
        <div className="editor-page__title-group">
          <h1 className="editor-page__title">Python Editor</h1>
          <span className="editor-page__phase-tag">Phase A2</span>
        </div>
        <p className="editor-page__subtitle">
          Write and edit Python code. Code execution arrives in Phase A3.
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
              aria-label="Run code (coming in Phase A3)"
              title="Execution will be enabled in Phase A3"
            >
              <span aria-hidden="true">▶</span>
              {isRunning ? 'Running…' : 'Run Code'}
            </button>

            <button
              id="btn-clear-code"
              className="btn btn--ghost"
              onClick={handleClear}
              aria-label="Reset editor to default code"
            >
              <span aria-hidden="true">↺</span>
              Reset
            </button>

            {/* Character count — small quality-of-life info */}
            <span className="editor-panel__char-count" aria-live="polite">
              {code.length} chars
            </span>
          </div>

          {/* Monaco editor */}
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            height="460px"
          />
        </section>

        {/* Right — Output panel (placeholder until A3) */}
        <section className="output-panel" aria-label="Code output">
          <div className="output-panel__header">
            <span className="output-panel__title">Output</span>
            <span className="output-panel__badge">Coming in Phase A3</span>
          </div>

          <div className="output-panel__body output-panel__body--empty">
            <div className="output-panel__placeholder">
              <span className="output-panel__placeholder-icon" aria-hidden="true">⚙️</span>
              <p className="output-panel__placeholder-text">
                Code execution will be implemented in <strong>Phase A3 — Code Runner</strong>.
              </p>
              <p className="output-panel__placeholder-subtext">
                Press <strong>Run Code</strong> above and output will appear here once the
                backend runner is connected.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
