/**
 * ProgressModal.jsx — Python Curriculum Progress & Mastery Engine
 *
 * Displays live, comprehensive student progress across the 6-Module Python Course:
 * - Circular SVG completion meter with overall course progress percentage
 * - High-level metrics: Completed Lessons, Challenges Solved, Chapter Exams Passed
 * - Module-by-module breakdown (Modules 1–6) with progress bars, challenge stats, and exam badges
 * - Safe reset functionality with two-stage confirmation
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCourseCatalog, resetCurriculumProgress } from '../services/curriculumService';
import { resetProgress } from '../services/api';
import './ProgressModal.css';

export default function ProgressModal({ isOpen, onClose }) {
  const [catalog, setCatalog] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState('course'); // 'course' | 'modules'

  const fetchProgress = () => {
    try {
      const data = getCourseCatalog();
      setCatalog(data);
    } catch (err) {
      console.warn('Failed to load curriculum progress:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProgress();
      setConfirmReset(false);
    }
  }, [isOpen]);

  // Synchronize on global event
  useEffect(() => {
    const handleUpdate = () => {
      fetchProgress();
    };
    window.addEventListener('curriculum-progress-updated', handleUpdate);
    window.addEventListener('progress-updated', handleUpdate);
    return () => {
      window.removeEventListener('curriculum-progress-updated', handleUpdate);
      window.removeEventListener('progress-updated', handleUpdate);
    };
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

  if (!isOpen) return null;

  const stats = catalog?.stats || {
    totalLessons: 32,
    completedLessons: 0,
    totalChallenges: 44,
    solvedChallenges: 0,
  };

  const modules = catalog?.modules || [];
  const overallPct = catalog?.overallProgressPercentage || 0;
  const examsPassedCount = modules.filter((m) => m.examPassed).length;

  // SVG Circular calculation
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetCurriculumProgress();
    resetProgress().catch(() => {});
    setConfirmReset(false);
    fetchProgress();
  };

  return createPortal(
    <div className="progress-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="progress-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="progress-modal__header">
          <div className="progress-modal__title-group">
            <div className="progress-modal__icon-orb" aria-hidden="true">
              <span>📊</span>
            </div>
            <div>
              <div className="progress-modal__header-badges">
                <h2 className="progress-modal__title">Python Curriculum Progress</h2>
                <span className="progress-modal__session-badge">Interactive Track</span>
              </div>
              <span className="progress-modal__subtitle">
                Mastery tracking across 6 Modules, 32 Sessions, and 44 Challenges
              </span>
            </div>
          </div>
          <button
            type="button"
            className="progress-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className="progress-modal__body">
          {/* Executive Overview Row */}
          <div className="progress-hero-summary">
            {/* Circular Progress Gauge */}
            <div className="prog-gauge-box">
              <svg className="prog-gauge-svg" width="110" height="110" viewBox="0 0 110 110">
                <circle
                  className="prog-gauge-track"
                  cx="55"
                  cy="55"
                  r={radius}
                  strokeWidth="8"
                />
                <circle
                  className="prog-gauge-fill"
                  cx="55"
                  cy="55"
                  r={radius}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="prog-gauge-center">
                <span className="prog-gauge-pct">{overallPct}%</span>
                <span className="prog-gauge-lbl">Mastery</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="progress-metrics-grid">
              <div className="progress-stat-card">
                <span className="progress-stat-card__val">
                  {stats.completedLessons} <span className="progress-stat-card__total">/ {stats.totalLessons}</span>
                </span>
                <span className="progress-stat-card__lbl">Lessons Completed</span>
              </div>

              <div className="progress-stat-card">
                <span className="progress-stat-card__val">
                  {stats.solvedChallenges} <span className="progress-stat-card__total">/ {stats.totalChallenges}</span>
                </span>
                <span className="progress-stat-card__lbl">Practice Challenges Solved</span>
              </div>

              <div className="progress-stat-card">
                <span className="progress-stat-card__val">
                  {examsPassedCount} <span className="progress-stat-card__total">/ 6</span>
                </span>
                <span className="progress-stat-card__lbl">Chapter Exams Passed</span>
              </div>
            </div>
          </div>

          {/* Module-by-Module Progress Breakdown */}
          <div className="progress-modules-section">
            <div className="progress-modules-header">
              <h3 className="progress-modules-title">Module-by-Module Breakdown</h3>
              <span className="progress-modules-sub">CampusX Data Science Track</span>
            </div>

            <div className="progress-modules-list">
              {modules.map((mod, idx) => (
                <div key={mod.id || idx} className="prog-module-card">
                  <div className="prog-module-card__top">
                    <div className="prog-module-card__title-row">
                      <span className="prog-module-card__icon">{mod.icon || '📘'}</span>
                      <div>
                        <h4 className="prog-module-card__name">
                          Module {idx + 1}: {mod.title}
                        </h4>
                        <span className="prog-module-card__meta">
                          {mod.sessionCount} Sessions • {mod.lessonCount} Lessons • {mod.challengeCount} Challenges
                        </span>
                      </div>
                    </div>

                    <div className="prog-module-card__badges">
                      {mod.examPassed ? (
                        <span className="prog-badge prog-badge--passed">
                          ✓ Exam Passed ({mod.examScore}%)
                        </span>
                      ) : mod.progressPercentage > 0 ? (
                        <span className="prog-badge prog-badge--active">
                          In Progress ({mod.progressPercentage}%)
                        </span>
                      ) : (
                        <span className="prog-badge prog-badge--idle">Ready</span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="prog-bar-track">
                    <div
                      className="prog-bar-fill"
                      style={{ width: `${mod.progressPercentage}%` }}
                    />
                  </div>

                  <div className="prog-module-card__footer">
                    <span className="prog-module-card__progress-text">
                      {mod.completedLessonCount} of {mod.lessonCount} lessons completed • {mod.solvedChallengeCount} challenges solved
                    </span>
                    <a
                      href={`/courses?module=${mod.id}`}
                      className="prog-module-card__link"
                      onClick={onClose}
                    >
                      Continue →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="progress-modal__footer">
          <button
            type="button"
            className={`progress-modal__reset-btn ${confirmReset ? 'progress-modal__reset-btn--confirm' : ''}`}
            onClick={handleReset}
          >
            <span>↺</span>
            <span>{confirmReset ? 'Confirm Reset All Progress?' : 'Reset Progress'}</span>
          </button>

          <button
            type="button"
            className="btn btn--accent btn-sm"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
