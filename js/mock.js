/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * mock.js
 * Offline question generator and rubric-based evaluation engine.
 * Requires zero API keys and works deterministically offline.
 */

/**
 * Generates 3 contextual interview questions from source code based on extracted symbols and mode.
 * @param {string} code 
 * @param {string} fileName 
 * @param {'gentle'|'standard'|'brutal'} mode 
 * @returns {Array<{ id: number, text: string, targetConcept: string }>}
 */
export function generateMockQuestions(code, fileName, mode = 'standard') {
  const analysis = inspectCodeFeatures(code, fileName);

  const questions = [];

  // Question 1: Structure / Definition
  questions.push(buildStructureQuestion(analysis, mode));

  // Question 2: Error handling / Network / Asynchrony
  questions.push(buildErrorQuestion(analysis, mode));

  // Question 3: State / Mutation / Testing
  questions.push(buildStateQuestion(analysis, mode));

  return questions;
}

/**
 * Evaluates an individual answer against the 3-pillar rubric (0-5 each).
 * @param {string} questionText 
 * @param {string} answerText 
 * @param {string} code 
 * @param {'gentle'|'standard'|'brutal'} mode 
 * @returns {{
 *   clarity: number,
 *   accuracy: number,
 *   depth: number,
 *   total: number,
 *   feedback: string
 * }}
 */
export function evaluateMockAnswer(questionText, answerText, code, mode = 'standard') {
  const text = (answerText || '').trim();
  const lower = text.toLowerCase();

  // 1. Clarity (0-5): length, punctuation, sentence structure
  let clarity = 1;
  const sentenceCount = (text.match(/[.!?](\s|$)/g) || []).length;
  if (text.length >= 200 && sentenceCount >= 2) {
    clarity = 5;
  } else if (text.length >= 120 && sentenceCount >= 2) {
    clarity = 4;
  } else if (text.length >= 60) {
    clarity = 3;
  } else if (text.length >= 20) {
    clarity = 2;
  }

  // 2. Accuracy (0-5): presence of relevant engineering terminology
  let accuracy = 1;
  const techTerms = [
    'error', 'catch', 'try', 'async', 'await', 'promise', 'callback',
    'state', 'props', 'render', 'rebuild', 'lifecycle', 'cache',
    'memory', 'leak', 'thread', 'latency', 'api', 'http', 'status',
    'timeout', 'null', 'undefined', 'exception', 'singleton', 'immutable'
  ];

  let matchedTerms = 0;
  techTerms.forEach((term) => {
    if (lower.includes(term)) matchedTerms++;
  });

  if (matchedTerms >= 4) accuracy = 5;
  else if (matchedTerms === 3) accuracy = 4;
  else if (matchedTerms === 2) accuracy = 3;
  else if (matchedTerms === 1) accuracy = 2;

  // 3. Depth (0-5): reasoning keywords and trade-offs
  let depth = 1;
  const reasoningTerms = [
    'because', 'due to', 'instead of', 'trade-off', 'tradeoff',
    'drawback', 'downside', 'alternatively', 'rather than',
    'overhead', 'bottleneck', 'scale', 'concurrency', 'in order to'
  ];

  let matchedReasons = 0;
  reasoningTerms.forEach((term) => {
    if (lower.includes(term)) matchedReasons++;
  });

  if (matchedReasons >= 3) depth = 5;
  else if (matchedReasons === 2) depth = 4;
  else if (matchedReasons === 1) depth = 3;
  else if (text.length > 100) depth = 2;

  const total = clarity + accuracy + depth;

  // Construct specific, constructive feedback
  let feedback = '';
  if (total >= 12) {
    feedback = 'Mock feedback: Strong technical response. You clearly articulated architectural reasons and identified key keywords. In a live interview, be prepared to write a unit test demonstrating this.';
  } else if (total >= 8) {
    feedback = 'Mock feedback: Good foundation. To reach top-tier score, explicitly mention trade-offs ("We chose X over Y because...") and describe how failure conditions are caught.';
  } else {
    feedback = 'Mock feedback: Your answer is a bit brief or descriptive. Try to explain why you structured it this way rather than just repeating what the code does.';
  }

  return {
    clarity,
    accuracy,
    depth,
    total,
    feedback
  };
}

/**
 * Returns two concepts for the student to study based on code contents.
 * @param {string} code 
 * @returns {Array<string>}
 */
export function getStudyConcepts(code) {
  const concepts = [];
  const lower = (code || '').toLowerCase();

  if (lower.includes('async') || lower.includes('fetch') || lower.includes('http') || lower.includes('dio')) {
    concepts.push('Async/Await Lifecycle, Network Timeouts, and HTTP 5xx Retry Patterns');
  }

  if (lower.includes('state') || lower.includes('setstate') || lower.includes('notifier') || lower.includes('usestate')) {
    concepts.push('State Management: Avoiding Unnecessary Re-renders & Data Mutations');
  }

  if (lower.includes('class') || lower.includes('interface') || lower.includes('extends')) {
    concepts.push('Object-Oriented Design Principles & Decoupled Architecture');
  }

  if (lower.includes('try') || lower.includes('catch') || lower.includes('throw')) {
    concepts.push('Defensive Programming: Graceful Degradation & Error Boundaries');
  }

  // Ensure exactly 2 concepts
  if (concepts.length === 0) {
    concepts.push('Clean Code: Single Responsibility Principle & Function Decomposition');
    concepts.push('Unit Testing: Mocking External Dependencies and Edge Cases');
  } else if (concepts.length === 1) {
    concepts.push('Unit Testing: Mocking External Dependencies and Edge Cases');
  }

  return concepts.slice(0, 2);
}

// ==========================================
// Internal Deterministic Extraction Helpers
// ==========================================

function inspectCodeFeatures(code, fileName) {
  const safeCode = code || '';
  
  // 1. Look for class or major component
  const classMatch = safeCode.match(/class\s+([A-Za-z0-9_]+)/);
  const className = classMatch ? classMatch[1] : null;

  // 2. Look for functions or methods
  const funcMatch = safeCode.match(/(?:function\s+([A-Za-z0-9_]+)|def\s+([A-Za-z0-9_]+)|(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)/);
  const funcName = funcMatch ? (funcMatch[1] || funcMatch[2] || funcMatch[3]) : null;

  // 3. Look for API or async calls
  const hasAsync = /async|await|fetch|axios|dio|http\.|requests\./.test(safeCode);

  // 4. Look for state or variables
  const stateMatch = safeCode.match(/(?:state|useState|setState|StateNotifier|[A-Za-z0-9_]+State)/i);
  const stateName = stateMatch ? stateMatch[0] : null;

  return {
    fileName,
    className,
    funcName,
    hasAsync,
    stateName
  };
}

function buildStructureQuestion(analysis, mode) {
  const symbol = analysis.className || analysis.funcName || analysis.fileName;

  if (mode === 'gentle') {
    return {
      id: 1,
      text: `Can you walk me through ${symbol}? In simple terms, what is its primary responsibility and why did you organize it this way?`,
      targetConcept: 'Component & Function Responsibilities'
    };
  }

  if (mode === 'brutal') {
    return {
      id: 1,
      text: `Look at ${symbol}. It appears tightly coupled. How would you refactor this to follow the Single Responsibility Principle, and why didn't you decouple it initially?`,
      targetConcept: 'Coupling & Architecture Trade-offs'
    };
  }

  // Standard HR / Technical
  return {
    id: 1,
    text: `Explain the design of ${symbol}. If a new developer joined your team tomorrow, what architecture trade-offs would you tell them about this implementation?`,
    targetConcept: 'Code Maintainability & Modularity'
  };
}

function buildErrorQuestion(analysis, mode) {
  if (analysis.hasAsync) {
    if (mode === 'gentle') {
      return {
        id: 2,
        text: `Your code performs asynchronous or network operations. What happens if the user loses internet connection or the server takes 10 seconds to respond?`,
        targetConcept: 'Asynchronous Error Handling'
      };
    }
    if (mode === 'brutal') {
      return {
        id: 2,
        text: `You have asynchronous calls here. What prevents an uncaught promise rejection or thread lockup if the backend returns a 502 Bad Gateway? How do you test for timeout latency?`,
        targetConcept: 'Resilience & Failure Modes'
      };
    }
    return {
      id: 2,
      text: `How does your asynchronous logic handle edge cases like network timeouts, HTTP 500 errors, or unexpected payload shapes?`,
      targetConcept: 'Error Boundaries & Retries'
    };
  }

  // Non-async fallback
  if (mode === 'brutal') {
    return {
      id: 2,
      text: `What happens if invalid or null input is passed into this code? Where are your input validation and defensive checks?`,
      targetConcept: 'Defensive Programming'
    };
  }

  return {
    id: 2,
    text: `How do you handle unexpected null or malformed data here? Explain how you would prevent runtime exceptions from crashing the application.`,
    targetConcept: 'Exception Handling'
  };
}

function buildStateQuestion(analysis, mode) {
  const stateRef = analysis.stateName || 'the primary data variables';

  if (mode === 'gentle') {
    return {
      id: 3,
      text: `How does data flow through ${stateRef}? How do you know when a value changes and how the rest of the app updates?`,
      targetConcept: 'Data Flow & State Lifecycle'
    };
  }

  if (mode === 'brutal') {
    return {
      id: 3,
      text: `Regarding ${stateRef}: What happens during rapid state changes or concurrency? Could this trigger race conditions or memory leaks if left mounted?`,
      targetConcept: 'Concurrency & Memory Safety'
    };
  }

  return {
    id: 3,
    text: `Explain how ${stateRef} is managed. How do you ensure that mutations remain predictable and testable across different screens or lifecycle events?`,
    targetConcept: 'State Management & Immutability'
  };
}
