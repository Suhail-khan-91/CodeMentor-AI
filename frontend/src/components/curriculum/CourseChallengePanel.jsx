/**
 * CourseChallengePanel.jsx — Zone 3 Curriculum & Exam Learning Console (Phase B4).
 *
 * Provides hands-on challenge solving directly inside the Monaco IDE:
 * - Real-time task grading using POST /api/evaluate
 * - Visible and hidden test case result inspection with diff analysis
 * - Static 3-Tier progressive hints (Nudge -> Strategy -> Clue)
 * - Socratic AI Tutor guidance
 * - Progress synchronization with localStorage and backend /api/progress
 * - Full Chapter Exam navigation with question steppers and mastery score tracking
 */

import { useState, useEffect } from 'react';
import { evaluateTask, askAITutor, recordProgressAttempt } from '../../services/api';
import {
  markChallengeSolved,
  recordExamAttempt,
} from '../../services/curriculumService';
import AITutorPanel from '../AITutorPanel';
import StatusBadge from '../StatusBadge';
import './CourseChallengePanel.css';

export default function CourseChallengePanel({
  challenge,
  challengeMeta = {},
  code = '',
  onSetCode,
  onNextQuestion,
  onPrevQuestion,
  hasNext = false,
  hasPrev = false,
  onBackToCourse,
  attachedFiles = [],
}) {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'hints' | 'tutor'
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Progressive hints revelation
  const [unlockedHintLevels, setUnlockedHintLevels] = useState(() => new Set([1]));

  // AI Tutor state
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Reset evaluation state when challenge changes
  useEffect(() => {
    setEvaluationResult(null);
    setUnlockedHintLevels(new Set([1]));
    setTutorAnswer(null);
    setActiveTab('tests');
  }, [challenge?.id]);

  if (!challenge) {
    return (
      <aside className="course-challenge-panel">
        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
          <h3>No challenge selected</h3>
          <p>Please select a lesson challenge from the course explorer.</p>
          <button type="button" className="btn-solve-challenge" onClick={onBackToCourse}>
            Back to Curriculum
          </button>
        </div>
      </aside>
    );
  }

  const isExam = challengeMeta.type === 'chapter_exam';

  // Run automated evaluation against task test cases
  const handleEvaluate = async () => {
    if (!code || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const taskPayload = {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        starter_code: challenge.starter_code || '',
        test_cases: challenge.test_cases || [],
      };

      const result = await evaluateTask(code, taskPayload, attachedFiles);
      setEvaluationResult(result);

      // If passed all test cases, record success in curriculum and progress engines
      if (result.passed_all) {
        if (!isExam) {
          markChallengeSolved(challenge.id, 100);
        }
        await recordProgressAttempt({
          taskId: challenge.id,
          taskTitle: challenge.title,
          category: isExam ? 'exam' : 'course',
          scorePercentage: result.score_percentage || 100,
          passedAll: true,
          passedTests: result.passed_tests,
          totalTests: result.total_tests,
        }).catch(() => {});
      }
    } catch (err) {
      setEvaluationResult({
        passed_all: false,
        status: 'error',
        total_tests: challenge.test_cases?.length || 0,
        passed_tests: 0,
        score_percentage: 0,
        summary_message: err.message || 'Evaluation failed to complete.',
        test_results: [],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset code to challenge starter template
  const handleResetStarter = () => {
    if (challenge.starter_code && onSetCode) {
      if (window.confirm('Reset editor to starter code template? Current changes will be overwritten.')) {
        onSetCode(challenge.starter_code);
      }
    }
  };

  // Unlock progressive hint
  const handleUnlockHint = (level) => {
    setUnlockedHintLevels((prev) => {
      const next = new Set(prev);
      next.add(level);
      return next;
    });
  };

  // Query AI Tutor
  const handleAskTutor = async (customPrompt = '') => {
    const prompt = customPrompt || tutorQuestion;
    if (!prompt.trim() || isTutorLoading) return;

    setIsTutorLoading(true);
    try {
      const res = await askAITutor({
        code,
        task: challenge,
        question: prompt,
        evaluationResult,
      });

      if (res && res.socratic_guidance) {
        setTutorAnswer(res.socratic_guidance);
      } else {
        setTutorAnswer('Consider testing your code with simple edge cases to verify output formatting.');
      }
    } catch (err) {
      setTutorAnswer('The AI Tutor is currently unavailable. Please check your AI Hub settings.');
    } finally {
      setIsTutorLoading(false);
    }
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
    <aside className="course-challenge-panel">
      {/* 1. Challenge Header */}
      <header className="course-challenge-panel__header">
        <div className="challenge-breadcrumb">
          <span>
            {isExam
              ? challengeMeta.examTitle || 'Chapter Exam'
              : `${challengeMeta.sessionTitle || 'Session'} • ${challengeMeta.lessonTitle || 'Lesson'}`}
          </span>
          <button
            type="button"
            className="challenge-breadcrumb__back"
            onClick={onBackToCourse}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Course
          </button>
        </div>

        <div className="challenge-title-row">
          <h2 className="challenge-header-title">{challenge.title}</h2>
          <StatusBadge
            label={challenge.difficulty || 'beginner'}
            variant={difficultyVariant(challenge.difficulty)}
          />
        </div>

        {/* Exam Stepper Banner if in Exam Mode */}
        {isExam && (
          <div className="exam-stepper-banner">
            <span className="exam-stepper__info">
              Question {(challengeMeta.examQuestionIndex || 0) + 1} of{' '}
              {challengeMeta.totalExamQuestions || 4}
            </span>
            <div className="exam-stepper__nav">
              <button
                type="button"
                className="btn-exam-step"
                onClick={onPrevQuestion}
                disabled={!hasPrev}
              >
                ◀ Prev
              </button>
              <button
                type="button"
                className="btn-exam-step"
                onClick={onNextQuestion}
                disabled={!hasNext}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Tabs Navigation */}
      <nav className="challenge-tabs-nav">
        <button
          type="button"
          className={`challenge-tab-btn ${activeTab === 'tests' ? 'challenge-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <span>🎯</span> Tests & Results
        </button>
        <button
          type="button"
          className={`challenge-tab-btn ${activeTab === 'hints' ? 'challenge-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('hints')}
        >
          <span>💡</span> Hints
        </button>
        <button
          type="button"
          className={`challenge-tab-btn ${activeTab === 'tutor' ? 'challenge-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tutor')}
        >
          <span>🤖</span> AI Tutor
        </button>
      </nav>

      {/* 3. Panel Body Content */}
      <div className="challenge-panel-content">
        {/* Problem Statement Box */}
        <div className="challenge-desc-box">{challenge.description}</div>

        {/* Action Controls */}
        <div className="challenge-actions-strip">
          <button
            type="button"
            className="btn-run-evaluation"
            onClick={handleEvaluate}
            disabled={isEvaluating}
          >
            {isEvaluating ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run & Evaluate Tests</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-reset-starter"
            onClick={handleResetStarter}
            title="Reset code to original starter template"
          >
            Reset
          </button>
        </div>

        {/* Success Banner if All Tests Passed */}
        {evaluationResult?.passed_all && (
          <div className="challenge-success-banner">
            <span className="success-banner__text">
              🎉 100% Passed! All {evaluationResult.total_tests} test cases matched.
            </span>
            {hasNext && (
              <button
                type="button"
                className="btn-exam-step"
                style={{ background: '#10b981', color: '#fff' }}
                onClick={onNextQuestion}
              >
                Next Challenge ➔
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Test Cases & Execution Results */}
        {activeTab === 'tests' && (
          <section className="test-cases-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8' }}>
                Test Cases ({challenge.test_cases?.length || 0})
              </span>
              {evaluationResult && (
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: evaluationResult.passed_all ? '#34d399' : '#f87171',
                  }}
                >
                  Score: {evaluationResult.score_percentage}%
                </span>
              )}
            </div>

            <div className="test-cases-list">
              {challenge.test_cases?.map((tc, idx) => {
                const tcResult = evaluationResult?.test_results?.find(
                  (r) => r.test_case_id === tc.id
                );

                return (
                  <div key={tc.id || idx} className="test-case-item">
                    <div className="test-case-item__header">
                      <span className="test-case-title">
                        {tc.description || `Test Case #${idx + 1}`}
                        {tc.is_hidden && (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '6px' }}>
                            (Hidden)
                          </span>
                        )}
                      </span>

                      {tcResult ? (
                        <StatusBadge
                          label={tcResult.passed ? 'PASSED' : 'FAILED'}
                          variant={tcResult.passed ? 'success' : 'error'}
                        />
                      ) : (
                        <StatusBadge label="READY" variant="neutral" />
                      )}
                    </div>

                    {!tc.is_hidden && (
                      <div className="test-case-diff-grid">
                        <div>
                          <div className="diff-col__label">Expected:</div>
                          <div className="diff-col__val">{tc.expected_output || '[Empty]'}</div>
                        </div>
                        <div>
                          <div className="diff-col__label">Actual:</div>
                          <div className="diff-col__val">
                            {tcResult ? tcResult.actual_output || '[No output]' : '—'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 2: 3-Tier Progressive Hints */}
        {activeTab === 'hints' && (
          <section className="tiered-hints-view">
            {/* Level 1: Conceptual Nudge */}
            <div className="hint-tier-card">
              <div className="hint-tier-card__header">
                <span className="hint-tier-label">Level 1: Conceptual Nudge</span>
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Unlocked</span>
              </div>
              <div className="hint-tier-card__body">
                {challenge.hints?.level_1_nudge || 'Think about the problem input and output format.'}
              </div>
            </div>

            {/* Level 2: Strategy Approach */}
            <div className="hint-tier-card">
              <div
                className="hint-tier-card__header"
                onClick={() => handleUnlockHint(2)}
              >
                <span className="hint-tier-label">Level 2: Strategic Approach</span>
                {unlockedHintLevels.has(2) ? (
                  <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Unlocked</span>
                ) : (
                  <button type="button" className="btn-exam-step">
                    Reveal Hint ➔
                  </button>
                )}
              </div>
              {unlockedHintLevels.has(2) && (
                <div className="hint-tier-card__body">
                  {challenge.hints?.level_2_strategy || 'Break the calculation into discrete steps.'}
                </div>
              )}
            </div>

            {/* Level 3: Structural Clue */}
            <div className="hint-tier-card">
              <div
                className="hint-tier-card__header"
                onClick={() => handleUnlockHint(3)}
              >
                <span className="hint-tier-label">Level 3: Structural Clue</span>
                {unlockedHintLevels.has(3) ? (
                  <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Unlocked</span>
                ) : (
                  <button type="button" className="btn-exam-step">
                    Reveal Clue ➔
                  </button>
                )}
              </div>
              {unlockedHintLevels.has(3) && (
                <div className="hint-tier-card__body" style={{ fontFamily: 'monospace' }}>
                  {challenge.hints?.level_3_clue || 'Review loop syntax and variable assignments.'}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Socratic AI Tutor */}
        {activeTab === 'tutor' && (
          <section className="ai-tutor-course-tab" style={{ padding: 0, height: '100%' }}>
            <AITutorPanel
              code={code}
              activeTask={challenge}
              evaluationResult={evaluationResult}
            />
          </section>
        )}
      </div>
    </aside>
  );
}
