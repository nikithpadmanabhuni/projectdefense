/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * coding.js
 * Controller for the No-AI Coding Practice environment.
 * Handles problem selection, Web Worker test running, timer countdown, strict mode, and attempt tracking.
 */

import { PROBLEMS } from './problems.js';
import { runTestSuite } from './runner.js';
import { saveAttempt, getAttempts, saveProblemCode, getProblemCode } from './storage.js';

let currentProblem = PROBLEMS[0];
let timerInterval = null;
let timerSecondsRemaining = 15 * 60;
let isTimerRunning = false;
let timerInitialMinutes = 15;
let timerStartTime = null;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initProblemFilters();
    renderProblemList();
    selectProblem(PROBLEMS[0].id);
    setupEditorEvents();
    setupTimerControls();
    setupLanguageSelector();
  });
}

// ==========================================
// 1. Problem List & Filtering
// ==========================================
function initProblemFilters() {
  const topicFilter = document.getElementById('filter-topic');
  const diffFilter = document.getElementById('filter-difficulty');

  if (topicFilter) {
    topicFilter.addEventListener('change', renderProblemList);
  }
  if (diffFilter) {
    diffFilter.addEventListener('change', renderProblemList);
  }
}

function renderProblemList() {
  const container = document.getElementById('problems-list');
  const topicVal = document.getElementById('filter-topic')?.value || 'all';
  const diffVal = document.getElementById('filter-difficulty')?.value || 'all';

  if (!container) return;
  container.innerHTML = '';

  const filtered = PROBLEMS.filter((p) => {
    const matchTopic = topicVal === 'all' || p.topic === topicVal;
    const matchDiff = diffVal === 'all' || p.difficulty === diffVal;
    return matchTopic && matchDiff;
  });

  const countBadge = document.getElementById('problems-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} of ${PROBLEMS.length} problems`;
  }

  filtered.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `w-full text-left p-3 rounded-lg border transition-smooth ${
      currentProblem && currentProblem.id === p.id
        ? 'border-blue-500 bg-blue-950/20 text-white'
        : 'border-[#1F2937] bg-[#111827] text-slate-300 hover:border-slate-600'
    }`;

    const top = document.createElement('div');
    top.className = 'flex items-center justify-between text-[11px] font-mono mb-1';

    const diff = document.createElement('span');
    diff.className = p.difficulty === 'Easy' ? 'text-emerald-400' : 'text-amber-400';
    diff.textContent = p.difficulty;

    const topic = document.createElement('span');
    topic.className = 'text-slate-500 truncate max-w-[120px]';
    topic.textContent = p.topic;

    top.appendChild(diff);
    top.appendChild(topic);

    const title = document.createElement('div');
    title.className = 'text-xs font-semibold truncate';
    title.textContent = p.title;

    btn.appendChild(top);
    btn.appendChild(title);

    btn.addEventListener('click', () => {
      selectProblem(p.id);
    });

    container.appendChild(btn);
  });
}

function selectProblem(id) {
  const p = PROBLEMS.find((item) => item.id === id);
  if (!p) return;
  currentProblem = p;

  // Update UI Elements safely using textContent
  setText('problem-title', p.title);
  setText('problem-topic', p.topic);
  setText('problem-difficulty', p.difficulty);
  setText('problem-statement', p.statement);

  const diffEl = document.getElementById('problem-difficulty');
  if (diffEl) {
    diffEl.className = p.difficulty === 'Easy'
      ? 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }

  // Concepts Tags
  const conceptsContainer = document.getElementById('problem-concepts');
  if (conceptsContainer) {
    conceptsContainer.innerHTML = '';
    p.concepts.forEach((c) => {
      const span = document.createElement('span');
      span.className = 'px-2 py-0.5 rounded text-[10px] font-mono bg-[#111827] border border-[#1F2937] text-slate-400';
      span.textContent = c;
      conceptsContainer.appendChild(span);
    });
  }

  // Visible Test Cases Display
  const visibleContainer = document.getElementById('visible-tests-display');
  if (visibleContainer) {
    visibleContainer.innerHTML = '';
    p.visibleTests.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'p-2.5 rounded bg-[#0B0F17] border border-[#1F2937] text-xs font-mono space-y-1';

      const label = document.createElement('div');
      label.className = 'text-slate-500 text-[10px] uppercase';
      label.textContent = `Example ${i + 1}`;

      const inp = document.createElement('div');
      inp.className = 'text-slate-300 truncate';
      inp.textContent = `Input: ${JSON.stringify(t.input)}`;

      const out = document.createElement('div');
      out.className = 'text-emerald-400 truncate';
      out.textContent = `Expected: ${JSON.stringify(t.expected)}`;

      div.appendChild(label);
      div.appendChild(inp);
      div.appendChild(out);
      visibleContainer.appendChild(div);
    });
  }

  // Load code from storage or default starter
  const savedCode = getProblemCode(p.id);
  const editor = document.getElementById('code-editor');
  if (editor) {
    editor.value = savedCode !== null ? savedCode : p.starterCode;
    editor.disabled = false;
  }

  // Clear previous execution output
  const outputEl = document.getElementById('execution-output');
  if (outputEl) {
    outputEl.textContent = 'Ready to test. Run visible tests or Submit to test hidden cases.';
    outputEl.className = 'p-3 rounded-lg bg-[#0B0F17] border border-[#1F2937] text-xs font-mono text-slate-400 whitespace-pre-wrap';
  }

  // Reset timer
  resetTimer();
  renderProblemList();
}

// ==========================================
// 2. Editor & Strict Mode Events
// ==========================================
function setupEditorEvents() {
  const editor = document.getElementById('code-editor');
  const strictToggle = document.getElementById('strict-mode-toggle');
  const runBtn = document.getElementById('run-visible-btn');
  const submitBtn = document.getElementById('submit-code-btn');

  if (editor) {
    // Preserve code on input (max 20,000 chars)
    editor.addEventListener('input', () => {
      if (editor.value.length > 20000) {
        editor.value = editor.value.slice(0, 20000);
      }
      if (currentProblem) {
        saveProblemCode(currentProblem.id, editor.value);
      }
    });

    // Paste prevention for Strict Mode
    editor.addEventListener('paste', (e) => {
      if (strictToggle && strictToggle.checked) {
        e.preventDefault();
        showToast('Strict Mode is ON: Pasting is disabled to practice raw recall.', 'info');
      }
    });

    // Drop prevention for Strict Mode
    editor.addEventListener('drop', (e) => {
      if (strictToggle && strictToggle.checked) {
        e.preventDefault();
      }
    });
  }

  // Run Visible Tests Only
  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      if (!currentProblem || !editor) return;
      setRunLoading(true);

      const code = editor.value;
      const tests = currentProblem.visibleTests.map((t) => ({ ...t, isHidden: false }));

      const res = await runTestSuite(code, tests);
      renderRunResults(res, false);
      setRunLoading(false);
    });
  }

  // Submit All Tests (Visible + Hidden)
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!currentProblem || !editor) return;
      setRunLoading(true);

      const code = editor.value;
      const allTests = [
        ...currentProblem.visibleTests.map((t) => ({ ...t, isHidden: false })),
        ...currentProblem.hiddenTests.map((t) => ({ ...t, isHidden: true }))
      ];

      const res = await runTestSuite(code, allTests);
      const timeTakenSec = timerStartTime ? Math.round((Date.now() - timerStartTime) / 1000) : 0;

      // Save attempt to storage
      saveAttempt({
        problemId: currentProblem.id,
        topic: currentProblem.topic,
        title: currentProblem.title,
        passed: res.passed,
        total: res.total,
        timeTakenSeconds: timeTakenSec,
        timedOut: res.timedOut
      });

      renderRunResults(res, true);
      setRunLoading(false);
    });
  }
}

function renderRunResults(res, isSubmit) {
  const outputEl = document.getElementById('execution-output');
  if (!outputEl) return;

  outputEl.innerHTML = '';

  const isFullPass = res.passed === res.total;
  outputEl.className = `p-3 rounded-lg border text-xs font-mono space-y-2 ${
    isFullPass
      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
      : 'bg-red-950/20 border-red-500/40 text-red-300'
  }`;

  const header = document.createElement('div');
  header.className = 'font-bold flex items-center justify-between';
  header.textContent = isFullPass
    ? `All ${res.passed}/${res.total} tests passed!`
    : `Failed: ${res.passed}/${res.total} tests passed.`;
  outputEl.appendChild(header);

  // If there are failures, list them safely
  if (res.failures.length > 0) {
    const list = document.createElement('div');
    list.className = 'space-y-1 text-slate-300 text-[11px] pt-1';

    res.failures.forEach((f) => {
      const item = document.createElement('div');
      item.textContent = f.message;
      list.appendChild(item);
    });
    outputEl.appendChild(list);

    // Study hints from concept tags
    if (currentProblem && currentProblem.concepts) {
      const hint = document.createElement('div');
      hint.className = 'pt-2 border-t border-[#1F2937] text-[11px] text-amber-400';
      hint.textContent = `Concept hint: review ${currentProblem.concepts.join(', ')}.`;
      outputEl.appendChild(hint);
    }
  }

  if (isSubmit && isFullPass) {
    showToast('Attempt recorded successfully!', 'success');
  }
}

// ==========================================
// 3. Timer Countdown
// ==========================================
function setupTimerControls() {
  const timerSelect = document.getElementById('timer-duration-select');
  const toggleBtn = document.getElementById('timer-toggle-btn');
  const resetBtn = document.getElementById('timer-reset-btn');

  if (timerSelect) {
    timerSelect.addEventListener('change', () => {
      timerInitialMinutes = parseInt(timerSelect.value, 10) || 15;
      resetTimer();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTimer);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }
}

function toggleTimer() {
  const toggleBtn = document.getElementById('timer-toggle-btn');
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    if (toggleBtn) toggleBtn.textContent = 'Start';
  } else {
    isTimerRunning = true;
    if (!timerStartTime) timerStartTime = Date.now();
    if (toggleBtn) toggleBtn.textContent = 'Pause';

    timerInterval = setInterval(() => {
      if (timerSecondsRemaining <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        handleTimerExpired();
        return;
      }
      timerSecondsRemaining--;
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSecondsRemaining = timerInitialMinutes * 60;
  timerStartTime = null;

  const toggleBtn = document.getElementById('timer-toggle-btn');
  if (toggleBtn) toggleBtn.textContent = 'Start';

  updateTimerDisplay();

  const editor = document.getElementById('code-editor');
  if (editor) editor.disabled = false;
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;

  const m = Math.floor(timerSecondsRemaining / 60).toString().padStart(2, '0');
  const s = (timerSecondsRemaining % 60).toString().padStart(2, '0');
  display.textContent = `${m}:${s}`;

  if (timerSecondsRemaining <= 120) {
    display.className = 'font-mono text-base font-bold text-red-400';
  } else {
    display.className = 'font-mono text-base font-bold text-white';
  }
}

function handleTimerExpired() {
  updateTimerDisplay();
  const editor = document.getElementById('code-editor');
  if (editor) editor.disabled = true;

  showToast('Time expired! The editor has locked to simulate test submission.', 'info');

  // Record timed out attempt
  if (currentProblem) {
    saveAttempt({
      problemId: currentProblem.id,
      topic: currentProblem.topic,
      title: currentProblem.title,
      passed: 0,
      total: currentProblem.visibleTests.length + currentProblem.hiddenTests.length,
      timeTakenSeconds: timerInitialMinutes * 60,
      timedOut: true
    });
  }
}

// ==========================================
// 4. Language Selector (JS Active, others Notice)
// ==========================================
function setupLanguageSelector() {
  const langSelect = document.getElementById('language-select');
  const notice = document.getElementById('lang-notice');
  const runBtn = document.getElementById('run-visible-btn');
  const submitBtn = document.getElementById('submit-code-btn');

  if (!langSelect) return;

  langSelect.addEventListener('change', () => {
    const val = langSelect.value;
    if (val !== 'javascript') {
      if (notice) notice.classList.remove('hidden');
      if (runBtn) runBtn.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (notice) notice.classList.add('hidden');
      if (runBtn) runBtn.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setRunLoading(isLoading) {
  const runBtn = document.getElementById('run-visible-btn');
  const submitBtn = document.getElementById('submit-code-btn');
  if (runBtn) runBtn.disabled = isLoading;
  if (submitBtn) submitBtn.disabled = isLoading;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-[#111827] border border-[#1F2937] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none';
    document.body.appendChild(toast);
  }

  const iconColor = type === 'success' ? 'text-emerald-400' : 'text-blue-400';
  toast.innerHTML = '';

  const dot = document.createElement('span');
  dot.className = `${iconColor} font-bold text-sm`;
  dot.textContent = '●';

  const textNode = document.createElement('span');
  textNode.textContent = msg;

  toast.appendChild(dot);
  toast.appendChild(textNode);

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3500);
}
