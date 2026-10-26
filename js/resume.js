/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * resume.js
 * Controller for Resume Bullet Improver page.
 * Analyzes bullet points, highlights issues, enforces truthfulness confirmation,
 * and maintains up to 10 saved drafts.
 */

import { analyzeBullet, buildRewriteTemplate, ACTION_VERBS } from './resume-rules.js';
import { saveResumeDrafts, getResumeDrafts } from './storage.js';

let selectedVerb = 'Built';
let currentAnalysis = null;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setupInputHandlers();
    setupActionVerbButtons();
    setupDraftHandlers();
    renderSavedDrafts();
  });
}

function setupInputHandlers() {
  const input = document.getElementById('bullet-input');
  const counter = document.getElementById('bullet-char-counter');
  const checkBtn = document.getElementById('check-bullet-btn');

  if (input && counter) {
    input.addEventListener('input', () => {
      const len = input.value.trim().length;
      counter.textContent = `${len} characters (ideal: 80–180)`;
      if (len < 40 || len > 200) {
        counter.className = 'text-[11px] font-mono text-amber-400';
      } else {
        counter.className = 'text-[11px] font-mono text-emerald-400';
      }
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', handleCheckBullet);
  }
}

function setupActionVerbButtons() {
  const container = document.getElementById('action-verbs-container');
  if (!container) return;

  container.innerHTML = '';
  ACTION_VERBS.forEach((verb) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `px-2.5 py-1 rounded text-xs font-mono transition-smooth ${
      verb === selectedVerb
        ? 'bg-blue-600 text-white font-bold'
        : 'bg-[#0B0F17] text-slate-400 border border-[#1F2937] hover:text-white'
    }`;
    btn.textContent = verb;

    btn.addEventListener('click', () => {
      selectedVerb = verb;
      setupActionVerbButtons();
      if (currentAnalysis) {
        updateRewriteTemplate();
      }
    });

    container.appendChild(btn);
  });
}

function handleCheckBullet() {
  const input = document.getElementById('bullet-input');
  const text = input ? input.value.trim() : '';

  if (!text) {
    alert('Please enter a resume bullet first.');
    return;
  }

  const analysis = analyzeBullet(text);
  currentAnalysis = { text, analysis };

  const resultsPanel = document.getElementById('analysis-results-panel');
  if (resultsPanel) resultsPanel.classList.remove('hidden');

  // Render Issues List safely
  const issuesContainer = document.getElementById('issues-list');
  const statusBadge = document.getElementById('analysis-status-badge');

  if (statusBadge) {
    if (analysis.issues.length === 0) {
      statusBadge.textContent = 'Solid Bullet (No Major Flaws)';
      statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    } else {
      statusBadge.textContent = `${analysis.issues.length} Improvement(s) Detected`;
      statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  }

  if (issuesContainer) {
    issuesContainer.innerHTML = '';
    if (analysis.issues.length === 0) {
      const p = document.createElement('p');
      p.className = 'text-xs text-emerald-300';
      p.textContent = 'No critical anti-patterns found. Make sure you can defend every technical word in this bullet during interviews.';
      issuesContainer.appendChild(p);
    } else {
      analysis.issues.forEach((issue) => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded bg-[#0B0F17] border border-[#1F2937] text-xs space-y-0.5';

        const title = document.createElement('div');
        title.className = 'text-amber-400 font-bold text-[11px]';
        title.textContent = issue.type.replace(/_/g, ' ');

        const desc = document.createElement('p');
        desc.className = 'text-slate-300 text-[11px]';
        desc.textContent = issue.message;

        item.appendChild(title);
        item.appendChild(desc);
        issuesContainer.appendChild(item);
      });
    }
  }

  updateRewriteTemplate();
}

function updateRewriteTemplate() {
  if (!currentAnalysis) return;
  const { template } = buildRewriteTemplate(currentAnalysis.text, currentAnalysis.analysis.detectedTech, selectedVerb);

  const templateBox = document.getElementById('rewrite-template-display');
  const customizedInput = document.getElementById('customized-bullet-input');

  if (templateBox) {
    templateBox.textContent = template;
  }

  if (customizedInput && !customizedInput.value) {
    customizedInput.value = template;
  }
}

function setupDraftHandlers() {
  const saveBtn = document.getElementById('save-draft-btn');
  const copyBtn = document.getElementById('copy-final-btn');
  const confirmCheckbox = document.getElementById('confirm-truth-checkbox');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const finalInput = document.getElementById('customized-bullet-input');
      const text = finalInput ? finalInput.value.trim() : '';

      if (!text) return;
      if (confirmCheckbox && !confirmCheckbox.checked) {
        alert('Please check the confirmation box: "I confirm every claim in this bullet is true" before copying.');
        return;
      }

      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Bullet';
        }, 2000);
      });
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const finalInput = document.getElementById('customized-bullet-input');
      const text = finalInput ? finalInput.value.trim() : '';

      if (!text) {
        alert('Cannot save empty bullet.');
        return;
      }

      if (confirmCheckbox && !confirmCheckbox.checked) {
        alert('Please check the confirmation box: "I confirm every claim in this bullet is true" before saving.');
        return;
      }

      const drafts = getResumeDrafts();
      drafts.unshift({
        id: 'draft-' + Date.now(),
        text,
        savedAt: new Date().toLocaleDateString()
      });

      saveResumeDrafts(drafts);
      renderSavedDrafts();
      alert('Draft saved to storage!');
    });
  }
}

function renderSavedDrafts() {
  const container = document.getElementById('saved-drafts-list');
  const countBadge = document.getElementById('drafts-count-badge');
  if (!container) return;

  const drafts = getResumeDrafts();
  if (countBadge) countBadge.textContent = `${drafts.length} / 10 drafts`;

  container.innerHTML = '';
  if (drafts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-xs text-slate-500 italic p-3';
    empty.textContent = 'No saved drafts yet. Check and refine a bullet to save it here.';
    container.appendChild(empty);
    return;
  }

  drafts.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg bg-[#0B0F17] border border-[#1F2937] space-y-2';

    const p = document.createElement('p');
    p.className = 'text-xs text-slate-200 leading-relaxed font-sans';
    p.textContent = d.text;

    const row = document.createElement('div');
    row.className = 'flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-[#1F2937]/50';

    const date = document.createElement('span');
    date.textContent = d.savedAt || 'Saved';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'flex items-center gap-2';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'text-blue-400 hover:text-blue-300';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(d.text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'text-red-400 hover:text-red-300';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      const filtered = drafts.filter((item) => item.id !== d.id);
      saveResumeDrafts(filtered);
      renderSavedDrafts();
    });

    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(delBtn);

    row.appendChild(date);
    row.appendChild(btnGroup);

    card.appendChild(p);
    card.appendChild(row);
    container.appendChild(card);
  });
}
