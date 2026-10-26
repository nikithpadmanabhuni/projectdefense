/**
 * storage.js
 * Centralized storage management for ProjectDefense.
 * Automatically detects localStorage restrictions (private mode, quota errors)
 * and falls back to an in-memory storage dictionary with the same API.
 * Displays a non-intrusive banner when operating in restricted storage mode.
 */

const PROFILE_STORAGE_KEY = 'projectdefense.profile.v1';
const CHECKLIST_STORAGE_KEY = 'projectdefense.checklist.v1';
const DEFENSE_STORAGE_KEY = 'projectdefense.defense.v1';
const ATTEMPTS_STORAGE_KEY = 'projectdefense.attempts.v1';
const SPRINT_STORAGE_KEY = 'projectdefense.sprint.v1';
const RESUME_STORAGE_KEY = 'projectdefense.resume.v1';
const CERTIFICATE_STORAGE_KEY = 'projectdefense.certificate.v1';
const CODE_DRAFT_PREFIX = 'projectdefense.code.v1.';

// In-memory storage dictionary for private/blocked mode
const inMemoryStore = new Map();
let isInMemoryActive = false;

const memoryStorage = {
  getItem(key) {
    return inMemoryStore.has(key) ? inMemoryStore.get(key) : null;
  },
  setItem(key, value) {
    inMemoryStore.set(key, String(value));
  },
  removeItem(key) {
    inMemoryStore.delete(key);
  },
  key(index) {
    const keys = Array.from(inMemoryStore.keys());
    return keys[index] || null;
  },
  get length() {
    return inMemoryStore.size;
  },
  clear() {
    inMemoryStore.clear();
  }
};

/**
 * Returns either window.localStorage or memoryStorage fallback.
 */
function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const test = '__pd_storage_check__';
      window.localStorage.setItem(test, '1');
      window.localStorage.removeItem(test);
      return window.localStorage;
    }
  } catch (e) {
    // Falls back to in-memory below
  }

  if (!isInMemoryActive) {
    isInMemoryActive = true;
    showStorageWarningBanner();
  }
  return memoryStorage;
}

export function isStorageInMemory() {
  getStorage();
  return isInMemoryActive;
}

/**
 * Displays a warning banner when localStorage is blocked.
 */
function showStorageWarningBanner() {
  if (typeof document === 'undefined') return;

  const show = () => {
    if (document.getElementById('storage-warning-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'storage-warning-banner';
    banner.className = 'w-full bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 text-center font-medium sticky top-0 z-[60] flex items-center justify-center gap-2';
    
    const icon = document.createElement('span');
    icon.textContent = '⚠️';
    const text = document.createElement('span');
    text.textContent = 'Your progress will not be saved in this browser window (private browsing or storage restricted).';

    banner.appendChild(icon);
    banner.appendChild(text);

    if (document.body.firstChild) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      document.body.appendChild(banner);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
}

// ==========================================
// Profile Storage
// ==========================================
export function saveProfile(profile) {
  try {
    const payload = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    getStorage().setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
}

export function getProfile() {
  try {
    const raw = getStorage().getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error parsing profile:', error);
    return null;
  }
}

export function clearProfile() {
  try {
    getStorage().removeItem(PROFILE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing profile:', error);
    return false;
  }
}

/**
 * Clears ALL projectdefense.* data from storage.
 */
export function clearAllData() {
  try {
    const store = getStorage();
    const keysToRemove = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && key.startsWith('projectdefense.')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => store.removeItem(k));
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
    getStorage().setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIndices));
    return true;
  } catch (error) {
    console.error('Error saving checklist:', error);
    return false;
  }
}

export function getChecklist() {
  try {
    const raw = getStorage().getItem(CHECKLIST_STORAGE_KEY);
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
    getStorage().setItem(DEFENSE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error saving defense result:', error);
    return false;
  }
}

export function getDefenseResult() {
  try {
    const raw = getStorage().getItem(DEFENSE_STORAGE_KEY);
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
    if (attempts.length > 100) attempts.length = 100;
    getStorage().setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('Error saving attempt:', error);
    return false;
  }
}

export function getAttempts() {
  try {
    const raw = getStorage().getItem(ATTEMPTS_STORAGE_KEY);
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
    getStorage().setItem(`${CODE_DRAFT_PREFIX}${problemId}`, code);
    return true;
  } catch (error) {
    console.error('Error saving problem code:', error);
    return false;
  }
}

export function getProblemCode(problemId) {
  try {
    return getStorage().getItem(`${CODE_DRAFT_PREFIX}${problemId}`);
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
    getStorage().setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprintData));
    return true;
  } catch (error) {
    console.error('Error saving sprint progress:', error);
    return false;
  }
}

export function getSprintProgress() {
  try {
    const raw = getStorage().getItem(SPRINT_STORAGE_KEY);
    if (!raw) {
      return {
        completedTasks: {},
        sqlCompleted: {},
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
    getStorage().setItem(RESUME_STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Error saving resume drafts:', error);
    return false;
  }
}

export function getResumeDrafts() {
  try {
    const raw = getStorage().getItem(RESUME_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing resume drafts:', error);
    return [];
  }
}

// ==========================================
// Verified Certificate Storage
// ==========================================
export function saveCertificate(cert) {
  try {
    getStorage().setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(cert));
    return true;
  } catch (error) {
    console.error('Error saving certificate:', error);
    return false;
  }
}

export function getCertificate() {
  try {
    const raw = getStorage().getItem(CERTIFICATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error parsing certificate:', error);
    return null;
  }
}
