/**
 * storage.js
 * Centralized localStorage management for ProjectDefense.
 * All reads and writes for profile, checklist, defense, attempts, sprint, and resume drafts.
 */

const PROFILE_STORAGE_KEY = 'projectdefense.profile.v1';
const CHECKLIST_STORAGE_KEY = 'projectdefense.checklist.v1';
const DEFENSE_STORAGE_KEY = 'projectdefense.defense.v1';
const ATTEMPTS_STORAGE_KEY = 'projectdefense.attempts.v1';
const SPRINT_STORAGE_KEY = 'projectdefense.sprint.v1';
const RESUME_STORAGE_KEY = 'projectdefense.resume.v1';
const CODE_DRAFT_PREFIX = 'projectdefense.code.v1.';

// ==========================================
// Profile Storage
// ==========================================
export function saveProfile(profile) {
  try {
    const payload = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error parsing profile:', error);
    return null;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing profile:', error);
    return false;
  }
}

/**
 * Clears ALL projectdefense.* data from localStorage (Phase 4 pilot reset).
 */
export function clearAllData() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('projectdefense.')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

// ==========================================
// Phase 1 Readiness Checklist Storage
// ==========================================
export function saveChecklist(checkedIndices) {
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIndices));
    return true;
  } catch (error) {
    console.error('Error saving checklist:', error);
    return false;
  }
}

export function getChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing checklist:', error);
    return [];
  }
}

// ==========================================
// Phase 2 Defense Storage
// ==========================================
export function saveDefenseResult(result) {
  try {
    const payload = {
      ...result,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DEFENSE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error saving defense result:', error);
    return false;
  }
}

export function getDefenseResult() {
  try {
    const raw = localStorage.getItem(DEFENSE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error parsing defense result:', error);
    return null;
  }
}

// ==========================================
// Phase 3: Coding Attempts Storage
// ==========================================
export function saveAttempt(attempt) {
  try {
    const attempts = getAttempts();
    const payload = {
      ...attempt,
      timestamp: new Date().toISOString()
    };
    attempts.unshift(payload); // Newest first
    // Cap stored attempts at 100 to conserve storage
    if (attempts.length > 100) attempts.length = 100;
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('Error saving attempt:', error);
    return false;
  }
}

export function getAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing attempts:', error);
    return [];
  }
}

// Last code per problem persistence
export function saveProblemCode(problemId, code) {
  try {
    localStorage.setItem(`${CODE_DRAFT_PREFIX}${problemId}`, code);
    return true;
  } catch (error) {
    console.error('Error saving problem code:', error);
    return false;
  }
}

export function getProblemCode(problemId) {
  try {
    return localStorage.getItem(`${CODE_DRAFT_PREFIX}${problemId}`);
  } catch (error) {
    console.error('Error getting problem code:', error);
    return null;
  }
}

// ==========================================
// Phase 3: 30-Day Sprint Storage
// ==========================================
export function saveSprintProgress(sprintData) {
  try {
    localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprintData));
    return true;
  } catch (error) {
    console.error('Error saving sprint progress:', error);
    return false;
  }
}

export function getSprintProgress() {
  try {
    const raw = localStorage.getItem(SPRINT_STORAGE_KEY);
    if (!raw) {
      return {
        completedTasks: {}, // { "day-1-task-0": true, ... }
        sqlCompleted: {},   // { "sql-0": true, ... }
        lastActiveDate: null,
        streak: 0
      };
    }
    const parsed = JSON.parse(raw);
    return {
      completedTasks: parsed.completedTasks || {},
      sqlCompleted: parsed.sqlCompleted || {},
      lastActiveDate: parsed.lastActiveDate || null,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0
    };
  } catch (error) {
    console.error('Error parsing sprint progress:', error);
    return {
      completedTasks: {},
      sqlCompleted: {},
      lastActiveDate: null,
      streak: 0
    };
  }
}

// ==========================================
// Phase 3: Resume Drafts Storage (Max 10)
// ==========================================
export function saveResumeDrafts(drafts) {
  try {
    const trimmed = (drafts || []).slice(0, 10);
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Error saving resume drafts:', error);
    return false;
  }
}

export function getResumeDrafts() {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing resume drafts:', error);
    return [];
  }
}
