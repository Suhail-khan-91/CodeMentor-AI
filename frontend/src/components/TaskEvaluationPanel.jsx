/**
 * TaskEvaluationPanel.jsx — Task & Test Case Evaluation Component (Phase A5).
 *
 * Displays task requirements, allows selecting starter tasks, and renders
 * comprehensive evaluation outcomes with test case breakdown, diff views, and diagnostics.
 */

import { useState } from 'react';
import DiagnosticCard from './DiagnosticCard';
import './TaskEvaluationPanel.css';

export default function TaskEvaluationPanel({
  tasks,
  activeTask,
  onSelectTask,
  evaluationResult,
  isEvaluating,
}) {
  const [expandedTc, setExpandedTc] = useState(null);

  const toggleAccordion = (tcId) => {
    setExpandedTc(prev => (prev === tcId ? null : tcId));
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
    <div className="task-eval-panel" aria-label="Task Evaluation Workspace">
      {/* 1. Task Selector Navigation */}
      <div className="task-eval-panel__selector">
        <label htmlFor="task-select" className="task-eval-panel__selector-label">
          Practice Challenge:
        </label>
        <select
          id="task-select"
          className="task-eval-panel__select"
          value={activeTask?.id || ''}
          onChange={(e) => onSelectTask(e.target.value)}
        >
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Active Task Description Card */}
      {activeTask && (
        <div className="task-card">
          <div className="task-card__header">
            <h2 className="task-card__title">{activeTask.title}</h2>
            <span className="task-card__test-count">
              {activeTask.test_cases?.length || 0} Test Cases
            </span>
          </div>
          <p className="task-card__desc">{activeTask.description}</p>
        </div>
      )}

      {/* 3. Evaluating loader */}
      {isEvaluating && (
        <div className="eval-loading">
          <div className="eval-spinner" aria-hidden="true" />
          <p className="eval-loading__text">Running code against all test cases…</p>
        </div>
      )}

      {/* 4. Evaluation Outcome Summary */}
      {!isEvaluating && evaluationResult && (
        <div className="eval-results">
          {/* Score Summary Header */}
          <div className={`eval-summary eval-summary--${evaluationResult.status}`}>
            <div className="eval-summary__score-row">
              <div className="eval-summary__score-group">
                <span className="eval-summary__score-label">Score</span>
                <span className="eval-summary__score-value">
                  {evaluationResult.score_percentage}%
                </span>
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

          {/* Test Case Breakdown List */}
          <div className="eval-tc-list">
            <h3 className="eval-tc-list__title">Test Case Breakdown</h3>

            {evaluationResult.test_results.map((tr, index) => {
              const isExpanded = expandedTc === tr.test_case_id || !tr.passed;

              return (
                <div
                  key={tr.test_case_id || index}
                  className={`eval-tc-card eval-tc-card--${tr.status}`}
                >
                  {/* Test Case Header / Accordion trigger */}
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
                      <span className="eval-tc-card__time">
                        {tr.execution_time_ms} ms
                      </span>
                      <span className="eval-tc-card__toggle-icon" aria-hidden="true">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Test Details */}
                  {isExpanded && (
                    <div className="eval-tc-card__body">
                      {/* Diagnostic Card if this test case produced a Python crash */}
                      {tr.diagnostic && tr.diagnostic.has_diagnostic && (
                        <DiagnosticCard diagnostic={tr.diagnostic} />
                      )}

                      {/* Visible Input / Expected / Actual table */}
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
                          🔒 This is a hidden test case. Input and expected values are protected to prevent hardcoded solutions.
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
  );
}
