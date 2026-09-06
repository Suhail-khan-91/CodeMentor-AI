/**
 * ProgressiveHintPanel.jsx — Phase A6: Rule-Based Hint System Component.
 *
 * Implements strict manual hint reveal starting from Level 0:
 *   Level 0: Locked (all 3 hints hidden)
 *   Level 1: Conceptual Nudge (mental model, zero syntax)
 *   Level 2: Strategy / Approach (algorithmic direction)
 *   Level 3: Structural Clue (skeleton pattern, never complete solution)
 *
 * Fully deterministic with zero external AI dependencies.
 * Compatible with future Phase A7 AI Tutor via standardized 3-tier schema.
 */

import { useState, useEffect } from 'react';
import { recordHelpEvent } from '../services/api';
import './ProgressiveHintPanel.css';

export default function ProgressiveHintPanel({ hintsData, taskTitle }) {
  // State: 0 (all locked) -> 1 (nudge) -> 2 (strategy) -> 3 (clue)
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Reset unlocked level whenever a new hint rule or task arrives
  useEffect(() => {
    setUnlockedLevel(0);
  }, [hintsData?.rule_id]);

  if (!hintsData || !hintsData.has_hints || !hintsData.hints) {
    return null;
  }

  const { hints, matched_mistake, rule_name, source } = hintsData;

  const handleRevealNext = () => {
    if (unlockedLevel < 3) {
      const nextLevel = unlockedLevel + 1;
      setUnlockedLevel(nextLevel);

      // Phase A11: Track hint reveal assistance event
      recordHelpEvent('hint_reveal', {
        level: nextLevel,
        rule_id: hintsData?.rule_id || null,
        task_title: taskTitle || null,
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent('help-counter-updated'));
        })
        .catch((err) => {
          console.warn('Failed to record hint assistance event:', err);
        });
    }
  };

  const handleReset = () => {
    setUnlockedLevel(0);
  };

  const getButtonText = () => {
    switch (unlockedLevel) {
      case 0:
        return '💡 Reveal Hint 1: Conceptual Nudge';
      case 1:
        return '🔓 Unlock Hint 2: Strategy & Approach';
      case 2:
        return '🔓 Unlock Hint 3: Structural Clue';
      default:
        return 'All Hints Unlocked';
    }
  };

  return (
    <div className="hint-panel-container" aria-label="Progressive Hint System">
      {/* Header */}
      <div className="hint-panel__header">
        <div className="hint-panel__header-left">
          <span className="hint-panel__title">
            💡 Step-by-Step Guidance
          </span>
          <span className="hint-panel__source-badge" title="Deterministic educational rules">
            {source === 'rule_based' ? 'Rule-Based Engine' : 'AI Tutor'}
          </span>
        </div>

        <div className="hint-panel__header-right">
          {/* 3-Step Progress Meter */}
          <div className="hint-step-meter" aria-label={`Step ${unlockedLevel} of 3 unlocked`}>
            <div
              className={`hint-step-pill ${unlockedLevel >= 1 ? 'hint-step-pill--active-1' : ''}`}
              title="Level 1: Conceptual Nudge"
            />
            <div
              className={`hint-step-pill ${unlockedLevel >= 2 ? 'hint-step-pill--active-2' : ''}`}
              title="Level 2: Strategy"
            />
            <div
              className={`hint-step-pill ${unlockedLevel >= 3 ? 'hint-step-pill--active-3' : ''}`}
              title="Level 3: Structural Clue"
            />
            <span className="hint-step-count">{unlockedLevel} / 3</span>
          </div>

          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '2px 8px', fontSize: '0.78rem' }}
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? 'Expand ▾' : 'Collapse ▴'}
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="hint-panel__body">
          {/* Notice Banner if a specific known mistake pattern was detected */}
          {matched_mistake && (
            <div className="hint-mistake-banner" role="status">
              <span className="hint-mistake-banner__icon" aria-hidden="true">🎯</span>
              <div className="hint-mistake-banner__text">
                <strong>{rule_name || 'Pattern Detected'}:</strong> {matched_mistake}
              </div>
            </div>
          )}

          {/* Level 0 State: All Hints Locked */}
          {unlockedLevel === 0 && (
            <div className="hint-locked-intro">
              <div className="hint-locked-intro__icon" aria-hidden="true">🔒</div>
              <div className="hint-locked-intro__title">Hints are Locked</div>
              <p className="hint-locked-intro__text">
                Work through the challenge at your own pace. If you get stuck, reveal progressive hints one tier at a time without spoiling the solution.
              </p>
            </div>
          )}

          {/* Level 1: Conceptual Nudge */}
          {unlockedLevel >= 1 && hints.level_1_nudge && (
            <div className="tiered-hint-card tiered-hint-card--nudge">
              <div className="tiered-hint-card__header">
                <span className="tiered-hint-card__badge">
                  🌱 Level 1: Conceptual Nudge
                </span>
              </div>
              <p className="tiered-hint-card__content">
                {hints.level_1_nudge}
              </p>
            </div>
          )}

          {/* Level 2: Strategy & Approach */}
          {unlockedLevel >= 2 && hints.level_2_strategy && (
            <div className="tiered-hint-card tiered-hint-card--strategy">
              <div className="tiered-hint-card__header">
                <span className="tiered-hint-card__badge">
                  🧭 Level 2: Strategy & Approach
                </span>
              </div>
              <p className="tiered-hint-card__content">
                {hints.level_2_strategy}
              </p>
            </div>
          )}

          {/* Level 3: Structural Clue */}
          {unlockedLevel >= 3 && hints.level_3_clue && (
            <div className="tiered-hint-card tiered-hint-card--clue">
              <div className="tiered-hint-card__header">
                <span className="tiered-hint-card__badge">
                  🧩 Level 3: Structural Clue
                </span>
              </div>
              <p className="tiered-hint-card__content">
                Review this structure pattern (adapt it to your code):
              </p>
              <pre className="tiered-hint-card__code">
                <code>{hints.level_3_clue}</code>
              </pre>
            </div>
          )}

          {/* Actions Toolbar */}
          <div className="hint-panel__actions">
            {unlockedLevel < 3 ? (
              <button
                type="button"
                className="hint-btn-reveal"
                onClick={handleRevealNext}
                id="btn-reveal-hint"
              >
                {getButtonText()}
              </button>
            ) : (
              <span className="hint-all-unlocked-tag">
                ✓ All 3 hint levels unlocked
              </span>
            )}

            {unlockedLevel > 0 && (
              <button
                type="button"
                className="hint-btn-reset"
                onClick={handleReset}
                title="Lock hints and test yourself again"
                id="btn-reset-hints"
              >
                ↺ Lock / Reset Hints
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
