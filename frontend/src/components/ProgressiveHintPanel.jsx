/**
 * ProgressiveHintPanel.jsx — Phase A6: Rule-Based Progressive Hint Engine (Upgraded)
 *
 * Implements strict sequential hint revealing starting from Level 0:
 *   Level 0: Locked
 *   Level 1: Conceptual Nudge (mental model, zero syntax)
 *   Level 2: Strategy / Approach (algorithmic direction)
 *   Level 3: Structural Clue (skeleton pattern)
 *
 * Fully deterministic. Dispatches 'help-counter-updated' on reveal.
 */

import { useState, useEffect } from 'react';
import { recordHelpEvent } from '../services/api';
import './ProgressiveHintPanel.css';

export default function ProgressiveHintPanel({ hintsData, taskTitle }) {
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
        return '💡 Reveal Level 1: Conceptual Nudge';
      case 1:
        return '🔓 Unlock Level 2: Strategy & Approach';
      case 2:
        return '🔓 Unlock Level 3: Structural Clue';
      default:
        return 'All 3 Hints Unlocked';
    }
  };

  return (
    <div className="hint-panel-shell" aria-label="Progressive Hint System">
      {/* Connected Line & Dot Progress Bar */}
      <div className="hint-progress-bar">
        <div className="hint-progress-nodes">
          <div className={`hp-dot ${unlockedLevel >= 1 ? 'hp-dot--done' : ''}`}>
            <span>1</span>
          </div>
          <div className={`hp-line ${unlockedLevel >= 2 ? 'hp-line--done' : ''}`} />
          <div className={`hp-dot ${unlockedLevel >= 2 ? 'hp-dot--done' : ''}`}>
            <span>2</span>
          </div>
          <div className={`hp-line ${unlockedLevel >= 3 ? 'hp-line--done' : ''}`} />
          <div className={`hp-dot ${unlockedLevel >= 3 ? 'hp-dot--done' : ''}`}>
            <span>3</span>
          </div>
        </div>

        <div className="hint-progress-meta">
          <span className="hint-progress-count">{unlockedLevel} of 3 Unlocked</span>
          <button
            type="button"
            className="hint-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Expand ▾' : 'Collapse ▴'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="hint-panel-body">
          {/* Mistake Pattern Alert if triggered */}
          {matched_mistake && (
            <div className="hint-mistake-alert" role="status">
              <span className="mistake-icon" aria-hidden="true">🎯</span>
              <div className="mistake-text">
                <strong>{rule_name || 'Pattern Detected'}:</strong> {matched_mistake}
              </div>
            </div>
          )}

          {/* Level 0 State: All Hints Locked */}
          {unlockedLevel === 0 && (
            <div className="hint-zero-card">
              <div className="hint-zero-icon" aria-hidden="true">🔒</div>
              <h4 className="hint-zero-title">Progressive Hints are Locked</h4>
              <p className="hint-zero-desc">
                Solve the challenge at your own pace. If you get stuck, reveal progressive hints tier by tier without spoiling the solution.
              </p>
            </div>
          )}

          {/* Level 1: Conceptual Nudge */}
          <div className={`tier-card ${unlockedLevel < 1 ? 'tier-card--locked' : 'tier-card--nudge'}`}>
            <div className="tier-card__header">
              <span className="tier-badge tier-badge--nudge">LEVEL 1 • CONCEPTUAL NUDGE</span>
              {unlockedLevel < 1 && <span className="tier-locked-tag">🔒 Locked</span>}
            </div>
            <h5 className="tier-card__title">Mental Model Orientation</h5>
            {unlockedLevel >= 1 ? (
              <p className="tier-card__body">{hints.level_1_nudge}</p>
            ) : (
              <p className="tier-card__body tier-card__body--placeholder">
                Conceptual direction will appear here once unlocked.
              </p>
            )}
          </div>

          {/* Level 2: Strategy & Approach */}
          <div className={`tier-card ${unlockedLevel < 2 ? 'tier-card--locked' : 'tier-card--strategy'}`}>
            <div className="tier-card__header">
              <span className="tier-badge tier-badge--strategy">LEVEL 2 • STRATEGY & APPROACH</span>
              {unlockedLevel < 2 && <span className="tier-locked-tag">🔒 Locked</span>}
            </div>
            <h5 className="tier-card__title">Algorithmic Direction</h5>
            {unlockedLevel >= 2 ? (
              <p className="tier-card__body">{hints.level_2_strategy}</p>
            ) : (
              <p className="tier-card__body tier-card__body--placeholder">
                Step-by-step logic strategy will appear here once unlocked.
              </p>
            )}
          </div>

          {/* Level 3: Structural Clue */}
          <div className={`tier-card ${unlockedLevel < 3 ? 'tier-card--locked' : 'tier-card--clue'}`}>
            <div className="tier-card__header">
              <span className="tier-badge tier-badge--clue">LEVEL 3 • STRUCTURAL CLUE</span>
              {unlockedLevel < 3 && <span className="tier-locked-tag">🔒 Locked</span>}
            </div>
            <h5 className="tier-card__title">Code Skeleton Pattern</h5>
            {unlockedLevel >= 3 ? (
              <>
                <p className="tier-card__body">Adapt this structural template to your solution:</p>
                <pre className="tier-code-block"><code>{hints.level_3_clue}</code></pre>
              </>
            ) : (
              <p className="tier-card__body tier-card__body--placeholder">
                Structural code pattern will appear here once unlocked.
              </p>
            )}
          </div>

          {/* Action Bar */}
          <div className="hint-actions-row">
            {unlockedLevel < 3 ? (
              <button
                type="button"
                className="btn btn--accent hint-reveal-btn"
                onClick={handleRevealNext}
                id="btn-reveal-hint"
              >
                {getButtonText()}
              </button>
            ) : (
              <span className="hint-complete-tag">
                ✓ All 3 hint levels unlocked
              </span>
            )}

            {unlockedLevel > 0 && (
              <button
                type="button"
                className="btn btn--ghost hint-reset-btn"
                onClick={handleReset}
                id="btn-reset-hints"
                title="Lock all hints and re-test yourself"
              >
                ↺ Lock Hints
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
