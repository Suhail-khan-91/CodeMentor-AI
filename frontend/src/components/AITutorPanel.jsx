/**
 * AITutorPanel.jsx — Phase A7: AI Tutor Engine Component.
 *
 * Provides contextual Socratic tutoring when deterministic rules (A6)
 * are insufficient or when the student explicitly asks a question.
 *
 * Strictly adheres to pedagogical safeguards:
 * - Guides through mental models and reflective questions.
 * - NEVER emits complete copy-paste solutions.
 */

import { useState } from 'react';
import { askAITutor } from '../services/api';
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
  const [apiError, setApiError] = useState(null);

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setApiError(null);
    setIsOpen(true);

    try {
      const response = await askAITutor({
        code,
        taskId: activeTask?.id || null,
        task: activeTask || null,
        question: question.trim() || undefined,
        diagnostic,
        evaluationResult,
        executionDetails,
      });

      setTutorData(response);
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
      handleAsk();
    }
  };

  return (
    <section className="ai-tutor-container" aria-label="AI Tutor Guidance">
      {/* Header bar */}
      <div className="ai-tutor__header">
        <div className="ai-tutor__header-left">
          <span className="ai-tutor__title">
            🤖 AI Tutor
          </span>
          <span className="ai-tutor__badge">
            {tutorData ? `${tutorData.provider} Socratic` : 'Pedagogical Assistant'}
          </span>
        </div>

        <div className="ai-tutor__header-right">
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '3px 8px', fontSize: '0.78rem' }}
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI Provider"
            id="btn-tutor-config"
          >
            ⚙️
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '3px 10px', fontSize: '0.78rem' }}
            onClick={handleToggle}
            aria-expanded={isOpen}
          >
            {isOpen ? 'Close AI Tutor ▴' : 'Ask AI Tutor ▾'}
          </button>
        </div>
      </div>

      {/* Expanded Tutor Workspace */}
      {isOpen && (
        <>
          {/* Question / Inquiry Bar */}
          <form className="ai-tutor__query-bar" onSubmit={handleAsk}>
            <input
              type="text"
              className="ai-tutor__input"
              placeholder="Ask a question about your code or why a test case failed…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ai-tutor__btn-ask"
              disabled={isLoading}
              id="btn-ask-ai-tutor"
            >
              {isLoading ? 'Thinking…' : 'Ask Tutor'}
            </button>
          </form>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="ai-tutor__loading" role="status">
              <div className="ai-tutor__pulse-dot" aria-hidden="true" />
              <span>Analyzing code context and preparing Socratic guidance…</span>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && apiError && (
            <div className="ai-tutor__body">
              <div className="hint-mistake-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                <span className="hint-mistake-banner__icon">⚠️</span>
                <div className="hint-mistake-banner__text">
                  <strong>Notice:</strong> {apiError}
                </div>
              </div>
            </div>
          )}

          {/* Tutor Guidance Body */}
          {!isLoading && tutorData && (
            <div className="ai-tutor__body">
              {/* Socratic narrative */}
              <div className="ai-tutor__socratic-box">
                <div className="ai-tutor__socratic-title">
                  Reflective Guidance
                </div>
                <p className="ai-tutor__socratic-text">
                  {tutorData.socratic_guidance}
                </p>
              </div>

              {/* Sub-tier hints */}
              <div className="ai-tutor__tier-grid">
                {tutorData.conceptual_nudge && (
                  <div className="ai-tutor__tier-card">
                    <span className="ai-tutor__tier-badge ai-tutor__tier-badge--nudge">
                      🌱 Conceptual Nudge
                    </span>
                    <p className="ai-tutor__tier-text">
                      {tutorData.conceptual_nudge}
                    </p>
                  </div>
                )}

                {tutorData.strategy && (
                  <div className="ai-tutor__tier-card">
                    <span className="ai-tutor__tier-badge ai-tutor__tier-badge--strategy">
                      🧭 Strategy
                    </span>
                    <p className="ai-tutor__tier-text">
                      {tutorData.strategy}
                    </p>
                  </div>
                )}
              </div>

              {/* Structural clue code skeleton */}
              {tutorData.structural_clue && (
                <div className="ai-tutor__clue-box">
                  <div className="ai-tutor__clue-title">
                    🧩 Structural Clue (Skeleton Pattern)
                  </div>
                  <pre className="ai-tutor__clue-code">
                    <code>{tutorData.structural_clue}</code>
                  </pre>
                </div>
              )}

              {/* Suggested actions chips */}
              {tutorData.suggested_actions?.length > 0 && (
                <div className="ai-tutor__actions-row">
                  <span className="ai-tutor__actions-label">Next Steps:</span>
                  {tutorData.suggested_actions.map((act, i) => (
                    <span key={i} className="ai-tutor__action-tag">
                      {act}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Safeguard footer */}
          <div className="ai-tutor__safeguard-footer">
            <span>🛡️ Anti-Spoiler Guarantee: We guide your reasoning without writing complete solutions.</span>
            <span>Phase A8 Live</span>
          </div>
        </>
      )}

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(cfg) => {
          if (tutorData) {
            setTutorData(prev => ({ ...prev, provider: cfg.provider }));
          }
        }}
      />
    </section>
  );
}
