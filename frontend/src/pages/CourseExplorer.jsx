/**
 * CourseExplorer.jsx — Modern Curriculum Explorer & Learning Hub (Phase B2).
 *
 * Professional course dashboard for CodeMentor AI featuring:
 * - Master course overview with real-time student progress metrics
 * - 6-Module grid with status badges (Available vs Roadmap)
 * - Deep session tree with video lecture and Colab notebook links
 * - Integrated lesson reader with interactive code walkthroughs
 * - Direct deep linking to Monaco IDE for challenges and Chapter Exams
 */

import { useState, useEffect, useMemo } from 'react';
import {
  getCourseCatalog,
  getModule,
  getLesson,
  setLastActivePosition,
} from '../services/curriculumService';
import LessonViewer from '../components/curriculum/LessonViewer';
import StatusBadge from '../components/StatusBadge';
import './CourseExplorer.css';

export default function CourseExplorer() {
  const [catalog, setCatalog] = useState(() => getCourseCatalog());
  const [selectedModuleId, setSelectedModuleId] = useState('module_1');
  const [openSessionIds, setOpenSessionIds] = useState(() => new Set(['session_01']));
  const [activeLessonData, setActiveLessonData] = useState(null);

  // Sync with curriculum updates from anywhere in app
  useEffect(() => {
    const handleProgressUpdate = () => {
      setCatalog(getCourseCatalog());
    };
    window.addEventListener('curriculum-progress-updated', handleProgressUpdate);
    return () => window.removeEventListener('curriculum-progress-updated', handleProgressUpdate);
  }, []);

  // Active module details
  const activeModule = useMemo(() => {
    return getModule(selectedModuleId);
  }, [selectedModuleId, catalog]);

  const toggleSession = (sessionId) => {
    setOpenSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleOpenLesson = (session, lesson) => {
    setLastActivePosition(selectedModuleId, session.session_id, lesson.lesson_id);
    setActiveLessonData({
      lesson,
      session,
      module: {
        module_id: activeModule.module_id,
        title: activeModule.title,
      },
    });
  };

  const handleTryCodeInIDE = (code) => {
    sessionStorage.setItem('codementor_transfer_code', code);
    window.location.href = '/editor?mode=editor';
  };

  const handleSolveChallenge = (challenge) => {
    window.location.href = `/editor?mode=course&challengeId=${encodeURIComponent(challenge.id)}`;
  };

  const handleTakeExam = (exam) => {
    window.location.href = `/editor?mode=course&examId=${encodeURIComponent(exam.exam_id)}`;
  };

  const overallProgress = catalog?.stats?.overallProgressPercentage || 0;

  return (
    <main className="course-explorer">
      <div className="course-explorer__container">
        {/* =================================================================
            1. Hero & Overall Progress Banner
            ================================================================= */}
        <section className="explorer-hero" aria-label="Course Overview">
          <div className="explorer-hero__left">
            <div className="explorer-hero__badge">
              <span>🎓</span> Comprehensive Interactive Python Track
            </div>
            <h1 className="explorer-hero__title">{catalog.title}</h1>
            <p className="explorer-hero__subtitle">{catalog.description}</p>

            <div className="explorer-hero__meta">
              <div className="hero-meta-item">
                <span className="hero-meta-item__icon">📚</span>
                <span>
                  Modules: <strong className="hero-meta-item__val">{catalog.total_modules}</strong>
                </span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-item__icon">⚡</span>
                <span>
                  Sessions: <strong className="hero-meta-item__val">{catalog.total_sessions}</strong>
                </span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-item__icon">🎯</span>
                <span>
                  Challenges:{' '}
                  <strong className="hero-meta-item__val">
                    {catalog.stats?.solvedChallenges} / {catalog.stats?.totalChallenges} Solved
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="explorer-hero__right">
            <div
              className="hero-progress-circle"
              style={{ '--progress-val': overallProgress }}
              aria-label={`Overall Course Progress: ${overallProgress}%`}
            >
              <span className="hero-progress-circle__text">{overallProgress}%</span>
            </div>
            <div className="hero-progress__label">Course Mastery</div>
            <div className="hero-progress__sub">
              {catalog.stats?.completedLessons} of {catalog.stats?.totalLessons} lessons finished
            </div>
            <a href="/editor?mode=course" className="hero-resume-btn">
              <span>▶</span> Open Learning Workspace
            </a>
          </div>
        </section>

        {/* =================================================================
            2. Modules Grid / Catalog
            ================================================================= */}
        <section className="modules-strip" aria-label="Curriculum Modules">
          <div className="modules-strip__header">
            <h2 className="modules-strip__title">
              <span>🧱</span> Course Curriculum & Tracks
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              6 Master Modules • Free & Interactive
            </span>
          </div>

          <div className="modules-grid">
            {catalog.modules.map((mod) => {
              const isSelected = mod.id === selectedModuleId;
              return (
                <div
                  key={mod.id}
                  className={`module-card ${isSelected ? 'module-card--active' : ''} ${
                    !mod.isAvailable ? 'module-card--locked' : ''
                  }`}
                  onClick={() => {
                    if (mod.isAvailable) setSelectedModuleId(mod.id);
                  }}
                  role="button"
                  tabIndex={mod.isAvailable ? 0 : -1}
                  aria-pressed={isSelected}
                >
                  <div>
                    <div className="module-card__top">
                      <div className="module-card__icon-box">{mod.icon}</div>
                      <span
                        className={`module-card__status-badge ${
                          mod.isAvailable
                            ? isSelected
                              ? 'badge--active-learning'
                              : 'badge--available'
                            : 'badge--planned'
                        }`}
                      >
                        {mod.isAvailable
                          ? isSelected
                            ? 'Active Module'
                            : 'Ready to Learn'
                          : 'Roadmap'}
                      </span>
                    </div>

                    <h3 className="module-card__title">
                      Module {mod.module_number}: {mod.title}
                    </h3>
                    <p className="module-card__summary">{mod.summary}</p>
                  </div>

                  <div>
                    {mod.isAvailable && (
                      <div className="module-progress-bar-container">
                        <div
                          className="module-progress-bar-fill"
                          style={{ width: `${mod.progressPercentage}%` }}
                        />
                      </div>
                    )}

                    <div className="module-card__footer">
                      <span>
                        {mod.session_count} Sessions • ~{mod.estimated_hours}h
                      </span>
                      {mod.isAvailable && (
                        <span style={{ color: mod.progressPercentage > 0 ? '#34d399' : '#94a3b8' }}>
                          {mod.progressPercentage}% Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================
            3. Active Module Deep Dive (Sessions & Lessons)
            ================================================================= */}
        {activeModule && (
          <section className="active-module-view" aria-label={`Module ${activeModule.module_number} Sessions`}>
            <div className="module-view-header">
              <div>
                <h2 className="module-view-header__title">
                  <span>🐍</span> Module {activeModule.module_number}: {activeModule.title}
                </h2>
                <p className="module-view-header__desc">{activeModule.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {activeModule.sessions?.length || 0} Sessions • 14 Lessons • 20 Challenges
                </span>
              </div>
            </div>

            {/* Sessions List */}
            <div className="sessions-list">
              {activeModule.sessions?.map((session) => {
                const isOpen = openSessionIds.has(session.session_id);

                return (
                  <div key={session.session_id} className="session-item">
                    <div
                      className="session-header"
                      onClick={() => toggleSession(session.session_id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="session-header__left">
                        <div className="session-num-badge">S{session.session_number}</div>
                        <div>
                          <h3 className="session-title">{session.title}</h3>
                        </div>
                      </div>

                      <div className="session-header__right">
                        <div className="session-links" onClick={(e) => e.stopPropagation()}>
                          {session.video_url && (
                            <a
                              href={session.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="session-external-link"
                              title="Watch video lecture"
                            >
                              <span>▶</span> YouTube
                            </a>
                          )}
                        </div>

                        <span className="session-meta-pill">
                          {session.completedCount || 0}/{session.totalCount || 0} Lessons
                        </span>

                        <span className={`chevron-icon ${isOpen ? 'chevron-icon--open' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="session-body">
                        {session.lessons?.map((lesson) => {
                          return (
                            <div key={lesson.lesson_id} className="lesson-row">
                              <div className="lesson-row__left">
                                <div
                                  className={`lesson-status-icon ${
                                    lesson.isCompleted ? 'lesson-status-icon--done' : ''
                                  }`}
                                  title={lesson.isCompleted ? 'Completed' : 'Not yet completed'}
                                >
                                  ✓
                                </div>
                                <span className="lesson-title">{lesson.title}</span>
                              </div>

                              <div className="lesson-row__actions">
                                <span className="lesson-challenges-count">
                                  {lesson.practice_challenges?.length || 0} Challenges
                                </span>
                                <button
                                  type="button"
                                  className="btn-open-lesson"
                                  onClick={() => handleOpenLesson(session, lesson)}
                                >
                                  Read & Practice ➔
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* End of Module: Chapter Exam Card */}
            {activeModule.chapter_exam && (
              <div className="chapter-exam-card">
                <div className="chapter-exam-card__left">
                  <div className="chapter-exam__tag">
                    <span>🏆</span> End of Module Assessment
                  </div>
                  <h3 className="chapter-exam__title">{activeModule.chapter_exam.title}</h3>
                  <p className="chapter-exam__desc">{activeModule.chapter_exam.description}</p>
                </div>

                <div className="chapter-exam-card__right">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Passing Threshold</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c084fc' }}>
                      {activeModule.chapter_exam.passing_score_percentage}% Score
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-take-exam"
                    onClick={() => handleTakeExam(activeModule.chapter_exam)}
                  >
                    <span>🎯</span> Take Chapter Exam
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Interactive Lesson Modal Viewer */}
      {activeLessonData && (
        <LessonViewer
          lessonData={activeLessonData}
          onClose={() => setActiveLessonData(null)}
          onTryCodeInIDE={handleTryCodeInIDE}
          onSolveChallenge={handleSolveChallenge}
          onNextLesson={() => {
            // Find next lesson
            // Simple advance
            setActiveLessonData(null);
          }}
          onPreviousLesson={() => {
            setActiveLessonData(null);
          }}
        />
      )}
    </main>
  );
}
