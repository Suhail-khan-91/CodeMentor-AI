/**
 * TaskEvaluationPanel.jsx — Task & Test Case Evaluation Component (Upgraded)
 *
 * Implements scoped sub-tabs:
 * - Requirements: Challenge prompt, test count badge, specifications, live score meter.
 * - Tests: Detailed test case accordions with input/expected/actual diffs, diagnostics, and hidden test shields.
 * - Hints: 3-tier progressive hint engine.
 * - AI Tutor: Integrated Socratic tutoring.
 */

import { useState, useEffect } from 'react';
import DiagnosticCard from './DiagnosticCard';
import ProgressiveHintPanel from './ProgressiveHintPanel';
import AITutorPanel from './AITutorPanel';
import './TaskEvaluationPanel.css';

export default function TaskEvaluationPanel({
  code,
  tasks = [],
  activeTask,
  onSelectTask,
  evaluationResult,
  isEvaluating,
  hintsData,
}) {
  const [activeSubTab, setActiveSubTab] = useState('requirements'); // 'requirements' | 'tests' | 'hints' | 'tutor'
  const [expandedTc, setExpandedTc] = useState(null);

  // Auto-switch to tests tab and expand first failing test case upon new evaluation results
  useEffect(() => {
    if (evaluationResult) {
      setActiveSubTab('tests');
      const firstFail = evaluationResult.test_results?.find((t) => !t.passed);
      if (firstFail) {
        setExpandedTc(firstFail.test_case_id);
      }
    }
  }, [evaluationResult]);

  const toggleAccordion = (tcId) => {
    setExpandedTc((prev) => (prev === tcId ? null : tcId));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'passed':
        return 'tc-status--passed';
      case 'failed':
        return 'tc-status--failed';
      case 'timeout':
        return 'tc-status--timeout';
      case 'error':
      default:
        return 'tc-status--error';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return '✓ Passed';
      case 'failed':
        return '✗ Failed';
      case 'timeout':
        return '⏱ Timed Out';
      case 'error':
      default:
        return '⚠ Error';
    }
  };

  return (
    <div className="task-eval-shell" aria-label="Task Evaluation Workspace">
      {/* 1. Header: Challenge Selector & Mini Card */}
      <div className="task-eval-header">
        <div className="task-selector-row">
          <label htmlFor="task-select" className="task-selector-label">
            PRACTICE CHALLENGE
          </label>
          <select
            id="task-select"
            className="input task-select-dropdown"
            value={activeTask?.id || ''}
            onChange={(e) => onSelectTask(e.target.value)}
          >
            {tasks.map((t, idx) => (
              <option key={t.id} value={t.id}>
                #{idx + 1} — {t.title}
              </option>
            ))}
          </select>
        </div>

        {activeTask && (
          <div className="task-mini-card">
            <div className="task-mini-card__top">
              <span className="task-mini-card__category">Python Basics</span>
              <span className="badge badge--amber">
                {activeTask.test_cases?.length || 0} Test Cases
              </span>
            </div>
            <h3 className="task-mini-card__title">{activeTask.title}</h3>
          </div>
        )}
      </div>

      {/* 2. Scoped Mode Tabs */}
      <div className="task-scoped-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'requirements'}
          className={`task-tab ${activeSubTab === 'requirements' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveSubTab('requirements')}
        >
          Requirements
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'tests'}
          className={`task-tab ${activeSubTab === 'tests' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveSubTab('tests')}
        >
          Tests {evaluationResult ? `(${evaluationResult.passed_tests}/${evaluationResult.total_tests})` : ''}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'hints'}
          className={`task-tab ${activeSubTab === 'hints' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveSubTab('hints')}
        >
          Hints
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'tutor'}
          className={`task-tab ${activeSubTab === 'tutor' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveSubTab('tutor')}
        >
          AI Tutor
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="task-tab-content">
        {/* TAB 1: REQUIREMENTS */}
        {activeSubTab === 'requirements' && (
          <div className="task-tab-pane">
            {/* Score Block if evaluated */}
            {evaluationResult && (
              <div className="task-score-card">
                <div className="task-score-card__top">
                  <span className="task-score-label">BEST EVALUATION SCORE</span>
                  <span className="task-score-value">{evaluationResult.score_percentage}%</span>
                </div>
                <div className="task-score-track">
                  <div
                    className={`task-score-fill task-score-fill--${evaluationResult.status}`}
                    style={{ width: `${evaluationResult.score_percentage}%` }}
                  />
                </div>
                <span className="task-score-sub">
                  {evaluationResult.passed_tests} of {evaluationResult.total_tests} test cases passing
                </span>
              </div>
            )}

            {/* Problem Description */}
            <div className="task-prompt-block">
              <h4 className="task-block-title">Problem Statement</h4>
              <p className="task-prompt-text">{activeTask?.description}</p>
            </div>

            <div className="task-instructions-block">
              <h4 className="task-block-title">Guidance</h4>
              <ul className="task-instructions-list">
                <li>Read requirements carefully and write your solution in the editor.</li>
                <li>Press <strong>Evaluate Task</strong> (or run in scratchpad) to test your code against the suite.</li>
                <li>Progressive hints unlock without penalty if you get stuck.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: TESTS & EVALUATION RESULTS */}
        {activeSubTab === 'tests' && (
          <div className="task-tab-pane">
            {isEvaluating && (
              <div className="task-eval-loader" role="status">
                <div className="task-eval-spinner" aria-hidden="true" />
                <span>Grading solution against all test cases…</span>
              </div>
            )}

            {!isEvaluating && !evaluationResult && (
              <div className="task-tests-empty">
                <div className="tests-empty-icon" aria-hidden="true">🎯</div>
                <h4 className="tests-empty-title">Ready for Evaluation</h4>
                <p className="tests-empty-desc">
                  Click the <strong>🎯 Evaluate Task</strong> button in the toolbar to run your code against both visible and hidden test cases.
                </p>
              </div>
            )}

            {!isEvaluating && evaluationResult && (
              <div className="task-results-container">
                {/* Score Summary Banner */}
                <div className={`task-eval-banner task-eval-banner--${evaluationResult.status}`}>
                  <div className="banner-score-group">
                    <span className="banner-score-num">{evaluationResult.score_percentage}%</span>
                    <div>
                      <span className="banner-score-ratio">
                        {evaluationResult.passed_tests} / {evaluationResult.total_tests} Passed
                      </span>
                      <p className="banner-score-msg">{evaluationResult.summary_message}</p>
                    </div>
                  </div>
                  <div className="task-score-track">
                    <div
                      className={`task-score-fill task-score-fill--${evaluationResult.status}`}
                      style={{ width: `${evaluationResult.score_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Test Case Accordion List */}
                <div className="test-cards-list">
                  <h4 className="test-list-header">Test Case Breakdown</h4>
                  {evaluationResult.test_results?.map((tr, index) => {
                    const isExpanded = expandedTc === tr.test_case_id || !tr.passed;

                    return (
                      <div
                        key={tr.test_case_id || index}
                        className={`test-card test-card--${tr.status}`}
                      >
                        <button
                          type="button"
                          className="test-card__trigger"
                          onClick={() => toggleAccordion(tr.test_case_id)}
                          aria-expanded={isExpanded}
                        >
                          <div className="test-card__trigger-left">
                            <span className={`tc-status-pill ${getStatusBadgeClass(tr.status)}`}>
                              {getStatusIcon(tr.status)}
                            </span>
                            <span className="test-card__name">
                              Test {index + 1}: {tr.description}
                            </span>
                            {tr.is_hidden && (
                              <span className="test-hidden-tag">Hidden</span>
                            )}
                          </div>
                          <div className="test-card__trigger-right">
                            <span className="test-exec-time">{tr.execution_time_ms} ms</span>
                            <span className="test-chevron" aria-hidden="true">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="test-card__details">
                            {/* Diagnostic card if Python crash occurred */}
                            {tr.diagnostic && tr.diagnostic.has_diagnostic && (
                              <DiagnosticCard
                                diagnostic={tr.diagnostic}
                                code={code}
                                executionResult={tr}
                              />
                            )}

                            {/* Public test case diffs */}
                            {!tr.is_hidden ? (
                              <div className="test-diff-grid">
                                {tr.stdin && (
                                  <div className="diff-box">
                                    <span className="diff-box__label">Input (stdin):</span>
                                    <pre className="diff-box__code"><code>{tr.stdin}</code></pre>
                                  </div>
                                )}
                                <div className="diff-box">
                                  <span className="diff-box__label">Expected Output:</span>
                                  <pre className="diff-box__code diff-box__code--expected">
                                    <code>{tr.expected_output}</code>
                                  </pre>
                                </div>
                                <div className="diff-box">
                                  <span className="diff-box__label">Your Actual Output:</span>
                                  <pre className={`diff-box__code ${tr.passed ? 'diff-box__code--pass' : 'diff-box__code--fail'}`}>
                                    <code>{tr.actual_output || '[No output produced]'}</code>
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <p className="test-hidden-shield-msg">
                                🔒 Hidden verification test case. Input and expected values are protected to prevent hardcoding.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROGRESSIVE HINTS */}
        {activeSubTab === 'hints' && (
          <div className="task-tab-pane">
            {hintsData ? (
              <ProgressiveHintPanel
                hintsData={hintsData}
                taskTitle={activeTask?.title}
              />
            ) : (
              <div className="task-tests-empty">
                <div className="tests-empty-icon" aria-hidden="true">💡</div>
                <h4 className="tests-empty-title">Hints Available on Evaluation</h4>
                <p className="tests-empty-desc">
                  Progressive hints unlock when you evaluate your code against the challenge test suite.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SOCRATIC AI TUTOR */}
        {activeSubTab === 'tutor' && (
          <div className="task-tab-pane">
            <AITutorPanel
              code={code}
              activeTask={activeTask}
              evaluationResult={evaluationResult}
            />
          </div>
        )}
      </div>
    </div>
  );
}
