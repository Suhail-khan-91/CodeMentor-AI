/**
 * ProgressModal.jsx — Phase A12: Progress & Score Engine Component.
 *
 * Displays cumulative student progress across starter tasks and custom challenges:
 * - Circular SVG completion meter with tier status
 * - 4-metric executive performance cards
 * - Task-by-task breakdown with live category filters
 * - Mini progress bars, attempt counts, and pass badges
 * - Safe session reset with two-stage confirmation
 */

import { useState, useEffect, useRef } from 'react';
import { getProgressSummary, resetProgress } from '../services/api';
import './ProgressModal.css';

export default function ProgressModal({ isOpen, onClose }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'starter' | 'custom'
  const [confirmReset, setConfirmReset] = useState(false);

  const modalRef = useRef(null);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const res = await getProgressSummary();
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('Failed to fetch progress summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
      setConfirmReset(false);
    }
  }, [isOpen]);

  // Synchronize on global event
  useEffect(() => {
    const handleUpdate = () => {
      fetchSummary();
    };
    window.addEventListener('progress-updated', handleUpdate);
    return () => window.removeEventListener('progress-updated', handleUpdate);
  }, []);

  // Keyboard navigation (Escape closes modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setIsResetting(true);
    try {
      const res = await resetProgress();
      if (res?.summary) {
        setSummary(res.summary);
      }
      setConfirmReset(false);
      window.dispatchEvent(new CustomEvent('progress-updated'));
    } catch (err) {
      console.warn('Failed to reset progress:', err);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen) return null;

  const tasksList = summary?.tasks ? Object.values(summary.tasks) : [];
  const filteredTasks = tasksList.filter((t) => {
    if (filter === 'starter') return t.category === 'starter';
    if (filter === 'custom') return t.category === 'custom';
    return true;
  });

  const completionPct = Math.min(100, Math.max(0, summary?.completion_percentage || 0));
  const avgScore = summary?.average_best_score || 0;
  const totalCompleted = summary?.tasks_completed || 0;
  const totalStarter = summary?.total_tasks_available || 5;
  const totalAttempts = summary?.total_attempts || 0;
  const totalAssists = summary?.total_assists_linked || 0;
  const totalAttempted = summary?.tasks_attempted || 0;

  // SVG Circular calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  const getStatusBadge = (status, passed) => {
    if (passed || status === 'completed') {
      return (
        <span className="prog-status-badge prog-status-badge--completed">
          <span className="prog-status-badge__dot" /> Completed
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="prog-status-badge prog-status-badge--in-progress">
          <span className="prog-status-badge__dot" /> In Progress
        </span>
      );
    }
    return (
      <span className="prog-status-badge prog-status-badge--not-attempted">
        <span className="prog-status-badge__dot" /> Not Attempted
      </span>
    );
  };

  return (
    <div
      className="progress-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div className="progress-modal-card" ref={modalRef}>
        {/* Header */}
        <div className="progress-modal__header">
          <div className="progress-modal__title-group">
            <div className="progress-modal__icon-orb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="progress-modal__header-badges">
                <h2 id="progress-modal-title" className="progress-modal__title">
                  Performance & Mastery Analytics
                </h2>
                <span className="progress-modal__session-badge">Session Engine</span>
              </div>
              <span className="progress-modal__subtitle">
                Cumulative telemetry across curriculum challenges and practice sessions
              </span>
            </div>
          </div>
          <button
            type="button"
            className="progress-modal__close-btn"
            onClick={onClose}
            aria-label="Close Progress Modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="progress-modal__body">
          {/* Executive Overview Hero with Circular SVG Meter */}
          <div className="progress-hero-card">
            <div className="progress-hero-card__chart">
              <svg className="progress-circle-svg" width="120" height="120" viewBox="0 0 120 120">
                <circle
                  className="progress-circle-bg"
                  cx="60"
                  cy="60"
                  r={radius}
                />
                <circle
                  className="progress-circle-fill"
                  cx="60"
                  cy="60"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="progress-circle-text">
                <span className="progress-circle-number">{completionPct}%</span>
                <span className="progress-circle-label">CURRICULUM</span>
              </div>
            </div>

            <div className="progress-hero-card__details">
              <div className="progress-hero-card__lead">
                <div className="progress-hero-card__tag">STARTER CURRICULUM</div>
                <h3 className="progress-hero-card__heading">
                  {totalCompleted} of {totalStarter} Challenges Mastered
                </h3>
                <p className="progress-hero-card__desc">
                  {completionPct === 100
                    ? 'Outstanding! You have completed all foundational curriculum challenges.'
                    : completionPct > 0
                    ? `You're making solid headway. Solve remaining challenges to reach 100% mastery.`
                    : 'Start solving challenges in Task Evaluation Mode to unlock mastery analytics.'}
                </p>
              </div>

              {/* Linear mini indicator */}
              <div className="progress-linear-meter">
                <div className="progress-linear-meter__header">
                  <span>Progression Target</span>
                  <span>{totalCompleted}/{totalStarter} Completed</span>
                </div>
                <div className="progress-linear-meter__track">
                  <div
                    className="progress-linear-meter__fill"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4-Metric Analytics Grid */}
          <div className="progress-metrics-grid">
            <div className="progress-metric-tile">
              <div className="progress-metric-tile__header">
                <span className="progress-metric-tile__icon progress-metric-tile__icon--amber">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="progress-metric-tile__label">Average Best Score</span>
              </div>
              <div className="progress-metric-tile__val-row">
                <span className="progress-metric-tile__number">{avgScore}%</span>
                <span className="progress-metric-tile__sub">grade index</span>
              </div>
            </div>

            <div className="progress-metric-tile">
              <div className="progress-metric-tile__header">
                <span className="progress-metric-tile__icon progress-metric-tile__icon--blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="progress-metric-tile__label">Test Evaluations</span>
              </div>
              <div className="progress-metric-tile__val-row">
                <span className="progress-metric-tile__number">{totalAttempts}</span>
                <span className="progress-metric-tile__sub">eval runs</span>
              </div>
            </div>

            <div className="progress-metric-tile">
              <div className="progress-metric-tile__header">
                <span className="progress-metric-tile__icon progress-metric-tile__icon--violet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="9" y1="21" x2="15" y2="21" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="progress-metric-tile__label">AI Assists Used</span>
              </div>
              <div className="progress-metric-tile__val-row">
                <span className="progress-metric-tile__number">{totalAssists}</span>
                <span className="progress-metric-tile__sub">hints / tutor</span>
              </div>
            </div>

            <div className="progress-metric-tile">
              <div className="progress-metric-tile__header">
                <span className="progress-metric-tile__icon progress-metric-tile__icon--mint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="progress-metric-tile__label">Tasks Attempted</span>
              </div>
              <div className="progress-metric-tile__val-row">
                <span className="progress-metric-tile__number">{totalAttempted}</span>
                <span className="progress-metric-tile__sub">active challenges</span>
              </div>
            </div>
          </div>

          {/* Task Breakdown Section */}
          <div className="progress-tasks-section">
            <div className="progress-tasks-header">
              <div className="progress-tasks-header__left">
                <h3 className="progress-tasks-title">Challenge Telemetry</h3>
                <span className="progress-tasks-count">{filteredTasks.length} recorded</span>
              </div>
              <div className="progress-filter-tabs" role="tablist">
                <button
                  type="button"
                  className={`progress-tab ${filter === 'all' ? 'progress-tab--active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({tasksList.length})
                </button>
                <button
                  type="button"
                  className={`progress-tab ${filter === 'starter' ? 'progress-tab--active' : ''}`}
                  onClick={() => setFilter('starter')}
                >
                  Starter ({tasksList.filter((t) => t.category === 'starter').length})
                </button>
                <button
                  type="button"
                  className={`progress-tab ${filter === 'custom' ? 'progress-tab--active' : ''}`}
                  onClick={() => setFilter('custom')}
                >
                  Custom ({tasksList.filter((t) => t.category === 'custom').length})
                </button>
              </div>
            </div>

            {/* Task Cards Grid */}
            {filteredTasks.length === 0 ? (
              <div className="progress-empty-state">
                <div className="progress-empty-state__icon">📂</div>
                <p className="progress-empty-state__title">No Task Telemetry Found</p>
                <p className="progress-empty-state__desc">
                  Run evaluations in Task Evaluation or Custom Question mode to build your performance profile.
                </p>
              </div>
            ) : (
              <div className="progress-tasks-grid">
                {filteredTasks.map((task) => (
                  <div key={task.task_id} className={`progress-task-card progress-task-card--${task.status}`}>
                    <div className="progress-task-card__top">
                      <div className="progress-task-card__title-group">
                        <span className={`progress-task-card__category ${task.category === 'custom' ? 'progress-task-card__category--custom' : ''}`}>
                          {task.category === 'custom' ? 'Custom Challenge' : 'Starter Track'}
                        </span>
                        <h4 className="progress-task-card__name">{task.title}</h4>
                      </div>
                      {getStatusBadge(task.status, task.passed)}
                    </div>

                    <div className="progress-task-card__score-row">
                      <span className="progress-task-card__score-label">Peak Score</span>
                      <span className={`progress-task-card__score-val ${task.passed ? 'progress-task-card__score-val--pass' : ''}`}>
                        {task.best_score}%
                      </span>
                    </div>

                    <div className="progress-score-mini-bar">
                      <div
                        className={`progress-score-mini-fill ${task.passed ? 'progress-score-mini-fill--pass' : ''}`}
                        style={{ width: `${task.best_score}%` }}
                      />
                    </div>

                    <div className="progress-task-card__footer">
                      <span className="progress-task-card__attempts">
                        <strong>{task.attempts_count}</strong> {task.attempts_count === 1 ? 'attempt' : 'attempts'}
                      </span>
                      {task.latest_score !== task.best_score && task.attempts_count > 1 && (
                        <span className="progress-task-card__latest">
                          Latest: {task.latest_score}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="progress-modal__footer">
          <div className="progress-modal__footer-left">
            <span className="progress-modal__scope-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Volatile in-memory session. Zero score penalties applied for hints.
            </span>
          </div>

          <div className="progress-modal__footer-right">
            <button
              type="button"
              className={`btn ${confirmReset ? 'btn--danger' : 'btn--ghost'}`}
              onClick={handleReset}
              disabled={isResetting || (totalAttempts === 0 && totalCompleted === 0)}
              id="btn-reset-progress"
            >
              {isResetting
                ? 'Resetting…'
                : confirmReset
                ? '⚠️ Confirm Reset?'
                : '↺ Reset Session'}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onClose}
              id="btn-close-progress-modal"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
