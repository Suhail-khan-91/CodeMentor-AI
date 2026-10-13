/**
 * CustomQuestionPanel.jsx — Streamlined Custom Practice Workspace
 *
 * Implements a clean, intuitive, beginner-friendly learning model:
 * 1. Left Monaco Editor: Code input & execution.
 * 2. Right Workspace:
 *    - In-place editable question card (Title + Prompt) — no rigid modal authoring!
 *    - Quick beginner inspiration chips (Star Triangle, Even/Odd, Reverse, Vowels, Free Sandbox).
 *    - True AI Evaluation: Evaluates code against question prompt via AI (OpenRouter, Ollama, or Socratic Mock).
 *    - Free Sandbox Mode: Clear question to code freely; AI provides general code quality review.
 *    - Integrated Socratic AI Tutor tab with prompt pills and provider settings.
 */

import { useState, useEffect } from 'react';
import AITutorPanel from './AITutorPanel';
import AISettingsModal from './AISettingsModal';
import { evaluateCustomWithAI, recordProgressAttempt, getAIConfig } from '../services/api';
import './TaskEvaluationPanel.css';
import './CustomQuestionPanel.css';

const QUICK_PROMPTS = [
  {
    id: 'star_triangle',
    label: '⭐ Star Triangle',
    title: 'Right-Angled Star Triangle',
    prompt: 'Write a program that takes an integer N (e.g. 5) and prints a right-angled triangle of asterisks (*) where row i has i stars.',
    starterCode: '# Right-Angled Star Triangle\nn = 5\nfor i in range(1, n + 1):\n    print("*" * i)\n'
  },
  {
    id: 'even_odd',
    label: '🔢 Even or Odd',
    title: 'Even or Odd Number Checker',
    prompt: 'Write a program that takes an integer number and checks if it is even or odd. Print "Even" if divisible by 2, otherwise print "Odd".',
    starterCode: '# Even or Odd Checker\nnum = 7\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n'
  },
  {
    id: 'reverse_string',
    label: '🔄 Reverse String',
    title: 'Reverse a String or Sentence',
    prompt: 'Write a program that takes a string and prints it in reverse order.',
    starterCode: '# Reverse String\ntext = "CodeMentor"\nreversed_text = text[::-1]\nprint(reversed_text)\n'
  },
  {
    id: 'count_vowels',
    label: '🔠 Count Vowels',
    title: 'Count Vowels in a String',
    prompt: 'Write a program that takes a string and counts how many vowels (a, e, i, o, u) it contains.',
    starterCode: '# Count Vowels\ntext = "Hello Python World"\nvowels = "aeiouAEIOU"\ncount = sum(1 for char in text if char in vowels)\nprint(f"Total vowels: {count}")\n'
  },
  {
    id: 'free_sandbox',
    label: '🧹 Free Sandbox',
    title: '',
    prompt: '',
    starterCode: '# Free Sandbox Mode\n# Write any Python code here and run it or ask AI to review it!\n\ndef main():\n    print("Hello from CodeMentor AI!")\n\nif __name__ == "__main__":\n    main()\n'
  }
];

export default function CustomQuestionPanel({
  code,
  executionResult = null,
  onApplyStarterCode,
}) {
  const [questionPrompt, setQuestionPrompt] = useState(QUICK_PROMPTS[0].prompt);
  const [selectedPromptId, setSelectedPromptId] = useState('star_triangle');

  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'tutor'
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evalError, setEvalError] = useState(null);

  const [activeProvider, setActiveProvider] = useState('AI Ready');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchProviderConfig = () => {
    getAIConfig()
      .then((res) => {
        if (res?.config?.provider) {
          const p = res.config.provider;
          if (p === 'cloud') {
            const cp = res.config?.cloud?.provider_name;
            setActiveProvider(cp === 'openrouter' ? 'OpenRouter' : 'Cloud AI');
          } else if (p === 'ollama') {
            setActiveProvider('Ollama');
          } else {
            setActiveProvider('Mock AI');
          }
        }
      })
      .catch(() => setActiveProvider('Mock AI'));
  };

  useEffect(() => {
    fetchProviderConfig();
    const handleConfigUpdate = () => fetchProviderConfig();
    window.addEventListener('ai-config-updated', handleConfigUpdate);
    return () => window.removeEventListener('ai-config-updated', handleConfigUpdate);
  }, []);

  // Sync initial starter code on first mount if starter code matches default
  useEffect(() => {
    if (onApplyStarterCode && selectedPromptId === 'star_triangle') {
      onApplyStarterCode(QUICK_PROMPTS[0].starterCode);
    }
  }, []);

  const handleSelectQuickPrompt = (item) => {
    setQuestionPrompt(item.prompt);
    setSelectedPromptId(item.id);
    setEvaluationResult(null);
    setEvalError(null);

    if (onApplyStarterCode && item.starterCode) {
      onApplyStarterCode(item.starterCode);
    }
  };

  const handleEvaluateAI = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await evaluateCustomWithAI({
        code,
        question_prompt: questionPrompt,
        execution_result: executionResult
      });

      setEvaluationResult(res);

      // Record telemetry in background
      recordProgressAttempt({
        taskId: selectedPromptId ? `custom_${selectedPromptId}` : 'custom_user_prompt',
        taskTitle: questionPrompt ? questionPrompt.slice(0, 35) + '…' : 'Custom Practice',
        category: 'custom',
        scorePercentage: res.score || 0,
        passedAll: res.verdict === 'correct' || res.verdict === 'clean_code',
        passedTests: res.verdict === 'correct' ? 1 : 0,
        totalTests: 1,
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent('progress-updated'));
        })
        .catch(() => {});
    } catch (err) {
      setEvalError(err.message || 'Failed to evaluate custom solution with AI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const hasPrompt = !!questionPrompt.trim();

  return (
    <div className="custom-q-shell" role="region" aria-label="Custom Practice Workspace">
      {/* ── Top Header Bar ── */}
      <div className="custom-q-header">
        <div className="custom-q-header__left">
          <span className="badge badge--blue">
            <span>✏️</span> Custom Practice
          </span>
        </div>

        <div className="custom-q-header__right">
          <button
            type="button"
            className="custom-status-indicator custom-status-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI Provider & Settings"
            id="btn-custom-ai-settings"
          >
            <span className="custom-status-dot" />
            <span>{activeProvider}</span>
            <span style={{ fontSize: '0.70rem', opacity: 0.85, marginLeft: '2px' }}>⚙️</span>
          </button>
        </div>
      </div>

      {/* ── Quick Starter Inspiration Chips ── */}
      <div className="custom-chips-bar" aria-label="Quick challenge inspiration chips">
        <span className="custom-chips-label">Quick Starters:</span>
        <div className="custom-chips-list">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`custom-chip ${selectedPromptId === item.id ? 'custom-chip--active' : ''}`}
              onClick={() => handleSelectQuickPrompt(item)}
              title={item.title || 'Clear to Free Sandbox'}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Navigation Tabs ── */}
      <div className="task-scoped-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'review'}
          className={`task-tab ${activeTab === 'review' ? 'task-tab--active' : ''}`}
          style={activeTab === 'review' ? { color: 'var(--blue)', borderBottomColor: 'var(--blue)' } : {}}
          onClick={() => setActiveTab('review')}
        >
          Question & AI Evaluation
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tutor'}
          className={`task-tab ${activeTab === 'tutor' ? 'task-tab--active' : ''}`}
          style={activeTab === 'tutor' ? { color: 'var(--blue)', borderBottomColor: 'var(--blue)' } : {}}
          onClick={() => setActiveTab('tutor')}
        >
          AI Socratic Tutor
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="custom-tab-container">
        {activeTab === 'review' ? (
          <div className="custom-review-pane">
            {/* Direct In-Place Editable Question Card */}
            <div className="custom-editable-card">
              <div className="custom-field-row">
                <div className="custom-prompt-label-group">
                  <label htmlFor="custom-q-prompt" className="custom-field-label">
                    Question Requirements / Problem Prompt
                  </label>
                  <span className="custom-prompt-hint">
                    {hasPrompt ? 'AI evaluates code against this prompt' : 'Empty = Free Sandbox Mode'}
                  </span>
                </div>
                <textarea
                  id="custom-q-prompt"
                  className="textarea custom-prompt-textarea"
                  rows={5}
                  value={questionPrompt}
                  onChange={(e) => {
                    setQuestionPrompt(e.target.value);
                    setSelectedPromptId(null);
                  }}
                  placeholder="Type or paste your Python coding question, assignment instructions, or interview challenge here... (Leave empty for Free Sandbox)"
                />
              </div>
            </div>

            {/* AI Evaluation Action Button */}
            <div className="custom-eval-action-bar">
              <button
                type="button"
                className="btn btn--accent custom-eval-btn"
                onClick={handleEvaluateAI}
                disabled={isEvaluating}
                id="btn-evaluate-custom-ai"
              >
                <span>{isEvaluating ? '⏳' : hasPrompt ? '🤖' : '✨'}</span>
                <span>
                  {isEvaluating
                    ? hasPrompt
                      ? 'Evaluating Solution with AI…'
                      : 'Reviewing Code with AI…'
                    : hasPrompt
                    ? 'Evaluate Solution with AI'
                    : 'Review Code with AI'}
                </span>
              </button>
            </div>

            {/* Error Message if API fails */}
            {evalError && (
              <div className="custom-alert custom-alert--error" role="alert">
                <span>⚠️</span> {evalError}
              </div>
            )}

            {/* AI Evaluation Results Card */}
            {evaluationResult && (
              <div className="custom-ai-result-card" role="region" aria-label="AI Evaluation Verdict">
                <div className="custom-ai-result-header">
                  <div className="custom-ai-result-verdict-group">
                    <span
                      className={`custom-verdict-pill custom-verdict-pill--${evaluationResult.verdict}`}
                    >
                      {evaluationResult.verdict === 'correct' && '✓ Solved / Correct Logic'}
                      {evaluationResult.verdict === 'clean_code' && '✓ Clean Sandbox Execution'}
                      {evaluationResult.verdict === 'needs_work' && '⚠️ Needs Refinement'}
                      {evaluationResult.verdict === 'runtime_error' && '❌ Runtime Error'}
                      {evaluationResult.verdict === 'syntax_error' && '❌ Syntax Error'}
                      {!['correct', 'clean_code', 'needs_work', 'runtime_error', 'syntax_error'].includes(
                        evaluationResult.verdict
                      ) && `Status: ${evaluationResult.verdict}`}
                    </span>

                    <span className="custom-score-badge">
                      {evaluationResult.score}% Score
                    </span>
                  </div>

                  <span className="custom-provider-tag">
                    Evaluated by {evaluationResult.provider || 'AI Engine'}
                  </span>
                </div>

                {/* Summary Text */}
                {evaluationResult.summary && (
                  <p className="custom-ai-summary">
                    {evaluationResult.summary}
                  </p>
                )}

                {/* Feedback Bullet Points */}
                {evaluationResult.feedback_points?.length > 0 && (
                  <div className="custom-feedback-section">
                    <span className="custom-section-title">Key Feedback Points:</span>
                    <ul className="custom-feedback-list">
                      {evaluationResult.feedback_points.map((point, idx) => (
                        <li key={idx} className="custom-feedback-item">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Edge Case Tip Box */}
                {evaluationResult.edge_case_note && (
                  <div className="custom-edge-tip">
                    <span className="custom-edge-tip__icon">💡</span>
                    <div className="custom-edge-tip__content">
                      <strong>Edge Case Tip:</strong> {evaluationResult.edge_case_note}
                    </div>
                  </div>
                )}

                {/* Concepts Applied */}
                {evaluationResult.concepts_applied?.length > 0 && (
                  <div className="custom-concepts-row">
                    <span className="custom-concepts-label">Concepts:</span>
                    {evaluationResult.concepts_applied.map((concept, idx) => (
                      <span key={idx} className="custom-concept-tag">
                        {concept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="custom-tutor-pane">
            <AITutorPanel
              code={code}
              activeTask={{
                id: selectedPromptId || 'custom_task',
                title: questionPrompt ? 'Custom Challenge' : 'Freeform Sandbox',
                description: questionPrompt || 'Freeform Python Sandbox'
              }}
              evaluationResult={evaluationResult}
              diagnostic={executionResult?.diagnostic}
            />
          </div>
        )}
      </div>

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={fetchProviderConfig}
      />
    </div>
  );
}
