/**
 * CustomQuestionPanel.jsx — Custom Question Authoring & Solving Component (Upgraded)
 *
 * Implements dual-mode workflow:
 * 1. Author Mode: Form with templates, title, description, and test case generator.
 * 2. Solve Mode: Scoped tabs for Question requirements, Test case breakdown, and integrated AI Tutor.
 */

import { useState, useEffect } from 'react';
import DiagnosticCard from './DiagnosticCard';
import AITutorPanel from './AITutorPanel';
import {
  getCustomQuestionTemplates,
  validateCustomQuestion,
  evaluateCustomQuestion,
  recordProgressAttempt
} from '../services/api';
import './CustomQuestionPanel.css';

const DEFAULT_CUSTOM_QUESTION = {
  id: 'custom_star_triangle',
  title: 'Right-Angled Star Triangle',
  description: 'Write a program that takes an integer N from standard input and prints a right-angled triangle of asterisks (*) with N rows, where row i has i stars.',
  starter_code: 'n = int(input())\n# Print a star triangle with n rows\nfor i in range(1, n + 1):\n    print("*" * i)\n',
  test_cases: [
    {
      id: 'tc_star_1',
      description: '3-row triangle',
      stdin: '3',
      expected_output: '*\n**\n***',
      match_mode: 'trimmed'
    },
    {
      id: 'tc_star_2',
      description: '5-row triangle',
      stdin: '5',
      expected_output: '*\n**\n***\n****\n*****',
      match_mode: 'trimmed'
    }
  ]
};

export default function CustomQuestionPanel({
  code,
  onApplyStarterCode,
}) {
  const [question, setQuestion] = useState(DEFAULT_CUSTOM_QUESTION);
  const [isEditing, setIsEditing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [validationError, setValidationError] = useState(null);

  // Evaluation & Tab state
  const [activeSubTab, setActiveSubTab] = useState('question'); // 'question' | 'tests' | 'tutor'
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evalError, setEvalError] = useState(null);
  const [expandedTc, setExpandedTc] = useState(null);

  useEffect(() => {
    getCustomQuestionTemplates()
      .then((res) => {
        if (res?.templates?.length > 0) {
          setTemplates(res.templates);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch custom question templates:', err);
      });
  }, []);

  const handleSelectTemplate = (templateId) => {
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      setQuestion(JSON.parse(JSON.stringify(selected)));
      setEvaluationResult(null);
      setValidationError(null);
      if (selected.starter_code && onApplyStarterCode) {
        onApplyStarterCode(selected.starter_code);
      }
    }
  };

  const toggleAccordion = (tcId) => {
    setExpandedTc((prev) => (prev === tcId ? null : tcId));
  };

  const handleAddTestCase = () => {
    const newTc = {
      id: `tc_custom_${Date.now()}`,
      description: `Test Case ${question.test_cases.length + 1}`,
      stdin: '',
      expected_output: '',
      match_mode: 'trimmed'
    };
    setQuestion((prev) => ({
      ...prev,
      test_cases: [...prev.test_cases, newTc]
    }));
  };

  const handleUpdateTestCase = (index, field, value) => {
    setQuestion((prev) => {
      const updated = [...prev.test_cases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, test_cases: updated };
    });
  };

  const handleRemoveTestCase = (index) => {
    setQuestion((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, idx) => idx !== index)
    }));
  };

  const handleSaveQuestion = async () => {
    setValidationError(null);
    try {
      const res = await validateCustomQuestion(question);
      if (res?.valid) {
        setIsEditing(false);
        setEvaluationResult(null);
      } else {
        setValidationError(res?.error || 'Validation failed.');
      }
    } catch (err) {
      setValidationError(err.message || 'Validation request failed.');
    }
  };

  const handleEvaluateCustom = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await evaluateCustomQuestion(code, question);
      setEvaluationResult(res);
      setActiveSubTab('tests');
      const firstFail = res.test_results?.find((t) => !t.passed);
      if (firstFail) {
        setExpandedTc(firstFail.test_case_id);
      }

      // Record progress under custom category
      recordProgressAttempt({
        taskId: question.id || 'custom_task',
        taskTitle: question.title || 'Custom Question',
        category: 'custom',
        scorePercentage: res.score_percentage || 0,
        passedAll: !!res.passed_all,
        passedTests: res.passed_tests || 0,
        totalTests: res.total_tests || 0,
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent('progress-updated'));
        })
        .catch((progErr) => {
          console.warn('Failed to record custom task progress:', progErr);
        });
    } catch (err) {
      setEvalError(err.message || 'Failed to evaluate custom question.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="custom-q-shell" role="region" aria-label="Custom Question Workspace">
      {/* ── Header Bar ── */}
      <div className="custom-q-header">
        <div className="custom-q-header__left">
          <span className="badge badge--blue">
            <span>✏️</span> Custom Question
          </span>
        </div>

        <div className="custom-q-header__right">
          {templates.length > 0 && isEditing && (
            <select
              className="input custom-template-select"
              onChange={(e) => handleSelectTemplate(e.target.value)}
              defaultValue=""
              aria-label="Load pre-made question template"
            >
              <option value="" disabled>Load Template…</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.title}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn btn--ghost btn-sm custom-toggle-btn"
            onClick={() => setIsEditing(!isEditing)}
            id="btn-toggle-edit-custom-q"
          >
            {isEditing ? '👁️ Solve View' : '✏️ Edit Question'}
          </button>
        </div>
      </div>

      {/* ── State 1: Author / Editor Form ── */}
      {isEditing ? (
        <div className="custom-author-pane">
          {validationError && (
            <div className="custom-alert custom-alert--error" role="alert">
              <span>⚠️</span> {validationError}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="custom-q-title" className="field-label">
              Question Title *
            </label>
            <input
              id="custom-q-title"
              type="text"
              className="input"
              value={question.title}
              onChange={(e) => setQuestion({ ...question, title: e.target.value })}
              placeholder="e.g. Reverse a String"
            />
          </div>

          <div className="field-group">
            <label htmlFor="custom-q-desc" className="field-label">
              Problem Description *
            </label>
            <textarea
              id="custom-q-desc"
              className="textarea"
              style={{ fontFamily: 'var(--font-body)' }}
              rows={3}
              value={question.description}
              onChange={(e) => setQuestion({ ...question, description: e.target.value })}
              placeholder="Explain expected inputs, logic, and output format..."
            />
          </div>

          <div className="field-group">
            <label htmlFor="custom-q-starter" className="field-label">
              Starter Code Template (Optional)
            </label>
            <textarea
              id="custom-q-starter"
              className="textarea"
              rows={2}
              value={question.starter_code || ''}
              onChange={(e) => setQuestion({ ...question, starter_code: e.target.value })}
              placeholder="# Starter snippet..."
            />
          </div>

          {/* Test Cases Manager */}
          <div className="custom-tc-section">
            <div className="custom-tc-header">
              <span className="field-label" style={{ margin: 0 }}>
                Test Cases ({question.test_cases.length})
              </span>
              <button
                type="button"
                className="btn btn--ghost btn-sm"
                onClick={handleAddTestCase}
                id="btn-add-test-case"
              >
                + Add Test Case
              </button>
            </div>

            {question.test_cases.map((tc, idx) => (
              <div key={tc.id || idx} className="custom-tc-card">
                <div className="custom-tc-card__top">
                  <input
                    type="text"
                    className="input custom-tc-desc"
                    value={tc.description}
                    onChange={(e) => handleUpdateTestCase(idx, 'description', e.target.value)}
                    placeholder={`Test Case ${idx + 1}`}
                  />
                  <select
                    className="input custom-tc-mode"
                    value={tc.match_mode || 'trimmed'}
                    onChange={(e) => handleUpdateTestCase(idx, 'match_mode', e.target.value)}
                  >
                    <option value="trimmed">Trimmed</option>
                    <option value="exact">Exact Match</option>
                    <option value="ignore_case">Ignore Case</option>
                    <option value="numeric_float">Float (±10⁻⁴)</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn--ghost btn-icon btn-sm"
                    onClick={() => handleRemoveTestCase(idx)}
                    title="Delete test case"
                  >
                    🗑️
                  </button>
                </div>

                <div className="custom-tc-fields">
                  <div>
                    <span className="field-label">Standard Input (stdin):</span>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={tc.stdin}
                      onChange={(e) => handleUpdateTestCase(idx, 'stdin', e.target.value)}
                      placeholder="(empty or sample input)"
                    />
                  </div>
                  <div>
                    <span className="field-label">Expected Output (stdout):</span>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={tc.expected_output}
                      onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                      placeholder="Expected stdout..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="custom-author-actions">
            <button
              type="button"
              className="btn btn--accent"
              style={{ width: '100%' }}
              onClick={handleSaveQuestion}
              id="btn-save-custom-q"
            >
              ✓ Save & Start Solving
            </button>
          </div>
        </div>
      ) : (
        /* ── State 2: Solve & Evaluation View ── */
        <div className="custom-solve-pane">
          {/* Sub-Tabs */}
          <div className="task-scoped-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'question'}
              className={`task-tab ${activeSubTab === 'question' ? 'task-tab--active' : ''}`}
              style={activeSubTab === 'question' ? { color: 'var(--blue)', borderBottomColor: 'var(--blue)' } : {}}
              onClick={() => setActiveSubTab('question')}
            >
              Question
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'tests'}
              className={`task-tab ${activeSubTab === 'tests' ? 'task-tab--active' : ''}`}
              style={activeSubTab === 'tests' ? { color: 'var(--blue)', borderBottomColor: 'var(--blue)' } : {}}
              onClick={() => setActiveSubTab('tests')}
            >
              Tests {evaluationResult ? `(${evaluationResult.passed_tests}/${evaluationResult.total_tests})` : `(${question.test_cases.length})`}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'tutor'}
              className={`task-tab ${activeSubTab === 'tutor' ? 'task-tab--active' : ''}`}
              style={activeSubTab === 'tutor' ? { color: 'var(--blue)', borderBottomColor: 'var(--blue)' } : {}}
              onClick={() => setActiveSubTab('tutor')}
            >
              AI Tutor
            </button>
          </div>

          <div className="custom-solve-content">
            {/* SUB-TAB 1: QUESTION */}
            {activeSubTab === 'question' && (
              <div className="task-tab-pane">
                {evaluationResult && (
                  <div className="task-score-card">
                    <div className="task-score-card__top">
                      <span className="task-score-label">CUSTOM EVALUATION SCORE</span>
                      <span className="task-score-value">{evaluationResult.score_percentage}%</span>
                    </div>
                    <div className="task-score-track">
                      <div
                        className={`task-score-fill task-score-fill--${evaluationResult.status}`}
                        style={{ width: `${evaluationResult.score_percentage}%` }}
                      />
                    </div>
                    <span className="task-score-sub">
                      {evaluationResult.passed_tests} / {evaluationResult.total_tests} test cases passing
                    </span>
                  </div>
                )}

                <div className="task-prompt-block">
                  <h3 className="custom-solve-title">{question.title}</h3>
                  <p className="task-prompt-text">{question.description}</p>
                </div>

                <div className="custom-grade-action-card">
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={handleEvaluateCustom}
                    disabled={isEvaluating}
                    id="btn-evaluate-custom-q"
                  >
                    <span>{isEvaluating ? '⏳' : '🎯'}</span>
                    <span>{isEvaluating ? 'Grading Tests…' : 'Grade Against Custom Tests'}</span>
                  </button>
                  <span className="custom-tc-tag">
                    {question.test_cases.length} test case{question.test_cases.length === 1 ? '' : 's'} defined
                  </span>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: TESTS */}
            {activeSubTab === 'tests' && (
              <div className="task-tab-pane">
                {evalError && (
                  <div className="custom-alert custom-alert--error">
                    <span>⚠️</span> {evalError}
                  </div>
                )}

                {evaluationResult ? (
                  <div className="task-results-container">
                    <div className="test-cards-list">
                      {evaluationResult.test_results?.map((tr, idx) => {
                        const isExpanded = expandedTc === tr.test_case_id;

                        return (
                          <div key={tr.test_case_id || idx} className={`test-card test-card--${tr.passed ? 'passed' : 'failed'}`}>
                            <button
                              type="button"
                              className="test-card__trigger"
                              onClick={() => toggleAccordion(tr.test_case_id)}
                            >
                              <div className="test-card__trigger-left">
                                <span className={`tc-status-pill ${tr.passed ? 'tc-status--passed' : 'tc-status--failed'}`}>
                                  {tr.passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                                <span className="test-card__name">{tr.description}</span>
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
                                      <code>{tr.expected_output || '[empty]'}</code>
                                    </pre>
                                  </div>
                                  <div className="diff-box">
                                    <span className="diff-box__label">Actual Output:</span>
                                    <pre className={`diff-box__code ${tr.passed ? 'diff-box__code--pass' : 'diff-box__code--fail'}`}>
                                      <code>{tr.actual_output || '[empty]'}</code>
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="task-tests-empty">
                    <div className="tests-empty-icon">🎯</div>
                    <h4 className="tests-empty-title">Grade Your Solution</h4>
                    <p className="tests-empty-desc">
                      Click <strong>Grade Against Custom Tests</strong> to run your solution against the defined test suite.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: AI TUTOR */}
            {activeSubTab === 'tutor' && (
              <div className="task-tab-pane">
                <AITutorPanel
                  code={code}
                  activeTask={question}
                  evaluationResult={evaluationResult}
                  diagnostic={evaluationResult?.test_results?.find((t) => t.diagnostic)?.diagnostic}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
