/**
 * sprint.js
 * 30-Day Placement Sprint Plan & SQL Practice Engine.
 * Tracks daily tasks, streak calculation, weak-topic alerts, and self-checked SQL practice.
 */

import { saveSprintProgress, getSprintProgress, getAttempts } from './storage.js';

// The 25 Essential Algorithm Pattern Names
export const ALGO_PATTERNS = [
  'Sliding Window',
  'Two Pointers',
  'Prefix Sum',
  'Fast and Slow Pointers',
  'In-place Reversal of a Linked List',
  'Monotonic Stack',
  'Top K Elements (Heap)',
  'K-way Merge',
  'Merge Intervals',
  'Cyclic Sort',
  'Binary Search',
  'Bitwise XOR',
  'Subsets and Backtracking',
  'Permutations',
  'Breadth-First Search (BFS)',
  'Depth-First Search (DFS)',
  'Matrix Traversal',
  'Topological Sort',
  'Trie Prefix Tree',
  'Greedy Intervals',
  'Dynamic Programming (0/1 Knapsack)',
  'Dynamic Programming (Longest Common Subsequence)',
  'Kadane\'s Algorithm',
  'Hashmap Frequency Counting',
  'Queue using Stacks'
];

// The 5 System Design Basics
export const SYSTEM_DESIGN_CONCEPTS = [
  'Client-Server Model & Request-Response Lifecycle',
  'Caching Strategies (Cache-Aside, Write-Through & Redis)',
  'Database Indexing (B-Tree Internals & Query Optimization)',
  'REST API Design & HTTP Status Codes (200, 400, 401, 500)',
  'Load Balancing & Horizontal vs. Vertical Scaling'
];

// 10 SQL Queries with Expected Output for Self-Check Practice
export const SQL_PRACTICE = [
  {
    id: 'sql-q1',
    concept: 'SELECT with WHERE',
    prompt: 'Write a SQL query to select all columns from the "students" table where branch is "CSE".',
    expected: 'SELECT * FROM students WHERE branch = "CSE";'
  },
  {
    id: 'sql-q2',
    concept: 'GROUP BY with HAVING',
    prompt: 'Find departments having more than 5 employees from "employees" grouped by "department".',
    expected: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;'
  },
  {
    id: 'sql-q3',
    concept: 'INNER JOIN',
    prompt: 'Join "users" and "orders" on users.id = orders.user_id, selecting users.name and orders.amount.',
    expected: 'SELECT users.name, orders.amount FROM users INNER JOIN orders ON users.id = orders.user_id;'
  },
  {
    id: 'sql-q4',
    concept: 'LEFT JOIN',
    prompt: 'Select all users and their orders (including users who have not placed any orders).',
    expected: 'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id;'
  },
  {
    id: 'sql-q5',
    concept: 'COUNT aggregate',
    prompt: 'Count the total number of orders placed in 2026 from the "orders" table.',
    expected: 'SELECT COUNT(*) FROM orders WHERE year = 2026;'
  },
  {
    id: 'sql-q6',
    concept: 'Subquery in WHERE',
    prompt: 'Find employees whose salary is greater than the average salary of all employees.',
    expected: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);'
  },
  {
    id: 'sql-q7',
    concept: 'ORDER BY with LIMIT',
    prompt: 'Select the top 3 highest-earning employees ordered by salary descending.',
    expected: 'SELECT * FROM employees ORDER BY salary DESC LIMIT 3;'
  },
  {
    id: 'sql-q8',
    concept: 'DISTINCT values',
    prompt: 'Select all unique city names from the "customers" table.',
    expected: 'SELECT DISTINCT city FROM customers;'
  },
  {
    id: 'sql-q9',
    concept: 'CASE WHEN conditional',
    prompt: 'Select name and label "Senior" if age >= 30, else "Junior" as seniority from "workers".',
    expected: 'SELECT name, CASE WHEN age >= 30 THEN "Senior" ELSE "Junior" END AS seniority FROM workers;'
  },
  {
    id: 'sql-q10',
    concept: 'Self-join',
    prompt: 'Join "employees" e with itself m to find employee names and their manager names (e.manager_id = m.id).',
    expected: 'SELECT e.name AS employee, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.id;'
  }
];

// Project Review Tasks pool
const PROJECT_TASKS = [
  'Add a clear README with installation steps and project purpose',
  'Deploy one project to a live URL (e.g. Vercel, Netlify, or Render)',
  'Explain one core function out loud in under 2 minutes without pausing',
  'Add defensive error handling and timeout boundaries to an API call',
  'Remove dead code, console.log statements, and unused variables',
  'Write at least two unit tests testing edge cases in your code',
  'Review your repository for hardcoded passwords, tokens, or IP addresses'
];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderWeakTopicAlert();
    renderSprintDays();
    renderSqlPractice();
    updateProgressUI();
  });
}

function renderWeakTopicAlert() {
  const container = document.getElementById('weak-topic-alert-container');
  if (!container) return;

  const attempts = getAttempts();
  if (attempts.length === 0) {
    container.classList.add('hidden');
    return;
  }

  // Calculate pass rates per topic
  const topicStats = {};
  attempts.forEach((att) => {
    const t = att.topic || 'General';
    if (!topicStats[t]) {
      topicStats[t] = { totalAttempts: 0, passedAttempts: 0 };
    }
    topicStats[t].totalAttempts++;
    if (att.passed === att.total && att.total > 0) {
      topicStats[t].passedAttempts++;
    }
  });

  const weakTopics = [];
  for (const [topic, stats] of Object.entries(topicStats)) {
    if (stats.totalAttempts >= 2) {
      const rate = stats.passedAttempts / stats.totalAttempts;
      if (rate < 0.5) {
        weakTopics.push(`${topic} (${Math.round(rate * 100)}% pass rate)`);
      }
    }
  }

  if (weakTopics.length > 0) {
    container.innerHTML = '';
    const alertBox = document.createElement('div');
    alertBox.className = 'p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-1';

    const header = document.createElement('div');
    header.className = 'font-bold text-amber-400 flex items-center gap-1.5';
    header.textContent = '⚠️ Weak-Topic Alert based on your No-AI coding attempts:';

    const list = document.createElement('div');
    list.textContent = `Practice more: ${weakTopics.join(', ')}. Focus on fundamental pattern templates.`;

    alertBox.appendChild(header);
    alertBox.appendChild(list);
    container.appendChild(alertBox);
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

function renderSprintDays() {
  const container = document.getElementById('sprint-days-grid');
  if (!container) return;
  container.innerHTML = '';

  const progress = getSprintProgress();

  for (let day = 1; day <= 30; day++) {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3';

    // Day Header
    const top = document.createElement('div');
    top.className = 'flex items-center justify-between text-xs font-mono border-b border-[#1F2937] pb-2';

    const dayLabel = document.createElement('span');
    dayLabel.className = 'font-bold text-blue-400';
    dayLabel.textContent = `Day ${day} of 30`;

    const dayAlgoPattern = ALGO_PATTERNS[(day - 1) % ALGO_PATTERNS.length];
    const patternTag = document.createElement('span');
    patternTag.className = 'text-[10px] text-slate-500 truncate max-w-[140px]';
    patternTag.textContent = dayAlgoPattern;

    top.appendChild(dayLabel);
    top.appendChild(patternTag);

    // Tasks List
    const taskList = document.createElement('div');
    taskList.className = 'space-y-2 text-xs text-slate-300';

    const tasks = [
      `Coding Task: Practice 2 problems on "${dayAlgoPattern}"`,
      `CS Concept: Review ${SYSTEM_DESIGN_CONCEPTS[(day - 1) % SYSTEM_DESIGN_CONCEPTS.length]}`,
      `Project Task: ${PROJECT_TASKS[(day - 1) % PROJECT_TASKS.length]}`
    ];

    tasks.forEach((taskText, taskIndex) => {
      const taskKey = `day-${day}-task-${taskIndex}`;
      const isDone = !!progress.completedTasks[taskKey];

      const label = document.createElement('label');
      label.className = 'flex items-start gap-2.5 cursor-pointer select-none';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = isDone;
      cb.className = 'mt-0.5 rounded bg-[#0B0F17] border-[#1F2937] text-blue-600 focus:ring-0';

      cb.addEventListener('change', () => {
        handleTaskToggle(taskKey, cb.checked);
      });

      const span = document.createElement('span');
      span.className = isDone ? 'line-through text-slate-500' : 'text-slate-300';
      span.textContent = taskText;

      label.appendChild(cb);
      label.appendChild(span);
      taskList.appendChild(label);
    });

    card.appendChild(top);
    card.appendChild(taskList);
    container.appendChild(card);
  }
}

function handleTaskToggle(taskKey, isChecked) {
  const progress = getSprintProgress();
  if (isChecked) {
    progress.completedTasks[taskKey] = true;
  } else {
    delete progress.completedTasks[taskKey];
  }

  // Update streak based on date
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastActiveDate !== today) {
    progress.streak = (progress.streak || 0) + 1;
    progress.lastActiveDate = today;
  }

  saveSprintProgress(progress);
  renderSprintDays();
  updateProgressUI();
}

function renderSqlPractice() {
  const container = document.getElementById('sql-practice-container');
  if (!container) return;
  container.innerHTML = '';

  const progress = getSprintProgress();

  SQL_PRACTICE.forEach((q, idx) => {
    const isCompleted = !!progress.sqlCompleted[q.id];

    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937] space-y-3';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between text-xs font-mono';

    const label = document.createElement('span');
    label.className = 'text-blue-400 font-bold';
    label.textContent = `SQL Query ${idx + 1}: ${q.concept}`;

    const status = document.createElement('span');
    status.className = isCompleted
      ? 'px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20'
      : 'px-2 py-0.5 rounded bg-[#111827] text-slate-500 text-[10px]';
    status.textContent = isCompleted ? 'Verified' : 'Pending';

    header.appendChild(label);
    header.appendChild(status);

    const prompt = document.createElement('p');
    prompt.className = 'text-xs text-white font-medium';
    prompt.textContent = q.prompt;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your SQL query here...';
    input.className = 'w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none';

    const feedback = document.createElement('div');
    feedback.className = 'hidden text-xs font-mono p-2 rounded';

    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-smooth';
    checkBtn.textContent = 'Self-Check Query';

    checkBtn.addEventListener('click', () => {
      const userNorm = normalizeSql(input.value);
      const expectedNorm = normalizeSql(q.expected);

      feedback.classList.remove('hidden');
      if (userNorm === expectedNorm) {
        feedback.className = 'text-xs font-mono p-2 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-500/30';
        feedback.textContent = 'Query matched expected pattern! Marked as completed.';
        progress.sqlCompleted[q.id] = true;
        saveSprintProgress(progress);
        status.textContent = 'Verified';
        status.className = 'px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20';
        updateProgressUI();
      } else {
        feedback.className = 'text-xs font-mono p-2 rounded bg-amber-950/30 text-amber-300 border border-amber-500/30';
        feedback.textContent = `Does not match template. Expected pattern:\n${q.expected}\n(Note: Self-check uses normalized matching. Variations in capitalization or spacing are supported).`;
      }
    });

    item.appendChild(header);
    item.appendChild(prompt);
    item.appendChild(input);
    item.appendChild(checkBtn);
    item.appendChild(feedback);

    container.appendChild(item);
  });
}

function normalizeSql(sql) {
  if (!sql) return '';
  return sql
    .toLowerCase()
    .replace(/["'`]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/;\s*$/, '')
    .trim();
}

function updateProgressUI() {
  const progress = getSprintProgress();
  const totalTasks = 30 * 3; // 90 total day checklist items
  const doneTasks = Object.keys(progress.completedTasks).length;

  const pct = Math.round((doneTasks / totalTasks) * 100);

  const streakEl = document.getElementById('sprint-streak-val');
  const barEl = document.getElementById('sprint-progress-bar');
  const textEl = document.getElementById('sprint-progress-text');

  if (streakEl) streakEl.textContent = `${progress.streak || 0} Day(s)`;
  if (barEl) barEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${doneTasks} / ${totalTasks} tasks completed (${pct}%)`;
}
