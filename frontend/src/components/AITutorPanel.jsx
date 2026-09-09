/**
 * AITutorPanel.jsx — Phase A7: Socratic AI Tutor Component (Upgraded)
 *
 * Conversational Socratic AI mentor that guides reasoning without ever
 * providing full copy-paste answers.
 *
 * Features:
 * - Conversational student / AI speech bubbles
 * - Interactive quick-prompt chips (e.g. 'Trace variables', 'Check loop condition')
 * - Sub-tier conceptual and strategy breakdowns
 * - Structural code skeletons
 * - Settings configuration trigger
 * - Help counter event tracking
 */

import { useState } from 'react';
import { askAITutor, recordHelpEvent } from '../services/api';
import AISettingsModal from './AISettingsModal';
import './AITutorPanel.css';

export default function AITutorPanel({
  code,
  activeTask = null,
  evaluationResult = null,
  diagnostic = null,
  executionDetails = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorData, setTutorData] = useState(null);
  const [lastUserQuestion, setLastUserQuestion] = useState('');
  const [apiError, setApiError] = useState(null);

  const handleAsk = async (e, forcedQuestion = null) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const queryText = (forcedQuestion !== null ? forcedQuestion : question).trim();
    setIsLoading(true);
    setApiError(null);
    setIsOpen(true);
    if (queryText) setLastUserQuestion(queryText);

    try {
      const response = await askAITutor({
        code,
        taskId: activeTask?.id || null,
        task: activeTask || null,
        question: queryText || undefined,
        diagnostic,
        evaluationResult,
        executionDetails,
      });

      setTutorData(response);
      setQuestion('');

      // Phase A11: Track AI Tutor inquiry assistance event
      if (response && response.success !== false) {
        recordHelpEvent('ai_tutor_ask', {
          task_id: activeTask?.id || null,
          task_title: activeTask?.title || 'Custom/Free Code',
          question: queryText || undefined,
        })
          .then(() => {
            window.dispatchEvent(new CustomEvent('help-counter-updated'));
          })
          .catch((err) => {
            console.warn('Failed to record tutor assistance event:', err);
          });
      }
    } catch (err) {
      setApiError(err.message || 'Failed to reach AI Tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !tutorData && !isLoading) {
      handleAsk(null, 'Help me think through this step');
    }
  };

  return (
    <section className="ai-tutor-shell" aria-label="AI Tutor Guidance">
      {/* Header bar */}
      <div className="tutor-header">
        <div className="tutor-header__title-group">
          <div className="tutor-avatar" aria-hidden="true">✦</div>
          <div>
            <h4 className="tutor-name">AI Tutor</h4>
            <div className="tutor-status-pill">
              <span className="tutor-dot" aria-hidden="true" />
              <span>{tutorData ? `${tutorData.provider} Socratic` : 'Active'}</span>
            </div>
          </div>
        </div>

        <div className="tutor-header__actions">
          <button
            type="button"
            className="btn btn--ghost btn-icon btn-sm"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI Provider"
            id="btn-tutor-config"
          >
            ⚙️
          </button>
          <button
            type="button"
            className="btn btn--ghost btn-sm tutor-toggle-btn"
            onClick={handleToggle}
            aria-expanded={isOpen}
          >
            {isOpen ? 'Close ▴' : 'Ask Tutor ▾'}
          </button>
        </div>
      </div>

      {/* Expanded Workspace */}
      {isOpen && (
        <div className="tutor-workspace">
          {/* Conversational Stream */}
          <div className="tutor-chat-stream">
            {/* User message if one was asked */}
            {lastUserQuestion && (
              <div className="chat-bubble chat-bubble--student">
                <span className="bubble-author">You</span>
                <p className="bubble-text">{lastUserQuestion}</p>
              </div>
            )}

            {/* AI Response Card */}
            {tutorData && !isLoading && (
              <div className="chat-bubble chat-bubble--ai">
                <span className="bubble-author bubble-author--ai">AI Tutor</span>
                <p className="bubble-text bubble-text--socratic">
                  {tutorData.socratic_guidance}
                </p>

                {/* Sub-tier hints */}
                {(tutorData.conceptual_nudge || tutorData.strategy) && (
                  <div className="tutor-sub-grid">
                    {tutorData.conceptual_nudge && (
                      <div className="tutor-mini-card tutor-mini-card--nudge">
                        <span className="tutor-mini-badge">🌱 Conceptual Nudge</span>
                        <p className="tutor-mini-text">{tutorData.conceptual_nudge}</p>
                      </div>
                    )}
                    {tutorData.strategy && (
                      <div className="tutor-mini-card tutor-mini-card--strategy">
                        <span className="tutor-mini-badge">🧭 Strategy Direction</span>
                        <p className="tutor-mini-text">{tutorData.strategy}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Structural Clue Skeleton */}
                {tutorData.structural_clue && (
                  <div className="tutor-clue-box">
                    <span className="tutor-mini-badge">🧩 Structural Pattern</span>
                    <pre className="tutor-clue-code"><code>{tutorData.structural_clue}</code></pre>
                  </div>
                )}
              </div>
            )}

            {/* Suggested quick chips */}
            {tutorData?.suggested_actions?.length > 0 && (
              <div className="tutor-chips-row">
                <span className="tutor-chips-label">Next Ideas:</span>
                {tutorData.suggested_actions.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="tutor-chip"
                    onClick={() => handleAsk(null, chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Loading animation */}
            {isLoading && (
              <div className="tutor-loading-state" role="status">
                <div className="tutor-typing-dots" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <span>Reasoning through your code…</span>
              </div>
            )}

            {/* Error banner */}
            {!isLoading && apiError && (
              <div className="tutor-error-banner" role="alert">
                <span aria-hidden="true">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form className="tutor-input-form" onSubmit={(e) => handleAsk(e)}>
            <input
              type="text"
              className="input tutor-input-field"
              placeholder="Ask a question or explain what feels stuck…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn--accent btn-sm tutor-send-btn"
              disabled={isLoading || !question.trim()}
              id="btn-ask-ai-tutor"
            >
              {isLoading ? 'Thinking…' : 'Send'}
            </button>
          </form>

          {/* Anti-spoiler guarantee footer */}
          <div className="tutor-guarantee-footer">
            <span>🛡️ Anti-Spoiler Guarantee: Reasoning guidance without solution leakage.</span>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(cfg) => {
          if (tutorData) {
            setTutorData((prev) => ({ ...prev, provider: cfg.provider }));
          }
        }}
      />
    </section>
  );
}
