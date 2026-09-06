/**
 * ProgressModal.jsx — Phase A12: Progress & Score Engine Component.
 *
 * Displays cumulative student progress across starter tasks and custom challenges:
 * - Overall completion percentage meter
 * - Key metrics: completed tasks, average score, attempt count, assistance correlation
 * - Task-by-task breakdown with pass/fail badges, best scores, and attempt counts
 * - Session-based / in-memory tracking with reset capability
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

  const completionPct = summary?.completion_percentage || 0;
  const avgScore = summary?.average_best_score || 0;
  const totalCompleted = summary?.tasks_completed || 0;
  const totalStarter = summary?.total_tasks_available || 5;
  const totalAttempts = summary?.total_attempts || 0;
  const totalAssists = summary?.total_assists_linked || 0;

  const getStatusBadge = (status, passed) => {
    if (passed || status === 'completed') {
      return <span className="progress-badge progress-badge--completed">✓ Completed</span>;
    }
    if (status === 'in_progress') {
      return <span className="progress-badge progress-badge--in-progress">⚡ In Progress</span>;
    }
    return <span className="progress-badge progress-badge--not-attempted">○ Not Attempted</span>;
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
            <span className="progress-modal__icon" aria-hidden="true">📊</span>
            <div>
              <h2 id="progress-modal-title" className="progress-modal__title">
                Progress & Scores
              </h2>
              <span className="progress-modal__subtitle">
                Session Learning Journey & Performance Metrics
              </span>
            </div>
          </div>
          <button
            type="button"
            className="progress-modal__close-btn"
            onClick={onClose}
            aria-label="Close Progress Modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="progress-modal__body">
          {/* Hero Completion Banner */}
          <div className="progress-hero">
            <div className="progress-hero__left">
              <div className="progress-hero__label">Starter Challenges Solved</div>
              <div className="progress-hero__value">
                {totalCompleted} <span className="progress-hero__sub">/ {totalStarter} Completed</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, completionPct)}%` }}
                />
              </div>
            </div>
            <div className="progress-hero__percent">
              {completionPct}%
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="progress-metrics-grid">
            <div className="metric-card">
              <span className="metric-card__icon">📈</span>
              <div className="metric-card__number">{avgScore}%</div>
              <div className="metric-card__label">Average Best Score</div>
            </div>

            <div className="metric-card">
              <span className="metric-card__icon">🧪</span>
              <div className="metric-card__number">{totalAttempts}</div>
              <div className="metric-card__label">Evaluation Attempts</div>
            </div>

            <div className="metric-card">
              <span className="metric-card__icon">💡</span>
              <div className="metric-card__number">{totalAssists}</div>
              <div className="metric-card__label">Assists Linked</div>
            </div>

            <div className="metric-card">
              <span className="metric-card__icon">🎯</span>
              <div className="metric-card__number">{summary?.tasks_attempted || 0}</div>
              <div className="metric-card__label">Tasks Attempted</div>
            </div>
          </div>

          {/* Task Breakdown Section */}
          <div className="progress-tasks-section">
            <div className="progress-tasks-header">
              <h3 className="progress-tasks-title">Task Breakdown</h3>
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
                <p>No tasks found in this category.</p>
              </div>
            ) : (
              <div className="progress-tasks-grid">
                {filteredTasks.map((task) => (
                  <div key={task.task_id} className={`progress-task-card progress-task-card--${task.status}`}>
                    <div className="progress-task-card__top">
                      <div className="progress-task-card__title-group">
                        <span className="progress-task-card__category">
                          {task.category === 'custom' ? 'Custom Challenge' : 'Starter Challenge'}
                        </span>
                        <h4 className="progress-task-card__name">{task.title}</h4>
                      </div>
                      {getStatusBadge(task.status, task.passed)}
                    </div>

                    <div className="progress-task-card__score-row">
                      <span className="progress-task-card__score-label">Best Score:</span>
                      <span className="progress-task-card__score-val">{task.best_score}%</span>
                    </div>

                    <div className="progress-score-mini-bar">
                      <div
                        className={`progress-score-mini-fill ${task.passed ? 'progress-score-mini-fill--pass' : ''}`}
                        style={{ width: `${task.best_score}%` }}
                      />
                    </div>

                    <div className="progress-task-card__footer">
                      <span className="progress-task-card__attempts">
                        Attempts: <strong>{task.attempts_count}</strong>
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
              🔒 In-Memory Session Storage (Phase A12). No score penalties applied.
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
                : '↺ Reset Progress'}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onClose}
              id="btn-close-progress-modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
