/**
 * EditorPage.jsx — Professional Coding Workspace (Phase A14 Live Integration).
 *
 * 3-Zone Modern IDE Architecture:
 * - Zone 1: Monaco Code Editor with filename tabs, language tag, keyboard shortcuts
 * - Zone 2: Interactive Terminal & Diagnostic Console (stdout/stderr streams, exit codes, execution telemetry)
 * - Zone 3: Contextual Learning Pane (AI Socratic Tutor in Free Play, Task Evaluation in Practice, Custom Question Engine, Debug Challenge Console)
 *
 * Full compliance with Part A requirements:
 * - Free Play execution (POST /api/run)
 * - Task grading (POST /api/evaluate)
 * - Educational diagnostic cards (Phase A4)
 * - Progressive hints (Phase A6)
 * - AI Tutor Socratic chat (Phase A7)
 * - Custom questions (Phase A10)
 * - Assistance tracking (Phase A11)
 * - Progress & score synchronization (Phase A12)
 * - Debug mode challenges (Phase A13)
 * - Ctrl+Enter execution shortcut
 */

import { useState, useCallback, useEffect } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import DiagnosticCard from '../components/DiagnosticCard';
import TaskEvaluationPanel from '../components/TaskEvaluationPanel';
import CustomQuestionPanel from '../components/CustomQuestionPanel';
import DebugChallengePanel from '../components/DebugChallengePanel';
import AITutorPanel from '../components/AITutorPanel';
import HelpUsageWidget from '../components/HelpUsageWidget';
import {
  runCode,
  evaluateTask,
  getSampleTasks,
  fetchHints,
  recordProgressAttempt,
  getDebugChallenges,
  evaluateDebugChallenge,
} from '../services/api';
import './EditorPage.css';

export default function EditorPage() {
  const getInitialMode = () => {
    try {
      const urlMode = new URLSearchParams(window.location.search).get('mode');
      if (urlMode === 'custom' || urlMode === 'task' || urlMode === 'editor' || urlMode === 'debug') {
        return urlMode;
      }
    } catch (e) {}
    return 'editor';
  };

  const [mode, setMode] = useState(getInitialMode); // 'editor' | 'task' | 'custom' | 'debug'
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);

  // Terminal active tab: 'output' | 'diagnostics'
  const [terminalTab, setTerminalTab] = useState('output');

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

  // Debug Mode state (Phase A13)
  const [debugChallenges, setDebugChallenges] = useState([]);
  const [activeDebugChallenge, setActiveDebugChallenge] = useState(null);
  const [isDebugEvaluating, setIsDebugEvaluating] = useState(false);
  const [debugEvaluationResult, setDebugEvaluationResult] = useState(null);
  const [debugHintsData, setDebugHintsData] = useState(null);

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

    // Load Phase A13 debug challenges
    getDebugChallenges()
      .then((data) => {
        if (data?.challenges?.length > 0) {
          setDebugChallenges(data.challenges);
          setActiveDebugChallenge(data.challenges[0]);
          if (getInitialMode() === 'debug' && data.challenges[0].buggy_code) {
            setCode(data.challenges[0].buggy_code);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load debug challenges:', err);
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

  const handleSelectDebugChallenge = useCallback((challengeId) => {
    const selected = debugChallenges.find((c) => c.id === challengeId);
    if (selected) {
      setActiveDebugChallenge(selected);
      setDebugEvaluationResult(null);
      setDebugHintsData(null);
      if (selected.buggy_code) {
        setCode(selected.buggy_code);
      }
    }
  }, [debugChallenges]);

  const handleResetToBuggy = useCallback(() => {
    if (activeDebugChallenge?.buggy_code) {
      setCode(activeDebugChallenge.buggy_code);
      setDebugEvaluationResult(null);
      setDebugHintsData(null);
    }
  }, [activeDebugChallenge]);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    // Sync URL query parameter without full reload
    try {
      const url = new URL(window.location);
      url.searchParams.set('mode', newMode);
      window.history.replaceState({}, '', url);
    } catch (e) {}

    if (newMode === 'task' && activeTask && activeTask.starter_code && code === DEFAULT_PYTHON_CODE) {
      setCode(activeTask.starter_code);
    } else if (newMode === 'debug' && activeDebugChallenge?.buggy_code) {
      setCode(activeDebugChallenge.buggy_code);
    }
  };

  const handleResetCode = useCallback(() => {
    if (mode === 'task' && activeTask?.starter_code) {
      setCode(activeTask.starter_code);
    } else if (mode === 'debug' && activeDebugChallenge?.buggy_code) {
      setCode(activeDebugChallenge.buggy_code);
    } else {
      setCode(DEFAULT_PYTHON_CODE);
    }
    setResult(null);
    setEvaluationResult(null);
    setDebugEvaluationResult(null);
    setHintsData(null);
    setDebugHintsData(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, [mode, activeTask, activeDebugChallenge]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, []);

  /**
   * Execute code via backend Code Runner API (Free Play / Script execution).
   */
  const handleRun = useCallback(async () => {
    if (isRunning || isEvaluating || isDebugEvaluating) return;

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
  }, [code, isRunning, isEvaluating, isDebugEvaluating]);

  /**
   * Evaluate code against all test cases for active task (Phase A5/A6).
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

      // Phase A12: Record task evaluation attempt in Progress & Score Engine
      try {
        recordProgressAttempt({
          taskId: activeTask.id,
          taskTitle: activeTask.title,
          category: 'starter',
          scorePercentage: evalRes.score_percentage || 0,
          passedAll: !!evalRes.passed_all,
          passedTests: evalRes.passed_tests || 0,
          totalTests: evalRes.total_tests || 0,
        })
          .then(() => {
            window.dispatchEvent(new CustomEvent('progress-updated'));
          })
          .catch((progErr) => {
            console.warn('Failed to record progress attempt:', progErr);
          });
      } catch (err) {
        console.warn('Error recording progress attempt:', err);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to evaluate task on backend');
    } finally {
      setIsEvaluating(false);
    }
  }, [code, activeTask, isEvaluating, isRunning]);

  /**
   * Evaluate repaired code against active Debug Mode challenge test cases (Phase A13).
   */
  const handleEvaluateDebug = useCallback(async () => {
    if (!activeDebugChallenge || isDebugEvaluating || isRunning) return;

    setIsDebugEvaluating(true);
    setApiError(null);

    try {
      const res = await evaluateDebugChallenge(activeDebugChallenge.id, code);
      if (res?.evaluation) {
        setDebugEvaluationResult(res.evaluation);
        if (res.hints) {
          setDebugHintsData({
            has_hints: true,
            hints: res.hints,
            rule_name: res.hints.rule_name,
            matched_mistake: res.hints.matched_mistake,
            source: res.hints.source || 'rule_based',
          });
        }
        window.dispatchEvent(new CustomEvent('progress-updated'));
      }
    } catch (err) {
      setApiError(err.message || 'Failed to evaluate debug challenge on backend');
    } finally {
      setIsDebugEvaluating(false);
    }
  }, [code, activeDebugChallenge, isDebugEvaluating, isRunning]);

  // Keyboard shortcut: Ctrl+Enter executes or evaluates depending on mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (mode === 'task') {
          handleEvaluate();
        } else if (mode === 'debug') {
          handleEvaluateDebug();
        } else {
          handleRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleRun, handleEvaluate, handleEvaluateDebug]);

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
    switch (mode) {
      case 'task':
        return {
          tag: 'Task Practice Track',
          accentClass: 'mode-accent--amber',
          title: 'Curriculum & Test Grading',
          desc: 'Code against comprehensive unit tests with instant evaluation, score breakdown, and tiered hints.',
        };
      case 'debug':
        return {
          tag: 'Bug Diagnosis Track',
          accentClass: 'mode-accent--violet',
          title: 'Debug Mode: Fix Broken Code',
          desc: 'Diagnose and fix real-world Python bugs with pedagogical hints, syntax explanations, and unit tests.',
        };
      case 'custom':
        return {
          tag: 'Challenge Authoring Engine',
          accentClass: 'mode-accent--blue',
          title: 'Custom Question Playground',
          desc: 'Design bespoke Python coding questions with custom input/output test specifications and automated grading.',
        };
      default:
        return {
          tag: 'Sandbox Environment',
          accentClass: 'mode-accent--mint',
          title: 'Python Free Play & Diagnostics',
          desc: 'Isolated Python sandbox with instant plain-English syntax diagnostics and interactive Socratic AI guidance.',
        };
    }
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
              aria-selected={mode === 'editor'}
              className={`mode-tab mode-tab--editor ${mode === 'editor' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('editor')}
            >
              <span className="mode-tab__dot" />
              <span>Free Play</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'task'}
              className={`mode-tab mode-tab--task ${mode === 'task' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('task')}
            >
              <span className="mode-tab__dot" />
              <span>Task Eval</span>
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
              <span>Custom</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'debug'}
              className={`mode-tab mode-tab--debug ${mode === 'debug' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('debug')}
              id="tab-debug-mode"
            >
              <span className="mode-tab__dot" />
              <span>Debug</span>
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
                {mode === 'task' ? (
                  <>
                    <button
                      id="btn-evaluate-task"
                      className="btn btn--primary btn--accent-amber"
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
                      title="Run script in terminal without grading"
                    >
                      <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                      {isRunning ? 'Running…' : 'Run Script'}
                    </button>
                  </>
                ) : mode === 'debug' ? (
                  <>
                    <button
                      id="btn-evaluate-debug"
                      className="btn btn--primary btn--accent-violet"
                      onClick={handleEvaluateDebug}
                      disabled={isDebugEvaluating || isRunning}
                      aria-label="Evaluate fix against test cases"
                      title="Grade repaired code against tests (Ctrl+Enter)"
                    >
                      <span aria-hidden="true">{isDebugEvaluating ? '⏳' : '⚡'}</span>
                      {isDebugEvaluating ? 'Evaluating…' : 'Evaluate Fix'}
                    </button>

                    <button
                      id="btn-run-code"
                      className="btn btn--secondary"
                      onClick={handleRun}
                      disabled={isRunning || isDebugEvaluating}
                      aria-label="Run code in terminal"
                      title="Run script in terminal without grading"
                    >
                      <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                      {isRunning ? 'Running…' : 'Run Script'}
                    </button>
                  </>
                ) : (
                  <button
                    id="btn-run-code"
                    className="btn btn--primary btn--accent-mint"
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
                  disabled={isRunning || isEvaluating || isDebugEvaluating}
                  aria-label="Reset editor code"
                  title="Reset code to initial template"
                >
                  <span aria-hidden="true">↺</span>
                  Reset
                </button>
              </div>

              <div className="editor-panel__toolbar-right">
                {/* Phase A11: Help / AI Assistance Counter */}
                <HelpUsageWidget />

                <span className="editor-panel__shortcut-hint">
                  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to {mode === 'task' || mode === 'debug' ? 'evaluate' : 'run'}
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
          {mode === 'task' ? (
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
          ) : mode === 'custom' ? (
            <section className="task-panel" aria-label="Custom Question Panel">
              <CustomQuestionPanel
                code={code}
                onApplyStarterCode={(starter) => setCode(starter)}
              />
            </section>
          ) : mode === 'debug' ? (
            <section className="task-panel" aria-label="Debug Challenge Panel">
              <DebugChallengePanel
                code={code}
                challenges={debugChallenges}
                activeChallenge={activeDebugChallenge}
                onSelectChallenge={handleSelectDebugChallenge}
                onResetToBuggy={handleResetToBuggy}
                evaluationResult={debugEvaluationResult}
                isEvaluating={isDebugEvaluating}
                hintsData={debugHintsData}
              />
            </section>
          ) : (
            /* Free Play Mode: Dedicated AI Tutor Panel in Zone 3 */
            <section className="tutor-freeplay-panel" aria-label="AI Socratic Tutor">
              <AITutorPanel
                code={code}
                diagnostic={result?.diagnostic}
                executionDetails={result}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
