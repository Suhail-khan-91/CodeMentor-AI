/**
 * HelpUsageWidget.jsx — Phase A11: Help / AI Usage Counter Component.
 *
 * Displays live, session-based assistance usage metrics across:
 * - Phase A6: Tiered hints (Level 1 Nudge, Level 2 Strategy, Level 3 Structure)
 * - Phase A7: AI Tutor queries
 * - Phase A9: AI Error Explanations
 *
 * Session-based / in-memory only:
 * - No score penalties or deductions (educational awareness only)
 * - No persistence or database tracking
 * - Real-time synchronization via custom event 'help-counter-updated'
 */

import { useState, useEffect, useRef } from 'react';
import { getHelpSummary, resetHelpCounter } from '../services/api';
import './HelpUsageWidget.css';

export default function HelpUsageWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [summary, setSummary] = useState({
    total_assists: 0,
    hints: {
      total: 0,
      level_1_nudge: 0,
      level_2_strategy: 0,
      level_3_structure: 0,
    },
    ai_tutor_queries: 0,
    ai_error_explanations: 0,
    total_events_logged: 0,
  });

  const popoverRef = useRef(null);

  const fetchSummary = async () => {
    try {
      const res = await getHelpSummary();
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('Failed to fetch help assistance summary:', err);
    }
  };

  // Fetch initial summary and listen for update events
  useEffect(() => {
    fetchSummary();

    const handleUpdate = () => {
      fetchSummary();
    };

    window.addEventListener('help-counter-updated', handleUpdate);
    return () => {
      window.removeEventListener('help-counter-updated', handleUpdate);
    };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const res = await resetHelpCounter();
      if (res?.summary) {
        setSummary(res.summary);
      } else {
        await fetchSummary();
      }
      window.dispatchEvent(new CustomEvent('help-counter-updated'));
    } catch (err) {
      console.warn('Failed to reset help counters:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const totalAssists = summary?.total_assists || 0;
  const hints = summary?.hints || {
    total: 0,
    level_1_nudge: 0,
    level_2_strategy: 0,
    level_3_structure: 0,
  };

  return (
    <div className="help-usage-widget" ref={popoverRef}>
      {/* Compact Trigger Button / Pill */}
      <button
        type="button"
        className={`help-usage-widget__trigger ${totalAssists > 0 ? 'help-usage-widget__trigger--active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={`Assistance Usage: ${totalAssists} total assists`}
        title="View session assistance metrics (hints & AI guidance)"
        id="btn-help-usage-widget"
      >
        <span className="help-usage-widget__icon" aria-hidden="true">💡</span>
        <span className="help-usage-widget__label">Assists:</span>
        <span className="help-usage-widget__badge">{totalAssists}</span>
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="help-usage-widget__popover" role="dialog" aria-label="Assistance Usage Breakdown">
          <div className="help-usage-widget__header">
            <div className="help-usage-widget__header-title">
              <span>📊 Assistance Tracker</span>
              <span className="help-usage-widget__mode-tag">Session Only</span>
            </div>
            <button
              type="button"
              className="help-usage-widget__btn-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistance tracker"
            >
              ×
            </button>
          </div>

          <div className="help-usage-widget__body">
            {/* Total summary tally */}
            <div className="help-usage-widget__tally-box">
              <div className="help-usage-widget__tally-number">{totalAssists}</div>
              <div className="help-usage-widget__tally-label">
                Total Assists Used This Session
              </div>
            </div>

            {/* Assistance Breakdown Table */}
            <div className="help-usage-widget__breakdown">
              <div className="help-usage-row">
                <div className="help-usage-row__info">
                  <span className="help-usage-row__icon">🧩</span>
                  <div>
                    <div className="help-usage-row__title">Rule-Based Hints (A6)</div>
                    <div className="help-usage-row__sub">
                      L1: {hints.level_1_nudge} | L2: {hints.level_2_strategy} | L3: {hints.level_3_structure}
                    </div>
                  </div>
                </div>
                <span className="help-usage-row__count">{hints.total}</span>
              </div>

              <div className="help-usage-row">
                <div className="help-usage-row__info">
                  <span className="help-usage-row__icon">🤖</span>
                  <div>
                    <div className="help-usage-row__title">AI Tutor Inquiries (A7)</div>
                    <div className="help-usage-row__sub">Socratic prompts & questions</div>
                  </div>
                </div>
                <span className="help-usage-row__count">{summary?.ai_tutor_queries || 0}</span>
              </div>

              <div className="help-usage-row">
                <div className="help-usage-row__info">
                  <span className="help-usage-row__icon">🔍</span>
                  <div>
                    <div className="help-usage-row__title">AI Error Explanations (A9)</div>
                    <div className="help-usage-row__sub">Deep dive traceback analyses</div>
                  </div>
                </div>
                <span className="help-usage-row__count">{summary?.ai_error_explanations || 0}</span>
              </div>
            </div>

            {/* Educational note */}
            <p className="help-usage-widget__note">
              💡 Tracked for learning self-awareness. No scoring penalty is applied.
            </p>
          </div>

          {/* Popover Footer / Reset action */}
          <div className="help-usage-widget__footer">
            <button
              type="button"
              className="help-usage-widget__btn-reset"
              onClick={handleReset}
              disabled={isResetting || totalAssists === 0}
              id="btn-reset-help-counter"
            >
              {isResetting ? 'Resetting…' : '↺ Reset Session Counter'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
