/**
 * EditorPage.jsx — Professional Coding Workspace
 *
 * 3-Zone Modern IDE Architecture:
 * - Zone 1: Monaco Code Editor with syntax highlighting and keyboard shortcuts
 * - Zone 2: Interactive Terminal & Diagnostic Console (stdout/stderr, exit codes, compiler diagnostics)
 * - Zone 3: Contextual Learning Pane:
 *     - Course Track: 32-Session Curriculum, 3-Tier Hints, Socratic Tutor, and Test Suite Evaluation
 *     - Custom Practice: Student-authored questions, custom test cases, and automated grading
 */

import { useState, useCallback, useEffect } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import DiagnosticCard from '../components/DiagnosticCard';
import CustomQuestionPanel from '../components/CustomQuestionPanel';
import CourseChallengePanel from '../components/curriculum/CourseChallengePanel';
import HelpUsageWidget from '../components/HelpUsageWidget';
import { findChallengeById, getModule } from '../services/curriculumService';
import { runCode } from '../services/api';
import './EditorPage.css';

export default function EditorPage() {
  const getInitialMode = () => {
    try {
      const urlMode = new URLSearchParams(window.location.search).get('mode');
      if (urlMode === 'custom') {
        return 'custom';
      }
    } catch (e) {}
    return 'course';
  };

  const [mode, setMode] = useState(getInitialMode); // 'course' | 'custom'
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);

  // Terminal active tab: 'output' | 'diagnostics'
  const [terminalTab, setTerminalTab] = useState('output');

  // Runner & Diagnostics state
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(true);

  // Course & Curriculum Mode state
  const [activeCourseChallenge, setActiveCourseChallenge] = useState(null);
  const [courseChallengeMeta, setCourseChallengeMeta] = useState({});
  const [examQuestionsList, setExamQuestionsList] = useState([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);

  // Load course challenge or transferred walkthrough code on mount
  useEffect(() => {
    // 1. Transferred snippet from walkthrough
    const transferred = sessionStorage.getItem('codementor_transfer_code');
    if (transferred) {
      sessionStorage.removeItem('codementor_transfer_code');
      setCode(transferred);
      return;
    }

    // 2. Query param based challenge loading
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challengeId');
    const examId = params.get('examId');

    if (challengeId) {
      const found = findChallengeById(challengeId);
      if (found) {
        setActiveCourseChallenge(found.challenge);
        setCourseChallengeMeta(found);
        if (found.challenge.starter_code) {
          setCode(found.challenge.starter_code);
        }
        return;
      }
    }

    if (examId) {
      const mod = getModule('module_1');
      if (mod && mod.chapter_exam && mod.chapter_exam.questions?.length > 0) {
        const questions = mod.chapter_exam.questions;
        setExamQuestionsList(questions);
        setCurrentExamIndex(0);
        setActiveCourseChallenge(questions[0]);
        setCourseChallengeMeta({
          type: 'chapter_exam',
          moduleId: 'module_1',
          examId: mod.chapter_exam.exam_id,
          examTitle: mod.chapter_exam.title,
          examQuestionIndex: 0,
          totalExamQuestions: questions.length,
        });
        if (questions[0].starter_code) {
          setCode(questions[0].starter_code);
        }
        return;
      }
    }

    // Fallback: Default to first challenge in Module 1
    const mod = getModule('module_1');
    const firstChal = mod?.sessions?.[0]?.lessons?.[0]?.practice_challenges?.[0];
    if (firstChal) {
      setActiveCourseChallenge(firstChal);
      setCourseChallengeMeta({
        type: 'lesson_practice',
        moduleId: 'module_1',
        sessionId: 'session_01',
        lessonId: 'lesson_01_01',
        sessionTitle: 'Session 1 - Python Fundamentals',
        lessonTitle: 'Python Output & Print Formatting',
      });
      if (getInitialMode() === 'course' && firstChal.starter_code) {
        setCode(firstChal.starter_code);
      }
    }
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    try {
      const url = new URL(window.location);
      url.searchParams.set('mode', newMode);
      window.history.replaceState({}, '', url);
    } catch (e) {}

    if (newMode === 'course' && activeCourseChallenge?.starter_code) {
      setCode(activeCourseChallenge.starter_code);
    }
  };

  const handleNextCourseQuestion = useCallback(() => {
    if (examQuestionsList.length > 0 && currentExamIndex < examQuestionsList.length - 1) {
      const nextIdx = currentExamIndex + 1;
      setCurrentExamIndex(nextIdx);
      const q = examQuestionsList[nextIdx];
      setActiveCourseChallenge(q);
      setCourseChallengeMeta((prev) => ({
        ...prev,
        examQuestionIndex: nextIdx,
      }));
      if (q.starter_code) setCode(q.starter_code);
    }
  }, [examQuestionsList, currentExamIndex]);

  const handlePrevCourseQuestion = useCallback(() => {
    if (examQuestionsList.length > 0 && currentExamIndex > 0) {
      const prevIdx = currentExamIndex - 1;
      setCurrentExamIndex(prevIdx);
      const q = examQuestionsList[prevIdx];
      setActiveCourseChallenge(q);
      setCourseChallengeMeta((prev) => ({
        ...prev,
        examQuestionIndex: prevIdx,
      }));
      if (q.starter_code) setCode(q.starter_code);
    }
  }, [examQuestionsList, currentExamIndex]);

  const handleResetCode = useCallback(() => {
    if (mode === 'course' && activeCourseChallenge?.starter_code) {
      setCode(activeCourseChallenge.starter_code);
    } else {
      setCode(DEFAULT_PYTHON_CODE);
    }
    setResult(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, [mode, activeCourseChallenge]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, []);

  /**
   * Execute code via backend Code Runner API.
   */
  const handleRun = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setApiError(null);
    setShowDiagnostic(true);
    setTerminalTab('output');

    try {
      const executionResult = await runCode(code);
      setResult(executionResult);
      if (executionResult?.diagnostic?.has_diagnostic) {
        setTerminalTab('diagnostics');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to connect to backend code runner');
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning]);

  // Keyboard shortcut: Ctrl+Enter executes script
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

  const getModeBadgeInfo = () => {
    if (mode === 'custom') {
      return {
        tag: 'Custom Practice Track',
        accentClass: 'mode-accent--blue',
        title: 'Custom Question Playground',
        desc: 'Design bespoke Python coding questions with custom input/output test specifications and automated grading.',
      };
    }
    return {
      tag: 'CampusX Course Track',
      accentClass: 'mode-accent--cyan',
      title: 'Interactive Python Curriculum',
      desc: 'Solve real-world CampusX Python challenges, read 3-tier hints, consult the AI tutor, and verify test cases.',
    };
  };

  const modeInfo = getModeBadgeInfo();

  return (
    <main className="editor-page" id="main-content" data-mode={mode}>
      {/* Sleek Workspace Top Bar */}
      <div className="workspace-header-bar container">
        <div className="workspace-header-bar__left">
          <div className="workspace-header-bar__title-wrap">
            <h1 className="workspace-header-bar__title">{modeInfo.title}</h1>
            <span className={`workspace-header-bar__tag ${modeInfo.accentClass}`}>
              {modeInfo.tag}
            </span>
          </div>
          <p className="workspace-header-bar__subtitle">{modeInfo.desc}</p>
        </div>

        <div className="workspace-header-bar__right">
          {/* Mode Switcher Tabs */}
          <div className="mode-switcher" role="tablist" aria-label="Editor Modes">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'course'}
              className={`mode-tab mode-tab--course ${mode === 'course' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('course')}
              id="tab-course-mode"
            >
              <span className="mode-tab__dot" />
              <span>Course Track</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'custom'}
              className={`mode-tab mode-tab--custom ${mode === 'custom' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('custom')}
              id="tab-custom-mode"
            >
              <span className="mode-tab__dot" />
              <span>Custom Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main IDE 3-Zone Workspace Grid */}
      <div className="workspace-layout container">
        {/* Left Column: Monaco Code Editor + Integrated Execution Terminal */}
        <div className="workspace-left-column">
          {/* Section 1: Code Editor & Action Toolbar */}
          <section className="editor-panel" aria-label="Code editor">
            {/* Primary Action Toolbar */}
            <div className="editor-panel__toolbar">
              <div className="editor-panel__toolbar-left">
                <button
                  id="btn-run-code"
                  className="btn btn--primary btn--accent-mint"
                  onClick={handleRun}
                  disabled={isRunning}
                  aria-label={isRunning ? 'Executing code…' : 'Run code (Ctrl+Enter)'}
                  title="Execute Python code in terminal (Ctrl+Enter)"
                >
                  <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                  {isRunning ? 'Running…' : 'Run Code'}
                </button>

                <button
                  id="btn-clear-code"
                  className="btn btn--ghost"
                  onClick={handleResetCode}
                  disabled={isRunning}
                  aria-label="Reset editor code"
                  title="Reset code to initial template"
                >
                  <span aria-hidden="true">↺</span>
                  Reset
                </button>
              </div>

              <div className="editor-panel__toolbar-right">
                <HelpUsageWidget />

                <span className="editor-panel__shortcut-hint">
                  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run
                </span>

                <span className="editor-panel__char-count" aria-live="polite">
                  {code.length} chars
                </span>
              </div>
            </div>

            {/* Monaco editor */}
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              height="460px"
            />
          </section>

          {/* Section 2: Integrated Execution Terminal & Diagnostic Console */}
          <section className="output-panel" aria-label="Terminal output and diagnostics">
            <div className="output-panel__header">
              <div className="output-panel__header-left">
                <div className="output-panel__tabs" role="tablist">
                  <button
                    type="button"
                    className={`output-panel__tab ${terminalTab === 'output' ? 'output-panel__tab--active' : ''}`}
                    onClick={() => setTerminalTab('output')}
                  >
                    Terminal Output
                  </button>
                  {result?.diagnostic?.has_diagnostic && (
                    <button
                      type="button"
                      className={`output-panel__tab output-panel__tab--has-diag ${terminalTab === 'diagnostics' ? 'output-panel__tab--active' : ''}`}
                      onClick={() => setTerminalTab('diagnostics')}
                    >
                      <span className="output-panel__diag-dot" />
                      Compiler Diagnostic
                    </button>
                  )}
                </div>
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
                  <p className="output-state__text">Executing script in isolated Python sandbox…</p>
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
                  <div className="output-state__icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                  <p className="output-state__text">
                    Press <strong>Run Code</strong> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to execute.
                  </p>
                  <p className="output-state__subtext">
                    Standard output (<code>stdout</code>), raw tracebacks, and plain-English diagnostics render here.
                  </p>
                </div>
              )}

              {/* 4. Execution Result & Diagnostics */}
              {!isRunning && !apiError && result && (
                <div className="output-content">
                  {/* Diagnostics Tab View */}
                  {terminalTab === 'diagnostics' && showDiagnostic && result.diagnostic && result.diagnostic.has_diagnostic && (
                    <DiagnosticCard
                      diagnostic={result.diagnostic}
                      code={code}
                      executionResult={result}
                      onClose={() => setShowDiagnostic(false)}
                    />
                  )}

                  {/* Standard Output Stream */}
                  {terminalTab === 'output' && (
                    <>
                      {/* Diagnostic Banner if there is an error but user is in output tab */}
                      {showDiagnostic && result.diagnostic && result.diagnostic.has_diagnostic && (
                        <div className="terminal-diag-quick-notice">
                          <div className="terminal-diag-quick-notice__left">
                            <span className="terminal-diag-quick-notice__tag">Diagnostic Detected</span>
                            <span className="terminal-diag-quick-notice__type">{result.diagnostic.error_type}</span>
                          </div>
                          <button
                            type="button"
                            className="terminal-diag-quick-notice__btn"
                            onClick={() => setTerminalTab('diagnostics')}
                          >
                            View Diagnostic Analysis →
                          </button>
                        </div>
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
                          [Process completed with exit code 0 — no standard output printed]
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Contextual Learning & Mode Experience */}
        <div className="workspace-right-column">
          {mode === 'custom' ? (
            <section className="task-panel" aria-label="Custom Question Panel">
              <CustomQuestionPanel
                code={code}
                onApplyStarterCode={(starter) => setCode(starter)}
              />
            </section>
          ) : (
            <section className="task-panel" aria-label="Course Challenge Panel">
              <CourseChallengePanel
                challenge={activeCourseChallenge}
                challengeMeta={courseChallengeMeta}
                code={code}
                onSetCode={setCode}
                onNextQuestion={handleNextCourseQuestion}
                onPrevQuestion={handlePrevCourseQuestion}
                hasNext={examQuestionsList.length > 0 ? currentExamIndex < examQuestionsList.length - 1 : false}
                hasPrev={examQuestionsList.length > 0 ? currentExamIndex > 0 : false}
                onBackToCourse={() => (window.location.href = '/courses')}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
