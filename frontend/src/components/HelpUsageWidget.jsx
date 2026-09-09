/**
 * HelpUsageWidget.jsx — Phase A11: Assistance Counter Component (Upgraded)
 *
 * Tracks session-only learning assistance (hints, AI tutor inquiries, AI error explanations)
 * with zero scoring penalties.
 */

import { useState, useEffect, useRef } from 'react';
import { getHelpSummary, resetHelpCounter } from '../services/api';
import './HelpUsageWidget.css';

export default function HelpUsageWidget() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="help-widget-container" ref={popoverRef}>
      {/* Pill Trigger */}
      <button
        type="button"
        className={`help-widget-pill ${totalAssists > 0 ? 'help-widget-pill--active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={`Assistance Usage: ${totalAssists} assists`}
        title="View session assistance metrics (hints & AI guidance)"
        id="btn-help-usage-widget"
      >
        <span className="help-widget-dot" aria-hidden="true" />
        <span className="help-widget-label">Assists:</span>
        <span className="help-widget-count">{totalAssists}</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="help-popover-card" role="dialog" aria-label="Assistance Breakdown">
          <div className="help-popover-header">
            <div className="popover-title-group">
              <span className="popover-icon" aria-hidden="true">📊</span>
              <strong className="popover-title">Session Assistance</strong>
            </div>
            <span className="popover-tag">Zero Penalty</span>
          </div>

          <div className="help-popover-body">
            {/* Big Tally Box */}
            <div className="help-tally-box">
              <span className="help-tally-num">{totalAssists}</span>
              <span className="help-tally-label">Total Assists Utilized</span>
            </div>

            {/* Breakdown Items */}
            <div className="help-rows-list">
              <div className="help-metric-row">
                <div className="help-row-left">
                  <span>💡</span>
                  <div>
                    <strong className="help-row-name">Progressive Hints</strong>
                    <span className="help-row-sub">
                      L1: {hints.level_1_nudge} • L2: {hints.level_2_strategy} • L3: {hints.level_3_structure}
                    </span>
                  </div>
                </div>
                <span className="help-row-val">{hints.total}</span>
              </div>

              <div className="help-metric-row">
                <div className="help-row-left">
                  <span>🤖</span>
                  <div>
                    <strong className="help-row-name">AI Tutor Queries</strong>
                    <span className="help-row-sub">Socratic prompts & questions</span>
                  </div>
                </div>
                <span className="help-row-val">{summary?.ai_tutor_queries || 0}</span>
              </div>

              <div className="help-metric-row">
                <div className="help-row-left">
                  <span>✨</span>
                  <div>
                    <strong className="help-row-name">AI Error Deconstructions</strong>
                    <span className="help-row-sub">Deep-dive exception trace analyses</span>
                  </div>
                </div>
                <span className="help-row-val">{summary?.ai_error_explanations || 0}</span>
              </div>
            </div>

            <p className="help-disclaimer-text">
              Tracked purely for self-awareness. No scoring deductions are ever applied.
            </p>
          </div>

          <div className="help-popover-footer">
            <button
              type="button"
              className="btn btn--ghost btn-sm help-reset-btn"
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
