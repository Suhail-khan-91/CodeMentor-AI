/**
 * LessonViewer.jsx — Interactive Concept & Walkthrough Reader (Phase B3).
 *
 * Provides a rich, distraction-free reading experience for course lessons:
 * - Structured conceptual explanations
 * - Interactive runnable code walkthroughs with "Try in IDE" trigger
 * - Hands-on practice challenges with difficulty tags and "Solve in IDE" trigger
 * - Completion tracking with instant synchronization
 */

import { useState } from 'react';
import { markLessonComplete } from '../../services/curriculumService';
import StatusBadge from '../StatusBadge';
import './LessonViewer.css';

export default function LessonViewer({
  lessonData,
  onClose,
  onTryCodeInIDE,
  onSolveChallenge,
  onNextLesson,
  onPreviousLesson,
  hasNext = false,
  hasPrevious = false,
}) {
  if (!lessonData || !lessonData.lesson) return null;

  const { lesson, session, module } = lessonData;
  const [isCompleted, setIsCompleted] = useState(Boolean(lesson.isCompleted));

  const handleToggleComplete = () => {
    markLessonComplete(lesson.lesson_id);
    setIsCompleted(true);
  };

  const difficultyVariant = (diff) => {
    switch (diff) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'accent';
      case 'advanced':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="lesson-viewer-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lesson-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="lesson-viewer__header">
          <div>
            <div className="lesson-viewer__breadcrumb">
              <span>{module?.title || 'Python Course'}</span>
              <span className="lesson-viewer__breadcrumb-sep">/</span>
              <span>{session?.title || 'Session'}</span>
            </div>
            <h2 className="lesson-viewer__title">{lesson.title}</h2>
          </div>

          <div className="lesson-viewer__header-actions">
            <button
              type="button"
              className={`btn-toggle-complete ${isCompleted ? 'btn-toggle-complete--done' : ''}`}
              onClick={handleToggleComplete}
              title="Mark lesson as complete"
            >
              {isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </button>
            <button
              type="button"
              className="btn-close-viewer"
              onClick={onClose}
              aria-label="Close lesson reader"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="lesson-viewer__body">
          {/* Section 1: Concept & Theory */}
          <section className="lesson-section">
            <h3 className="lesson-section-title">
              <span>📖</span> Concept & Explanation
            </h3>
            <div className="concept-box">{lesson.concept_markdown}</div>
          </section>

          {/* Section 2: Code Walkthroughs */}
          {lesson.code_walkthroughs && lesson.code_walkthroughs.length > 0 && (
            <section className="lesson-section">
              <h3 className="lesson-section-title">
                <span>💻</span> Code Walkthroughs & Live Examples
              </h3>
              <div className="walkthroughs-list">
                {lesson.code_walkthroughs.map((wt, idx) => (
                  <div key={idx} className="walkthrough-card">
                    <div className="walkthrough-card__header">
                      <span className="walkthrough-title">{wt.title}</span>
                      <button
                        type="button"
                        className="btn-try-walkthrough"
                        onClick={() => onTryCodeInIDE(wt.code)}
                        title="Load this snippet into Monaco IDE"
                      >
                        <span>▶</span> Try in IDE
                      </button>
                    </div>
                    <pre className="walkthrough-code">
                      <code>{wt.code}</code>
                    </pre>
                    {wt.expected_stdout && (
                      <div className="walkthrough-expected">
                        <span className="walkthrough-expected__label">Expected Output:</span>
                        <span className="walkthrough-expected__val">{wt.expected_stdout.trim()}</span>
                      </div>
                    )}
                    {wt.explanation && (
                      <div className="walkthrough-explanation">
                        <strong>Why it works: </strong>
                        {wt.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Practice Challenges */}
          {lesson.practice_challenges && lesson.practice_challenges.length > 0 && (
            <section className="lesson-section">
              <h3 className="lesson-section-title">
                <span>🎯</span> Hands-On Practice Challenges
              </h3>
              <div className="challenges-grid">
                {lesson.practice_challenges.map((chal) => (
                  <div key={chal.id} className="challenge-card">
                    <div>
                      <div className="challenge-card__top">
                        <StatusBadge
                          label={chal.difficulty || 'beginner'}
                          variant={difficultyVariant(chal.difficulty)}
                        />
                        {chal.isSolved && (
                          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '700' }}>
                            ✓ Solved
                          </span>
                        )}
                      </div>
                      <h4 className="challenge-title" style={{ marginTop: '8px' }}>
                        {chal.title}
                      </h4>
                      <p className="challenge-desc" style={{ marginTop: '6px' }}>
                        {chal.description}
                      </p>
                    </div>

                    <div className="challenge-card__footer">
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {chal.test_cases?.length || 0} Test Cases
                      </span>
                      <button
                        type="button"
                        className="btn-solve-challenge"
                        onClick={() => onSolveChallenge(chal)}
                      >
                        Solve in IDE ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="lesson-viewer__footer">
          <button
            type="button"
            className="btn-nav-lesson"
            onClick={onPreviousLesson}
            disabled={!hasPrevious}
          >
            ← Previous Lesson
          </button>
          <button
            type="button"
            className="btn-nav-lesson"
            onClick={onNextLesson}
            disabled={!hasNext}
          >
            Next Lesson →
          </button>
        </footer>
      </div>
    </div>
  );
}
