/**
 * DebugChallengePanel.jsx — Phase A13: Debug Mode Component.
 *
 * Interactive panel for selecting buggy starter challenges, reviewing requirements,
 * inspecting Expected vs Actual output diffs, viewing diagnostics (A4/A9),
 * unlocking progressive hints (A6), and consulting the Socratic AI Tutor (A7).
 */

import { useState } from 'react';
import DiagnosticCard from './DiagnosticCard';
import ProgressiveHintPanel from './ProgressiveHintPanel';
import AITutorPanel from './AITutorPanel';
import './DebugChallengePanel.css';

export default function DebugChallengePanel({
  code,
  challenges = [],
  activeChallenge,
  onSelectChallenge,
  onResetToBuggy,
  evaluationResult,
  isEvaluating,
  hintsData,
}) {
  const [expandedTc, setExpandedTc] = useState(null);

  const toggleAccordion = (tcId) => {
    setExpandedTc((prev) => (prev === tcId ? null : tcId));
  };

  const getBugTypeBadge = (bugType) => {
    switch (bugType) {
      case 'syntax':
        return <span className="debug-type-badge debug-type-badge--syntax">🔍 Syntax Bug</span>;
      case 'type_error':
        return <span className="debug-type-badge debug-type-badge--type">⚡ Type Error</span>;
      case 'logic':
        return <span className="debug-type-badge debug-type-badge--logic">🧩 Logic Bug</span>;
      case 'runtime':
        return <span className="debug-type-badge debug-type-badge--runtime">💥 Runtime Bug</span>;
      default:
        return <span className="debug-type-badge">🐛 Buggy Code</span>;
    }
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
    <div className="debug-panel" aria-label="Debug Mode Workspace">
      {/* 1. Challenge Selector Bar */}
      <div className="debug-panel__selector">
        <label htmlFor="debug-select" className="debug-panel__selector-label">
          🐛 Select Buggy Challenge:
        </label>
        <select
          id="debug-select"
          className="debug-panel__select"
          value={activeChallenge?.id || ''}
          onChange={(e) => onSelectChallenge(e.target.value)}
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Challenge Scenario & Bug Description Card */}
      {activeChallenge && (
        <div className="debug-card">
          <div className="debug-card__top">
            <div className="debug-card__title-group">
              <span className="debug-card__mode-tag">Phase A13 • Debug Challenge</span>
              <h2 className="debug-card__title">{activeChallenge.title}</h2>
            </div>
            {getBugTypeBadge(activeChallenge.bug_type)}
          </div>

          <p className="debug-card__desc">{activeChallenge.description}</p>

          <div className="debug-card__actions">
            <button
              type="button"
              className="btn btn--ghost debug-btn-revert"
              onClick={onResetToBuggy}
              title="Reset editor back to the original broken code"
              id="btn-revert-buggy-code"
            >
              <span aria-hidden="true">↺</span> Revert to Buggy Code
            </button>
            <span className="debug-card__test-count">
              {activeChallenge.test_cases?.length || activeChallenge.test_cases_count || 1} Test Cases
            </span>
          </div>
        </div>
      )}

      {/* 3. Evaluating loader */}
      {isEvaluating && (
        <div className="eval-loading">
          <div className="eval-spinner" aria-hidden="true" />
          <p className="eval-loading__text">Running repaired code against test cases…</p>
        </div>
      )}

      {/* 4. Evaluation Outcome Summary */}
      {!isEvaluating && evaluationResult && (
        <div className="debug-result-section">
          {/* Passed All Banner */}
          {evaluationResult.passed_all ? (
            <div className="debug-success-card" role="status">
              <div className="debug-success-card__icon" aria-hidden="true">🎉</div>
              <div>
                <h3 className="debug-success-card__title">Bug Successfully Fixed!</h3>
                <p className="debug-success-card__msg">
                  All test cases passed with a 100% score! Progress and attempts have been recorded.
                </p>
              </div>
            </div>
          ) : (
            <div className={`eval-summary-card eval-summary-card--${evaluationResult.status}`}>
              <div className="eval-summary__top">
                <div className="eval-summary__score-badge">
                  Score: <strong>{evaluationResult.score_percentage}%</strong>
                </div>
                <div className="eval-summary__ratio-badge">
                  {evaluationResult.passed_tests} / {evaluationResult.total_tests} Passed
                </div>
              </div>

              <div className="eval-progress-bar">
                <div
                  className={`eval-progress-bar__fill eval-progress-bar__fill--${evaluationResult.status}`}
                  style={{ width: `${evaluationResult.score_percentage}%` }}
                />
              </div>

              <p className="eval-summary__message">
                {evaluationResult.summary_message}
              </p>
            </div>
          )}

          {/* Test Case Breakdown List */}
          {evaluationResult.test_results && evaluationResult.test_results.length > 0 && (
            <div className="eval-tc-list">
              <h3 className="eval-tc-list__title">Test Case Breakdown</h3>

              {evaluationResult.test_results.map((tr, index) => {
                const isExpanded = expandedTc === tr.test_case_id || !tr.passed;

                return (
                  <div
                    key={tr.test_case_id || index}
                    className={`eval-tc-card eval-tc-card--${tr.status}`}
                  >
                    {/* Header trigger */}
                    <button
                      type="button"
                      className="eval-tc-card__header"
                      onClick={() => toggleAccordion(tr.test_case_id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="eval-tc-card__header-left">
                        <span className={`tc-status-pill ${getStatusBadgeClass(tr.status)}`}>
                          {getStatusIcon(tr.status)}
                        </span>
                        <span className="eval-tc-card__name">
                          Test {index + 1}: {tr.description}
                        </span>
                        {tr.is_hidden && (
                          <span className="eval-tc-card__hidden-tag">Hidden</span>
                        )}
                      </div>

                      <div className="eval-tc-card__header-right">
                        <span className="eval-tc-card__time">{tr.execution_time_ms} ms</span>
                        <span className="eval-tc-card__toggle-icon" aria-hidden="true">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="eval-tc-card__body">
                        {/* Diagnostic Card if code threw an exception */}
                        {tr.diagnostic && tr.diagnostic.has_diagnostic && (
                          <DiagnosticCard
                            diagnostic={tr.diagnostic}
                            code={code}
                            executionResult={tr}
                          />
                        )}

                        {!tr.is_hidden ? (
                          <div className="eval-diff-grid">
                            {tr.stdin && (
                              <div className="eval-diff-box">
                                <span className="eval-diff-box__label">Standard Input (stdin):</span>
                                <pre className="eval-diff-box__code"><code>{tr.stdin}</code></pre>
                              </div>
                            )}

                            <div className="eval-diff-box">
                              <span className="eval-diff-box__label">Expected Output:</span>
                              <pre className="eval-diff-box__code eval-diff-box__code--expected">
                                <code>{tr.expected_output}</code>
                              </pre>
                            </div>

                            <div className="eval-diff-box">
                              <span className="eval-diff-box__label">Your Actual Output:</span>
                              <pre className={`eval-diff-box__code ${tr.passed ? 'eval-diff-box__code--actual-pass' : 'eval-diff-box__code--actual-fail'}`}>
                                <code>{tr.actual_output || '[No output produced]'}</code>
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <p className="eval-tc-card__hidden-msg">
                            🔒 This is a hidden verification test case.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Progressive Hint Engine Panel (Phase A6) */}
          {hintsData && !evaluationResult.passed_all && (
            <ProgressiveHintPanel
              hintsData={hintsData}
              taskTitle={activeChallenge?.title}
            />
          )}

          {/* 6. AI Tutor Engine Panel (Phase A7) */}
          {!evaluationResult.passed_all && (
            <AITutorPanel
              code={code}
              activeTask={activeChallenge}
              evaluationResult={evaluationResult}
            />
          )}
        </div>
      )}
    </div>
  );
}
