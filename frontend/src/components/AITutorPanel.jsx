/**
 * AITutorPanel.jsx — Unified Socratic AI Tutor Component
 *
 * Clean, professional, conversational AI mentorship interface used in both:
 * 1. Course Mode (CourseChallengePanel)
 * 2. Custom Practice Mode (CustomQuestionPanel)
 *
 * Features:
 * - Direct conversational chat stream with student and tutor bubbles
 * - Active AI provider badge (Offline Mock, OpenRouter, Ollama, OpenAI)
 * - Settings configuration button (⚙️) opening AISettingsModal
 * - One-click Socratic quick prompt chips
 * - Progressive conceptual hints & strategy guidance without answer leakage
 */

import { useState, useEffect, useRef } from 'react';
import { askAITutor, getAIConfig, recordHelpEvent } from '../services/api';
import AISettingsModal from './AISettingsModal';
import './AITutorPanel.css';

export default function AITutorPanel({
  code = '',
  activeTask = null,
  evaluationResult = null,
  diagnostic = null,
  executionDetails = null,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState('mock');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Chat conversation history
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I'm your Socratic AI Tutor. I help you build understanding step-by-step without giving away full solutions. Ask me about the problem requirements, your logic, or edge cases!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load current provider config
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
            setActiveProvider('Offline Mock');
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProviderConfig();
  }, []);

  const handleAsk = async (e, forcedQuestion = null) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const queryText = (forcedQuestion !== null ? forcedQuestion : question).trim();
    if (!queryText) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await askAITutor({
        code,
        taskId: activeTask?.id || null,
        task: activeTask || null,
        question: queryText,
        diagnostic,
        evaluationResult,
        executionDetails,
      });

      const aiMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: response.socratic_guidance || 'Consider breaking down the problem into smaller, verifiable steps.',
        nudge: response.conceptual_nudge,
        strategy: response.strategy,
        clue: response.structural_clue,
        suggestedActions: response.suggested_actions,
        provider: response.provider || activeProvider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Record help event
      if (response && response.success !== false) {
        recordHelpEvent('ai_tutor_ask', {
          task_id: activeTask?.id || null,
          task_title: activeTask?.title || 'Coding Practice',
          question: queryText,
        })
          .then(() => {
            window.dispatchEvent(new CustomEvent('help-counter-updated'));
          })
          .catch(() => {});
      }
    } catch (err) {
      setApiError(err.message || 'Failed to reach AI Tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="unified-tutor-container">
      {/* ── Tutor Header ── */}
      <div className="unified-tutor-header">
        <div className="unified-tutor-header__left">
          <span className="unified-tutor-avatar" aria-hidden="true">🤖</span>
          <div>
            <h4 className="unified-tutor-title">Socratic AI Tutor</h4>
            <div className="unified-tutor-provider-pill">
              <span className="unified-tutor-dot" />
              <span>{activeProvider}</span>
            </div>
          </div>
        </div>

        <div className="unified-tutor-header__right">
          <button
            type="button"
            className="unified-tutor-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI Provider & Settings"
            id="btn-open-tutor-settings"
          >
            <span aria-hidden="true">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ── Chat Messages Stream ── */}
      <div className="unified-tutor-stream">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`unified-msg unified-msg--${msg.role}`}
          >
            <div className="unified-msg__bubble">
              <div className="unified-msg__header">
                <span className="unified-msg__author">
                  {msg.role === 'user' ? 'You' : 'AI Tutor'}
                </span>
                <span className="unified-msg__time">{msg.timestamp}</span>
              </div>

              <div className="unified-msg__text">{msg.text}</div>

              {/* Sub-tier hints from tutor response */}
              {(msg.nudge || msg.strategy) && (
                <div className="unified-tutor-hints-grid">
                  {msg.nudge && (
                    <div className="unified-hint-card unified-hint-card--nudge">
                      <span className="unified-hint-badge">🌱 Conceptual Nudge</span>
                      <p className="unified-hint-text">{msg.nudge}</p>
                    </div>
                  )}
                  {msg.strategy && (
                    <div className="unified-hint-card unified-hint-card--strategy">
                      <span className="unified-hint-badge">🧭 Strategy Direction</span>
                      <p className="unified-hint-text">{msg.strategy}</p>
                    </div>
                  )}
                </div>
              )}

              {msg.clue && (
                <div className="unified-hint-card unified-hint-card--clue">
                  <span className="unified-hint-badge">🧩 Structural Pattern</span>
                  <pre className="unified-hint-code"><code>{msg.clue}</code></pre>
                </div>
              )}

              {/* Quick suggestion chips */}
              {msg.suggestedActions?.length > 0 && (
                <div className="unified-chips-row">
                  {msg.suggestedActions.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="unified-chip-btn"
                      onClick={() => handleAsk(null, chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="unified-msg unified-msg--assistant">
            <div className="unified-msg__bubble unified-msg__bubble--loading">
              <div className="unified-typing-indicator" aria-hidden="true">
                <span /><span /><span />
              </div>
              <span className="unified-loading-text">Analyzing your code & reasoning...</span>
            </div>
          </div>
        )}

        {apiError && (
          <div className="unified-alert-error" role="alert">
            <span>⚠️ {apiError}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Starter Chips ── */}
      <div className="unified-tutor-quick-chips">
        <button
          type="button"
          className="unified-quick-pill"
          onClick={() => handleAsk(null, 'Help me understand what this challenge requires.')}
          disabled={isLoading}
        >
          📋 Explain Requirements
        </button>
        <button
          type="button"
          className="unified-quick-pill"
          onClick={() => handleAsk(null, 'How should I structure the logic for this problem?')}
          disabled={isLoading}
        >
          💡 Logic Structure
        </button>
        <button
          type="button"
          className="unified-quick-pill"
          onClick={() => handleAsk(null, 'What edge cases should I test for in this code?')}
          disabled={isLoading}
        >
          🔍 Edge Cases
        </button>
      </div>

      {/* ── Bottom Input Bar ── */}
      <form className="unified-tutor-input-bar" onSubmit={(e) => handleAsk(e)}>
        <input
          type="text"
          className="unified-tutor-input"
          placeholder="Ask AI Tutor for guidance..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="unified-tutor-send-btn"
          disabled={isLoading || !question.trim()}
          title="Send message"
        >
          <span>Ask</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {/* Anti-spoiler policy note */}
      <div className="unified-tutor-footer-note">
        <span>🛡️ Socratic Mentorship: Guiding reasoning without solution leakage.</span>
      </div>

      {/* AI Provider Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          fetchProviderConfig();
        }}
      />
    </div>
  );
}
