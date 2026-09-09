/**
 * DebugChallengePanel.jsx — Phase A13: Debug Mode Component (Upgraded)
 *
 * Provides a dedicated debugging laboratory:
 * - Bug catalog selector with taxonomy badges (#01–#05)
 * - Scoped sub-tabs: Bug Info, Test Results, Progressive Hints, and AI Tutor
 * - Revert to original broken code action
 * - Automated fix verification with diffs
 */

import { useState, useEffect } from 'react';
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
  const [activeSubTab, setActiveSubTab] = useState('info'); // 'info' | 'tests' | 'hints' | 'tutor'
  const [expandedTc, setExpandedTc] = useState(null);

  // Auto-switch to tests upon evaluation
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

  const getBugTypeBadge = (bugType) => {
    switch (bugType) {
      case 'syntax':
        return <span className="badge badge--rose">🔍 Syntax Bug</span>;
      case 'type_error':
        return <span className="badge badge--amber">⚡ Type Error</span>;
      case 'logic':
        return <span className="badge badge--violet">🧩 Logic Bug</span>;
      case 'runtime':
        return <span className="badge badge--rose">💥 Runtime Bug</span>;
      default:
        return <span className="badge">🐛 Buggy Code</span>;
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

  return (
    <div className="debug-shell" aria-label="Debug Mode Workspace">
      {/* ── Top: Bug Catalog Carousel / List ── */}
      <div className="debug-header">
        <div className="debug-catalog-title">
          <span>DEBUGGING CHALLENGES</span>
          <select
            id="debug-select"
            className="input debug-dropdown"
            value={activeChallenge?.id || ''}
            onChange={(e) => onSelectChallenge(e.target.value)}
          >
            {challenges.map((c, i) => (
              <option key={c.id} value={c.id}>
                #{i + 1 < 10 ? `0${i + 1}` : i + 1} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Challenge Cards Carousel */}
        <div className="debug-cards-scroll">
          {challenges.map((c, i) => {
            const isActive = activeChallenge?.id === c.id;
            return (
              <div
                key={c.id}
                className={`debug-item-card ${isActive ? 'debug-item-card--active' : ''}`}
                onClick={() => onSelectChallenge(c.id)}
                role="button"
                tabIndex={0}
              >
                <div className="debug-item-card__top">
                  <span className="debug-item-num">
                    #{i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </span>
                  {getBugTypeBadge(c.bug_type)}
                </div>
                <strong className="debug-item-title">{c.title}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scoped Tabs ── */}
      <div className="task-scoped-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'info'}
          className={`task-tab ${activeSubTab === 'info' ? 'task-tab--active' : ''}`}
          style={activeSubTab === 'info' ? { color: 'var(--violet)', borderBottomColor: 'var(--violet)' } : {}}
          onClick={() => setActiveSubTab('info')}
        >
          Bug Info
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'tests'}
          className={`task-tab ${activeSubTab === 'tests' ? 'task-tab--active' : ''}`}
          style={activeSubTab === 'tests' ? { color: 'var(--violet)', borderBottomColor: 'var(--violet)' } : {}}
          onClick={() => setActiveSubTab('tests')}
        >
          Test Results {evaluationResult ? `(${evaluationResult.passed_tests}/${evaluationResult.total_tests})` : ''}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'hints'}
          className={`task-tab ${activeSubTab === 'hints' ? 'task-tab--active' : ''}`}
          style={activeSubTab === 'hints' ? { color: 'var(--violet)', borderBottomColor: 'var(--violet)' } : {}}
          onClick={() => setActiveSubTab('hints')}
        >
          Hints
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'tutor'}
          className={`task-tab ${activeSubTab === 'tutor' ? 'task-tab--active' : ''}`}
          style={activeSubTab === 'tutor' ? { color: 'var(--violet)', borderBottomColor: 'var(--violet)' } : {}}
          onClick={() => setActiveSubTab('tutor')}
        >
          AI Tutor
        </button>
      </div>

      {/* ── Sub-Tab Contents ── */}
      <div className="debug-tab-content">
        {/* TAB 1: BUG INFO */}
        {activeSubTab === 'info' && (
          <div className="task-tab-pane">
            {activeChallenge && (
              <div className="debug-scenario-card">
                <div className="debug-scenario-card__header">
                  <span className="debug-phase-tag">Phase A13 • Debug Challenge</span>
                  {getBugTypeBadge(activeChallenge.bug_type)}
                </div>

                <h3 className="debug-scenario-title">{activeChallenge.title}</h3>
                <p className="debug-scenario-desc">{activeChallenge.description}</p>

                <div className="debug-actions-bar">
                  <button
                    type="button"
                    className="btn btn--ghost debug-revert-btn"
                    onClick={onResetToBuggy}
                    id="btn-revert-buggy-code"
                    title="Reset code editor back to the original broken snippet"
                  >
                    <span>↺</span> Revert to Buggy Code
                  </button>
                  <span className="debug-tc-count">
                    {activeChallenge.test_cases?.length || 1} Verification Tests
                  </span>
                </div>
              </div>
            )}

            <div className="debug-instructions-card">
              <h4 className="task-block-title">Debugging Protocol</h4>
              <ul className="task-instructions-list">
                <li>Inspect the broken Python code in Monaco Editor.</li>
                <li>Analyze variable bindings, loop conditions, and exception traces.</li>
                <li>Press <strong>Evaluate Fix</strong> in the toolbar to grade your repairs.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: TEST RESULTS */}
        {activeSubTab === 'tests' && (
          <div className="task-tab-pane">
            {isEvaluating && (
              <div className="task-eval-loader" role="status">
                <div className="task-eval-spinner" style={{ borderTopColor: 'var(--violet)' }} />
                <span>Running repaired code against verification suite…</span>
              </div>
            )}

            {!isEvaluating && !evaluationResult && (
              <div className="task-tests-empty">
                <div className="tests-empty-icon" style={{ color: 'var(--violet)' }}>🐛</div>
                <h4 className="tests-empty-title">Ready to Verify Fix</h4>
                <p className="tests-empty-desc">
                  Click the <strong>🎯 Evaluate Fix</strong> button in the toolbar to test whether the bug has been resolved.
                </p>
              </div>
            )}

            {!isEvaluating && evaluationResult && (
              <div className="task-results-container">
                {/* Celebratory or Status Banner */}
                {evaluationResult.passed_all ? (
                  <div className="debug-celebration-banner" role="status">
                    <span className="celebration-icon" aria-hidden="true">🎉</span>
                    <div>
                      <h4 className="celebration-title">Bug Successfully Fixed!</h4>
                      <p className="celebration-msg">
                        All test cases passed with a 100% score. Great debugging work!
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}

                {/* Test case breakdown accordions */}
                <div className="test-cards-list">
                  {evaluationResult.test_results?.map((tr, index) => {
                    const isExpanded = expandedTc === tr.test_case_id || !tr.passed;

                    return (
                      <div key={tr.test_case_id || index} className={`test-card test-card--${tr.status}`}>
                        <button
                          type="button"
                          className="test-card__trigger"
                          onClick={() => toggleAccordion(tr.test_case_id)}
                        >
                          <div className="test-card__trigger-left">
                            <span className={`tc-status-pill ${getStatusBadgeClass(tr.status)}`}>
                              {tr.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                            <span className="test-card__name">Test {index + 1}: {tr.description}</span>
                          </div>
                          <span className="test-chevron">{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        {isExpanded && (
                          <div className="test-card__details">
                            {tr.diagnostic && tr.diagnostic.has_diagnostic && (
                              <DiagnosticCard
                                diagnostic={tr.diagnostic}
                                code={code}
                                executionResult={tr}
                              />
                            )}

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
                                🔒 Hidden verification test case.
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

        {/* TAB 3: HINTS */}
        {activeSubTab === 'hints' && (
          <div className="task-tab-pane">
            {hintsData ? (
              <ProgressiveHintPanel
                hintsData={hintsData}
                taskTitle={activeChallenge?.title}
              />
            ) : (
              <div className="task-tests-empty">
                <div className="tests-empty-icon" style={{ color: 'var(--violet)' }}>💡</div>
                <h4 className="tests-empty-title">Debugging Hints</h4>
                <p className="tests-empty-desc">
                  Hints unlock when you run evaluation on your repaired code.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI TUTOR */}
        {activeSubTab === 'tutor' && (
          <div className="task-tab-pane">
            <AITutorPanel
              code={code}
              activeTask={activeChallenge}
              evaluationResult={evaluationResult}
            />
          </div>
        )}
      </div>
    </div>
  );
}
