/**
 * dashboard.js
 * Renders the saved profile, readiness checklist, dynamic score, and next steps.
 */

import { getProfile, clearProfile, clearAllData, getChecklist, saveChecklist, getAttempts, getSprintProgress } from './storage.js';

const CHECKLIST_ITEMS = [
  'Projects are deployed with a live link',
  'Each project has a README',
  'At least one project uses a backend or API',
  'Resume bullets include measurable results',
  'Can explain one project in 2 minutes',
  'Practiced 10+ coding problems without AI',
  'Completed at least one internship or real project work'
];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const noProfileState = document.getElementById('no-profile-state');
    const hasProfileState = document.getElementById('has-profile-state');
    const clearBtn = document.getElementById('dash-clear-btn');
    const resetAllBtn = document.getElementById('dash-reset-all-btn');

    const profile = getProfile();

    if (!profile) {
      if (noProfileState) noProfileState.classList.remove('hidden');
      if (hasProfileState) hasProfileState.classList.add('hidden');
      return;
    }

    // Profile is present
    if (noProfileState) noProfileState.classList.add('hidden');
    if (hasProfileState) hasProfileState.classList.remove('hidden');

    renderProfileData(profile);
    renderPracticeStats();
    initChecklist();

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const confirmed = window.confirm('Are you sure you want to delete your profile?');
        if (confirmed) {
          clearProfile();
          window.location.reload();
        }
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        const confirmed = window.confirm('Are you sure you want to RESET ALL DATA? This will permanently delete your profile, checklist, coding attempts, and saved drafts.');
        if (confirmed) {
          clearAllData();
          window.location.reload();
        }
      });
    }
  });
}

function renderPracticeStats() {
  const attempts = getAttempts();
  const sprint = getSprintProgress();

  const attemptsCountEl = document.getElementById('dash-attempts-count');
  const sprintCountEl = document.getElementById('dash-sprint-count');

  if (attemptsCountEl) {
    attemptsCountEl.textContent = `${attempts.length} attempts`;
  }

  if (sprintCountEl) {
    const tasksDone = Object.keys(sprint.completedTasks || {}).length;
    sprintCountEl.textContent = `${tasksDone} tasks done (${sprint.streak || 0}d streak)`;
  }
}

/**
 * Safely renders user profile data using textContent to prevent XSS.
 * @param {Object} profile 
 */
function renderProfileData(profile) {
  const welcomeEl = document.getElementById('dash-welcome-text');
  if (welcomeEl) {
    welcomeEl.textContent = `Hi ${profile.fullName}, here's your readiness snapshot.`;
  }

  setTextSafe('val-name', profile.fullName);
  setTextSafe('val-college', profile.college || 'Not specified');
  setTextSafe('val-branch', profile.branch);
  setTextSafe('val-year', profile.year);
  setTextSafe('val-role', profile.targetRole);
  setTextSafe('val-projects', String(profile.projectCount));
  setTextSafe('val-internship', profile.internship === 'Yes' ? 'Completed' : 'None yet');
  setTextSafe('val-lang', profile.mainLanguage);
}

/**
 * Initializes the 7-item readiness checklist and event listeners.
 */
function initChecklist() {
  const container = document.getElementById('checklist-items');
  if (!container) return;

  container.innerHTML = '';
  const savedIndices = getChecklist();

  CHECKLIST_ITEMS.forEach((text, index) => {
    const isChecked = savedIndices.includes(index);

    const label = document.createElement('label');
    label.className = 'flex items-start gap-3 p-3 rounded-lg border border-[#1F2937] bg-[#0B0F17]/40 hover:bg-[#111827] cursor-pointer transition-smooth';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mt-0.5 rounded bg-[#111827] border-[#1F2937] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#0B0F17]';
    checkbox.checked = isChecked;
    checkbox.dataset.index = index;

    checkbox.addEventListener('change', () => {
      handleChecklistChange();
    });

    const span = document.createElement('span');
    span.className = 'text-xs sm:text-sm text-slate-300 select-none';
    span.textContent = text;

    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });

  updateScoreUI(savedIndices.length, CHECKLIST_ITEMS.length);
}

/**
 * Updates stored checklist on change and recalculates score.
 */
function handleChecklistChange() {
  const checkboxes = document.querySelectorAll('#checklist-items input[type="checkbox"]');
  const checkedIndices = [];

  checkboxes.forEach((cb) => {
    if (cb.checked) {
      checkedIndices.push(parseInt(cb.dataset.index, 10));
    }
  });

  saveChecklist(checkedIndices);
  updateScoreUI(checkedIndices.length, CHECKLIST_ITEMS.length);
}

/**
 * Updates score percentage, progress bar, and suggested next step.
 */
function updateScoreUI(checkedCount, totalCount) {
  const percent = Math.round((checkedCount / totalCount) * 100);

  const scoreText = document.getElementById('readiness-score-text');
  const progressBar = document.getElementById('readiness-progress-bar');
  const suggestionText = document.getElementById('readiness-suggestion-text');

  if (scoreText) {
    scoreText.textContent = `${percent}% (${checkedCount} of ${totalCount} items)`;
  }

  if (progressBar) {
    progressBar.style.width = `${percent}%`;

    // Dynamic bar color based on score
    if (percent < 40) {
      progressBar.className = 'h-full bg-amber-500 transition-all duration-300';
    } else if (percent < 70) {
      progressBar.className = 'h-full bg-blue-500 transition-all duration-300';
    } else {
      progressBar.className = 'h-full bg-emerald-500 transition-all duration-300';
    }
  }

  if (suggestionText) {
    if (percent < 40) {
      suggestionText.textContent = 'Start with a deployed project and a README.';
    } else if (percent < 70) {
      suggestionText.textContent = 'Practice explaining your project and solving problems without AI.';
    } else {
      suggestionText.textContent = 'Focus on mock interviews and targeted applications.';
    }
  }
}

function setTextSafe(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}
