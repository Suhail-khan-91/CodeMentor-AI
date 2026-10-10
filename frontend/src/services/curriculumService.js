/**
 * curriculumService.js — Client-Side Course Curriculum Engine (Phase B1).
 *
 * Manages course catalogs, module schemas, interactive lessons, practice challenges,
 * and persistent student learning progress in localStorage.
 *
 * Emits custom 'curriculum-progress-updated' window events on completion state changes
 * to keep UI badges, progress bars, and stats in sync.
 */

import catalogData from '../data/curriculum/index.json';
import module1Data from '../data/curriculum/module1_fundamentals.json';

// Registry of statically loaded and future modules
const MODULE_REGISTRY = {
  module_1: module1Data,
};

const STORAGE_KEY = 'codementor_curriculum_progress_v1';

/**
 * Retrieve raw saved progress from localStorage.
 */
function loadProgressFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[CurriculumService] Failed to parse stored progress:', err);
  }
  return {
    completedLessons: [],
    solvedChallenges: [],
    challengeScores: {},
    examAttempts: {},
    lastActive: {
      moduleId: 'module_1',
      sessionId: 'session_01',
      lessonId: 'lesson_01_01',
    },
  };
}

/**
 * Persist progress state to localStorage and broadcast change event.
 */
function saveProgressToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('curriculum-progress-updated', { detail: state }));
  } catch (err) {
    console.warn('[CurriculumService] Failed to save progress:', err);
  }
}

/**
 * Get the master course catalog enriched with student progress metrics.
 */
export function getCourseCatalog() {
  const progress = loadProgressFromStorage();
  const completedLessonsSet = new Set(progress.completedLessons || []);
  const solvedChallengesSet = new Set(progress.solvedChallenges || []);

  let totalLessonsInCourse = 0;
  let totalChallengesInCourse = 0;

  // Enrich module cards with progress
  const modules = catalogData.modules.map((mod, index) => {
    const modData = MODULE_REGISTRY[mod.id];
    const isAvailable = Boolean(modData);

    let lessonCount = 0;
    let challengeCount = 0;
    let completedLessonCount = 0;
    let solvedChallengeCount = 0;

    if (modData && modData.sessions) {
      modData.sessions.forEach((s) => {
        (s.lessons || []).forEach((l) => {
          lessonCount += 1;
          if (completedLessonsSet.has(l.lesson_id)) {
            completedLessonCount += 1;
          }
          const challenges = l.practice_challenges || [];
          challengeCount += challenges.length;
          challenges.forEach((c) => {
            if (solvedChallengesSet.has(c.id)) {
              solvedChallengeCount += 1;
            }
          });
        });
      });
    }

    totalLessonsInCourse += lessonCount;
    totalChallengesInCourse += challengeCount;

    const progressPercentage = lessonCount > 0 ? Math.round((completedLessonCount / lessonCount) * 100) : 0;
    const examProgress = progress.examAttempts?.[`exam_${mod.id}`] || null;

    // Module 1 is always unlocked. Subsequent modules unlock when previous exam passed or available.
    const isUnlocked = index === 0 || isAvailable;

    return {
      ...mod,
      isAvailable,
      isUnlocked,
      lessonCount,
      challengeCount,
      completedLessonCount,
      solvedChallengeCount,
      progressPercentage,
      examPassed: examProgress?.passed || false,
      examScore: examProgress?.bestScore || null,
    };
  });

  const overallCompletedLessons = completedLessonsSet.size;
  const overallProgressPercentage =
    totalLessonsInCourse > 0 ? Math.round((overallCompletedLessons / totalLessonsInCourse) * 100) : 0;

  return {
    ...catalogData,
    modules,
    stats: {
      totalLessons: totalLessonsInCourse,
      completedLessons: overallCompletedLessons,
      totalChallenges: totalChallengesInCourse,
      solvedChallenges: solvedChallengesSet.size,
      overallProgressPercentage,
      lastActive: progress.lastActive,
    },
  };
}

/**
 * Retrieve module details by module identifier.
 *
 * @param {string} moduleId - e.g. "module_1"
 * @returns {object|null}
 */
export function getModule(moduleId) {
  const modData = MODULE_REGISTRY[moduleId];
  if (!modData) return null;

  const progress = loadProgressFromStorage();
  const completedLessonsSet = new Set(progress.completedLessons || []);
  const solvedChallengesSet = new Set(progress.solvedChallenges || []);

  const enrichedSessions = (modData.sessions || []).map((session) => {
    let sessionLessons = session.lessons || [];
    let completedInSession = 0;

    const enrichedLessons = sessionLessons.map((lesson) => {
      const isCompleted = completedLessonsSet.has(lesson.lesson_id);
      if (isCompleted) completedInSession += 1;

      const enrichedChallenges = (lesson.practice_challenges || []).map((chal) => ({
        ...chal,
        isSolved: solvedChallengesSet.has(chal.id),
        bestScore: progress.challengeScores?.[chal.id] || null,
      }));

      return {
        ...lesson,
        isCompleted,
        practice_challenges: enrichedChallenges,
      };
    });

    return {
      ...session,
      lessons: enrichedLessons,
      isCompleted: sessionLessons.length > 0 && completedInSession === sessionLessons.length,
      completedCount: completedInSession,
      totalCount: sessionLessons.length,
    };
  });

  const exam = modData.chapter_exam || null;
  const examAttempt = progress.examAttempts?.[exam?.exam_id] || null;

  return {
    ...modData,
    sessions: enrichedSessions,
    chapter_exam: exam
      ? {
          ...exam,
          attempt: examAttempt,
          isPassed: examAttempt?.passed || false,
        }
      : null,
  };
}

/**
 * Retrieve a single lesson by module and lesson ID.
 */
export function getLesson(moduleId, lessonId) {
  const mod = getModule(moduleId);
  if (!mod) return null;

  for (const session of mod.sessions) {
    for (const lesson of session.lessons) {
      if (lesson.lesson_id === lessonId) {
        return {
          lesson,
          session: {
            session_id: session.session_id,
            session_number: session.session_number,
            title: session.title,
            video_url: session.video_url,
            notebook_file: session.notebook_file,
          },
          module: {
            module_id: mod.module_id,
            module_number: mod.module_number,
            title: mod.title,
          },
        };
      }
    }
  }
  return null;
}

/**
 * Find a practice challenge or exam question by its ID across all modules.
 *
 * @param {string} challengeId
 * @returns {object|null}
 */
export function findChallengeById(challengeId) {
  for (const [modId, modData] of Object.entries(MODULE_REGISTRY)) {
    // Check lessons
    for (const session of modData.sessions || []) {
      for (const lesson of session.lessons || []) {
        for (const chal of lesson.practice_challenges || []) {
          if (chal.id === challengeId) {
            return {
              challenge: chal,
              type: 'lesson_practice',
              moduleId: modId,
              sessionId: session.session_id,
              lessonId: lesson.lesson_id,
              sessionTitle: session.title,
              lessonTitle: lesson.title,
            };
          }
        }
      }
    }
    // Check chapter exam
    if (modData.chapter_exam && modData.chapter_exam.questions) {
      for (const q of modData.chapter_exam.questions) {
        if (q.id === challengeId) {
          return {
            challenge: q,
            type: 'chapter_exam',
            moduleId: modId,
            examId: modData.chapter_exam.exam_id,
            examTitle: modData.chapter_exam.title,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Mark a lesson as completed by the student.
 *
 * @param {string} lessonId
 */
export function markLessonComplete(lessonId) {
  const progress = loadProgressFromStorage();
  const set = new Set(progress.completedLessons || []);
  set.add(lessonId);
  progress.completedLessons = Array.from(set);
  saveProgressToStorage(progress);
}

/**
 * Mark a challenge as solved and store its best score.
 *
 * @param {string} challengeId
 * @param {number} [scorePercentage=100]
 */
export function markChallengeSolved(challengeId, scorePercentage = 100) {
  const progress = loadProgressFromStorage();
  const set = new Set(progress.solvedChallenges || []);
  set.add(challengeId);
  progress.solvedChallenges = Array.from(set);

  progress.challengeScores = progress.challengeScores || {};
  const prevBest = progress.challengeScores[challengeId] || 0;
  if (scorePercentage > prevBest) {
    progress.challengeScores[challengeId] = scorePercentage;
  }

  saveProgressToStorage(progress);
}

/**
 * Record an attempt at a Chapter Exam.
 *
 * @param {string} examId
 * @param {number} scorePercentage
 * @param {boolean} passed
 */
export function recordExamAttempt(examId, scorePercentage, passed) {
  const progress = loadProgressFromStorage();
  progress.examAttempts = progress.examAttempts || {};

  const prev = progress.examAttempts[examId] || {
    bestScore: 0,
    attemptsCount: 0,
    passed: false,
  };

  progress.examAttempts[examId] = {
    bestScore: Math.max(prev.bestScore, scorePercentage),
    latestScore: scorePercentage,
    attemptsCount: prev.attemptsCount + 1,
    passed: prev.passed || passed,
    lastAttemptAt: new Date().toISOString(),
  };

  saveProgressToStorage(progress);
}

/**
 * Update student's last active learning location.
 */
export function setLastActivePosition(moduleId, sessionId, lessonId) {
  const progress = loadProgressFromStorage();
  progress.lastActive = { moduleId, sessionId, lessonId };
  saveProgressToStorage(progress);
}

/**
 * Retrieve raw current progress state.
 */
export function getRawCurriculumProgress() {
  return loadProgressFromStorage();
}

/**
 * Reset progress (for testing / demo purposes).
 */
export function resetCurriculumProgress() {
  const blank = {
    completedLessons: [],
    solvedChallenges: [],
    challengeScores: {},
    examAttempts: {},
    lastActive: {
      moduleId: 'module_1',
      sessionId: 'session_01',
      lessonId: 'lesson_01_01',
    },
  };
  saveProgressToStorage(blank);
}
