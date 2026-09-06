/**
 * CustomQuestionPanel.jsx — Custom Question Mode Component (Phase A10).
 *
 * Allows students to author, edit, load templates, and solve their own custom
 * programming challenges with full platform support:
 * - Define title, description, and custom test cases.
 * - Grade solutions against custom criteria via Phase A5 Evaluation Engine.
 * - View detailed test case diffs and diagnostic cards (A4 + A9).
 * - Socratic AI tutoring grounded in the student's custom problem (A7 + A8).
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
  starter_code: 'n = int(input())\n# Print a star triangle with n rows\n',
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

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evalError, setEvalError] = useState(null);
  const [expandedTc, setExpandedTc] = useState(null);

  // Load starter templates on mount
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

  // Handle template selection
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

  // Toggle accordion for test cases
  const toggleAccordion = (tcId) => {
    setExpandedTc(prev => (prev === tcId ? null : tcId));
  };

  // Add new test case
  const handleAddTestCase = () => {
    const newTc = {
      id: `tc_custom_${Date.now()}`,
      description: `Test Case ${question.test_cases.length + 1}`,
      stdin: '',
      expected_output: '',
      match_mode: 'trimmed'
    };
    setQuestion(prev => ({
      ...prev,
      test_cases: [...prev.test_cases, newTc]
    }));
  };

  // Update specific test case
  const handleUpdateTestCase = (index, field, value) => {
    setQuestion(prev => {
      const updated = [...prev.test_cases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, test_cases: updated };
    });
  };

  // Remove test case
  const handleRemoveTestCase = (index) => {
    setQuestion(prev => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, idx) => idx !== index)
    }));
  };

  // Save question editing
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

  // Grade code against custom criteria
  const handleEvaluateCustom = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await evaluateCustomQuestion(code, question);
      setEvaluationResult(res);
      // Auto-expand first failing test case
      const firstFail = res.test_results?.find(t => !t.passed);
      if (firstFail) {
        setExpandedTc(firstFail.test_case_id);
      }

      // Phase A12: Record custom task evaluation attempt in Progress & Score Engine
      try {
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
        console.warn('Error recording custom progress attempt:', err);
      }
    } catch (err) {
      setEvalError(err.message || 'Failed to evaluate custom question.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="custom-question-panel" role="region" aria-label="Custom Question Workspace">
      {/* ── Header Bar ── */}
      <div className="custom-q__header">
        <div className="custom-q__header-left">
          <span className="custom-q__badge">
            <span aria-hidden="true">✏️</span> Custom Question
          </span>
          <span className="custom-q__mode-pill">Phase A10</span>
        </div>

        <div className="custom-q__header-right">
          {templates.length > 0 && (
            <select
              className="custom-q__template-select"
              onChange={(e) => handleSelectTemplate(e.target.value)}
              defaultValue=""
              aria-label="Load pre-made question template"
              title="Load pre-made question template"
            >
              <option value="" disabled>Load Starter Template…</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.title}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn btn--ghost custom-q__btn-toggle-edit"
            onClick={() => setIsEditing(!isEditing)}
            id="btn-toggle-edit-custom-q"
          >
            {isEditing ? '👁️ View Challenge' : '✏️ Edit Question'}
          </button>
        </div>
      </div>

      {/* ── Mode 1: Editor Form ── */}
      {isEditing ? (
        <div className="custom-q__edit-form">
          {validationError && (
            <div className="custom-q__alert custom-q__alert--error" role="alert">
              <span aria-hidden="true">⚠️</span> {validationError}
            </div>
          )}

          <div className="custom-q__form-group">
            <label htmlFor="custom-q-title" className="custom-q__form-label">
              Question Title *
            </label>
            <input
              id="custom-q-title"
              type="text"
              className="custom-q__input"
              value={question.title}
              onChange={(e) => setQuestion({ ...question, title: e.target.value })}
              placeholder="e.g. Right-Angled Star Triangle"
            />
          </div>

          <div className="custom-q__form-group">
            <label htmlFor="custom-q-desc" className="custom-q__form-label">
              Problem Description *
            </label>
            <textarea
              id="custom-q-desc"
              className="custom-q__textarea"
              rows={3}
              value={question.description}
              onChange={(e) => setQuestion({ ...question, description: e.target.value })}
              placeholder="Explain what the program should do, expected inputs, and format..."
            />
          </div>

          <div className="custom-q__form-group">
            <label htmlFor="custom-q-starter" className="custom-q__form-label">
              Starter Code Template (Optional)
            </label>
            <textarea
              id="custom-q-starter"
              className="custom-q__textarea custom-q__textarea--code"
              rows={2}
              value={question.starter_code || ''}
              onChange={(e) => setQuestion({ ...question, starter_code: e.target.value })}
              placeholder="# Starter code snippet..."
            />
          </div>

          {/* Test Cases Manager */}
          <div className="custom-q__tc-manager">
            <div className="custom-q__tc-header">
              <span className="custom-q__tc-title">
                Custom Test Cases ({question.test_cases.length})
              </span>
              <button
                type="button"
                className="btn btn--ghost custom-q__btn-add-tc"
                onClick={handleAddTestCase}
                id="btn-add-test-case"
              >
                + Add Test Case
              </button>
            </div>

            {question.test_cases.map((tc, idx) => (
              <div key={tc.id || idx} className="custom-q__tc-card">
                <div className="custom-q__tc-card-top">
                  <input
                    type="text"
                    className="custom-q__tc-desc-input"
                    value={tc.description}
                    onChange={(e) => handleUpdateTestCase(idx, 'description', e.target.value)}
                    placeholder={`Test Case ${idx + 1} Label`}
                  />
                  <select
                    className="custom-q__tc-mode-select"
                    value={tc.match_mode || 'trimmed'}
                    onChange={(e) => handleUpdateTestCase(idx, 'match_mode', e.target.value)}
                    title="Output comparison mode"
                  >
                    <option value="trimmed">Trimmed</option>
                    <option value="exact">Exact Match</option>
                    <option value="ignore_case">Ignore Case</option>
                    <option value="numeric_float">Float Tolerance</option>
                  </select>
                  <button
                    type="button"
                    className="custom-q__tc-btn-remove"
                    onClick={() => handleRemoveTestCase(idx)}
                    title="Delete test case"
                    aria-label="Delete test case"
                  >
                    🗑️
                  </button>
                </div>

                <div className="custom-q__tc-fields-grid">
                  <div>
                    <label className="custom-q__tc-field-label">Input (stdin):</label>
                    <textarea
                      className="custom-q__tc-field-textarea"
                      rows={2}
                      value={tc.stdin}
                      onChange={(e) => handleUpdateTestCase(idx, 'stdin', e.target.value)}
                      placeholder="(empty or sample input)"
                    />
                  </div>
                  <div>
                    <label className="custom-q__tc-field-label">Expected Output:</label>
                    <textarea
                      className="custom-q__tc-field-textarea"
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

          <div className="custom-q__form-actions">
            <button
              type="button"
              className="btn btn--primary custom-q__btn-save"
              onClick={handleSaveQuestion}
              id="btn-save-custom-q"
            >
              ✓ Save & Start Solving
            </button>
          </div>
        </div>
      ) : (
        /* ── Mode 2: Solving & Evaluation View ── */
        <div className="custom-q__view">
          {/* Challenge Description Card */}
          <div className="custom-q__desc-card">
            <h3 className="custom-q__desc-title">{question.title}</h3>
            <p className="custom-q__desc-text">{question.description}</p>

            <div className="custom-q__action-bar">
              <button
                type="button"
                className="btn btn--primary custom-q__btn-grade"
                onClick={handleEvaluateCustom}
                disabled={isEvaluating}
                id="btn-evaluate-custom-q"
              >
                <span aria-hidden="true">{isEvaluating ? '⏳' : '🎯'}</span>
                {isEvaluating ? 'Grading Tests…' : 'Grade Against Custom Tests'}
              </button>

              <span className="custom-q__tc-count-badge">
                {question.test_cases.length} test case{question.test_cases.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Evaluation Error */}
          {evalError && (
            <div className="custom-q__alert custom-q__alert--error">
              <span aria-hidden="true">⚠️</span> {evalError}
            </div>
          )}

          {/* Evaluation Results Breakdown */}
          {evaluationResult && (
            <div className="custom-q__results-card" aria-live="polite">
              <div className="custom-q__results-header">
                <div className="custom-q__results-score">
                  <span className={`custom-q__score-pill ${evaluationResult.passed_all ? 'custom-q__score-pill--passed' : 'custom-q__score-pill--failed'}`}>
                    {evaluationResult.passed_all ? '✓ 100% Passed' : `${evaluationResult.passed_tests}/${evaluationResult.total_tests} Passed`}
                  </span>
                  <span className="custom-q__timing-pill">
                    {evaluationResult.total_execution_time_ms} ms
                  </span>
                </div>
                <p className="custom-q__summary-msg">{evaluationResult.summary_message}</p>
              </div>

              {/* Test Case Breakdown */}
              <div className="custom-q__results-list">
                {evaluationResult.test_results?.map((tr, idx) => {
                  const isExpanded = expandedTc === tr.test_case_id;
                  return (
                    <div key={tr.test_case_id || idx} className="custom-q__res-item">
                      <button
                        type="button"
                        className="custom-q__res-btn"
                        onClick={() => toggleAccordion(tr.test_case_id)}
                      >
                        <span className={`custom-q__status-icon ${tr.passed ? 'custom-q__status-icon--passed' : 'custom-q__status-icon--failed'}`}>
                          {tr.passed ? '✓' : '✗'}
                        </span>
                        <span className="custom-q__res-desc">{tr.description}</span>
                        <span className="custom-q__res-chevron">{isExpanded ? '▲' : '▼'}</span>
                      </button>

                      {isExpanded && (
                        <div className="custom-q__res-details">
                          {/* Diagnostic Card if crash occurred */}
                          {tr.diagnostic && tr.diagnostic.has_diagnostic && (
                            <DiagnosticCard
                              diagnostic={tr.diagnostic}
                              code={code}
                              executionResult={tr}
                            />
                          )}

                          {/* Expected vs Actual Diff Grid */}
                          <div className="custom-q__diff-grid">
                            {tr.stdin && (
                              <div className="custom-q__diff-box">
                                <span className="custom-q__diff-label">Input (stdin):</span>
                                <pre className="custom-q__diff-code"><code>{tr.stdin}</code></pre>
                              </div>
                            )}
                            <div className="custom-q__diff-box">
                              <span className="custom-q__diff-label">Expected Output:</span>
                              <pre className="custom-q__diff-code custom-q__diff-code--expected">
                                <code>{tr.expected_output || '[empty]'}</code>
                              </pre>
                            </div>
                            <div className="custom-q__diff-box">
                              <span className="custom-q__diff-label">Actual Output:</span>
                              <pre className="custom-q__diff-code custom-q__diff-code--actual">
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
          )}

          {/* Integrated Socratic AI Tutor grounded in the student's custom problem */}
          <div className="custom-q__tutor-wrapper">
            <AITutorPanel
              code={code}
              activeTask={question}
              evaluationResult={evaluationResult}
              diagnostic={evaluationResult?.test_results?.find(t => t.diagnostic)?.diagnostic}
            />
          </div>
        </div>
      )}
    </div>
  );
}
