/**
 * DiagnosticCard.jsx — Educational Code Diagnostic Component (Phase A4 & A9).
 *
 * Displays deterministic, beginner-friendly explanations and actionable hints (A4),
 * and provides on-demand, deep-dive AI error explanations (A9).
 */

import { useState } from 'react';
import { explainErrorWithAI } from '../services/api';
import './DiagnosticCard.css';

export default function DiagnosticCard({
  diagnostic,
  code = '',
  executionResult = null,
  onClose
}) {
  if (!diagnostic || !diagnostic.has_diagnostic) {
    return null;
  }

  const {
    title,
    friendly_explanation,
    hint,
    line_number,
    code_snippet,
    category,
    error_type
  } = diagnostic;

  // AI Error Explanation State (Phase A9)
  const [showAISection, setShowAISection] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Category visual badge configuration
  const getCategoryBadge = () => {
    switch (category) {
      case 'syntax':
        return { label: 'Syntax Diagnostic', icon: '🔍', className: 'diagnostic-badge--syntax' };
      case 'indentation':
        return { label: 'Indentation Error', icon: '📐', className: 'diagnostic-badge--indentation' };
      case 'timeout':
        return { label: 'Timeout Alert', icon: '⏱', className: 'diagnostic-badge--timeout' };
      case 'runtime':
      default:
        return { label: 'Runtime Diagnostic', icon: '💡', className: 'diagnostic-badge--runtime' };
    }
  };

  const categoryBadge = getCategoryBadge();

  // On-demand AI Error Explanation fetcher (Phase A9)
  const handleToggleAIExplanation = async () => {
    if (showAISection && aiExplanation) {
      setShowAISection(false);
      return;
    }

    setShowAISection(true);

    // If already loaded successfully, don't re-fetch unless requested
    if (aiExplanation) {
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const payload = {
        code: code || code_snippet || '',
        error_type: error_type || executionResult?.error_type || 'Error',
        error_message: friendly_explanation || executionResult?.error_message || '',
        line_number: line_number || executionResult?.line_number || null,
        traceback: executionResult?.stderr || '',
        diagnostic: diagnostic
      };

      const response = await explainErrorWithAI(payload);
      if (response && response.headline) {
        setAiExplanation(response);
      } else {
        setAiError(response?.error_message || 'Could not generate explanation. Try again.');
      }
    } catch (err) {
      setAiError(err.message || 'Failed to connect to AI Error Explainer service.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <aside
      className={`diagnostic-card diagnostic-card--${category || 'runtime'}`}
      aria-label="Code diagnostic guidance"
      role="region"
    >
      {/* Header bar */}
      <div className="diagnostic-card__header">
        <div className="diagnostic-card__header-left">
          <span className={`diagnostic-badge ${categoryBadge.className}`}>
            <span aria-hidden="true">{categoryBadge.icon}</span>
            {categoryBadge.label}
          </span>
          {error_type && (
            <span className="diagnostic-card__error-type">
              {error_type}
            </span>
          )}
        </div>

        <div className="diagnostic-card__header-right">
          {line_number && (
            <span className="diagnostic-card__line-pill">
              Line {line_number}
            </span>
          )}
          {onClose && (
            <button
              type="button"
              className="diagnostic-card__btn-close"
              onClick={onClose}
              aria-label="Dismiss diagnostic"
              title="Dismiss diagnostic"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="diagnostic-card__body">
        <h3 className="diagnostic-card__title">
          {title}
        </h3>

        <p className="diagnostic-card__explanation">
          {friendly_explanation}
        </p>

        {/* Culprit code snippet */}
        {code_snippet && (
          <div className="diagnostic-card__snippet-wrapper">
            <div className="diagnostic-card__snippet-header">
              <span>{line_number ? `Line ${line_number}` : 'Problematic Line'}</span>
            </div>
            <pre className="diagnostic-card__snippet">
              <code>{code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Actionable Hint / Pro-tip box (Phase A4 Deterministic) */}
        {hint && (
          <div className="diagnostic-card__hint">
            <span className="diagnostic-card__hint-icon" aria-hidden="true">💡</span>
            <div className="diagnostic-card__hint-content">
              <strong className="diagnostic-card__hint-label">How to fix:</strong>
              <span className="diagnostic-card__hint-text">{hint}</span>
            </div>
          </div>
        )}

        {/* Phase A9: On-Demand AI Error Explanation Trigger */}
        <div className="diagnostic-card__ai-trigger-bar">
          <button
            type="button"
            className="diagnostic-card__btn-ai-explain"
            onClick={handleToggleAIExplanation}
            disabled={isLoadingAI}
            id="btn-explain-error-ai"
          >
            <span className="diagnostic-card__btn-ai-icon" aria-hidden="true">
              {isLoadingAI ? '⏳' : '🤖'}
            </span>
            <span className="diagnostic-card__btn-ai-text">
              {isLoadingAI
                ? 'Analyzing Error with AI...'
                : showAISection
                ? 'Hide AI Deep Dive'
                : 'Explain Error with AI'}
            </span>
            <span className="diagnostic-card__btn-ai-tag">Phase A9</span>
          </button>
        </div>

        {/* Phase A9: AI Explanation Content Card */}
        {showAISection && (
          <div className="diagnostic-ai-container" aria-live="polite">
            {/* Loading state */}
            {isLoadingAI && (
              <div className="diagnostic-ai-loading">
                <div className="diagnostic-ai-spinner" aria-hidden="true" />
                <span>Deconstructing Python error with AI tutor...</span>
              </div>
            )}

            {/* Error state */}
            {!isLoadingAI && aiError && (
              <div className="diagnostic-ai-error">
                <span aria-hidden="true">⚠️</span>
                <div className="diagnostic-ai-error__body">
                  <strong>AI Explanation Unavailable</strong>
                  <p>{aiError}</p>
                </div>
                <button
                  type="button"
                  className="diagnostic-ai-retry-btn"
                  onClick={handleToggleAIExplanation}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Structured Explanation */}
            {!isLoadingAI && aiExplanation && (
              <div className="diagnostic-ai-card">
                <div className="diagnostic-ai-card__header">
                  <div className="diagnostic-ai-badge">
                    <span aria-hidden="true">🤖</span>
                    <span>AI Error Deep Dive</span>
                  </div>
                  <span className="diagnostic-ai-provider-tag">
                    {aiExplanation.provider} • {aiExplanation.model}
                  </span>
                </div>

                {/* Headline summary */}
                <div className="diagnostic-ai-headline">
                  {aiExplanation.headline}
                </div>

                {/* Structured 3-block pedagogical breakdown */}
                <div className="diagnostic-ai-grid">
                  {/* Block 1: What it means */}
                  <div className="diagnostic-ai-block">
                    <div className="diagnostic-ai-block__title">
                      <span aria-hidden="true">📖</span> What This Error Means
                    </div>
                    <p className="diagnostic-ai-block__text">
                      {aiExplanation.what_it_means}
                    </p>
                  </div>

                  {/* Block 2: Why it happened */}
                  <div className="diagnostic-ai-block">
                    <div className="diagnostic-ai-block__title">
                      <span aria-hidden="true">🔍</span> Why It Happened In Your Code
                    </div>
                    <p className="diagnostic-ai-block__text">
                      {aiExplanation.why_it_happened}
                    </p>
                  </div>

                  {/* Block 3: How to think about fixing it */}
                  <div className="diagnostic-ai-block diagnostic-ai-block--strategy">
                    <div className="diagnostic-ai-block__title">
                      <span aria-hidden="true">💡</span> Mental Model & How to Fix
                    </div>
                    <p className="diagnostic-ai-block__text">
                      {aiExplanation.how_to_think_about_it}
                    </p>
                  </div>
                </div>

                {/* Concepts to Review */}
                {aiExplanation.concepts_to_review && aiExplanation.concepts_to_review.length > 0 && (
                  <div className="diagnostic-ai-concepts">
                    <span className="diagnostic-ai-concepts__label">Concepts to Review:</span>
                    <div className="diagnostic-ai-chips">
                      {aiExplanation.concepts_to_review.map((concept, idx) => (
                        <span key={idx} className="diagnostic-ai-chip">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anti-solution policy badge */}
                <div className="diagnostic-ai-footer">
                  <span aria-hidden="true">🛡️</span>
                  <span>CodeMentor AI builds your understanding without spoiling the answer.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
