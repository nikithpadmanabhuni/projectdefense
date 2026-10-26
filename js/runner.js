/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * runner.js
 * Executes student JavaScript solutions inside an isolated Web Worker with strict timeout.
 * Prevents main thread freeze on infinite loops and ensures safe output comparison.
 */

const WORKER_TIMEOUT_MS = 2000; // 2 seconds limit per test case

/**
 * Deep equality helper for objects and arrays.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Creates a Web Worker from js/runner-worker.js (adhering strictly to worker-src 'self').
 */
function createWorker() {
  if (typeof Worker === 'undefined') {
    throw new Error('Your browser cannot run code tests. Try Chrome, Edge, Firefox, or Safari.');
  }
  return new Worker('js/runner-worker.js');
}

/**
 * Runs a single test case inside a worker with timeout.
 * @param {string} code 
 * @param {string} fnName 
 * @param {Array<any>} input 
 * @returns {Promise<{ result?: any, error?: string, timedOut?: boolean }>}
 */
function runSingleTest(code, fnName, input) {
  return new Promise((resolve) => {
    let worker;
    let timer;

    try {
      worker = createWorker();
    } catch (err) {
      resolve({ error: err.message || 'Your browser cannot run code tests. Try Chrome, Edge, Firefox, or Safari.' });
      return;
    }

    let finished = false;

    timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        try {
          worker.terminate();
        } catch (_) {}
        resolve({ timedOut: true, error: 'Execution timed out (exceeded 2 seconds limit). Possible infinite loop or recursion depth.' });
      }
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (e) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        try {
          worker.terminate();
        } catch (_) {}
        resolve(e.data);
      }
    };

    worker.onerror = (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        try {
          worker.terminate();
        } catch (_) {}
        resolve({ error: err.message || 'Worker runtime error' });
      }
    };

    worker.postMessage({ code, fnName, input });
  });
}

/**
 * Extracts the primary function name from starterCode or student code.
 * @param {string} code 
 * @returns {string}
 */
export function extractFunctionName(code) {
  const match = code.match(/function\s+([A-Za-z0-9_$]+)/);
  if (match) return match[1];

  const constMatch = code.match(/(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:function|\()/);
  if (constMatch) return constMatch[1];

  return 'solution';
}

/**
 * Runs a suite of test cases against student code.
 * @param {string} code - Student's JavaScript code
 * @param {Array<any>} tests - Array of { input: [...], expected: any, isHidden?: boolean }
 * @param {string} [specifiedFnName]
 * @returns {Promise<{ passed: number, total: number, failures: Array<any>, timedOut: boolean }>}
 */
export async function runTestSuite(code, tests, specifiedFnName) {
  const fnName = specifiedFnName || extractFunctionName(code);
  const failures = [];
  let passed = 0;
  let overallTimedOut = false;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const isHidden = !!test.isHidden;

    const res = await runSingleTest(code, fnName, test.input);

    if (res.timedOut) {
      overallTimedOut = true;
      failures.push({
        testIndex: i,
        isHidden,
        message: isHidden ? `Hidden test ${i + 1} timed out (2s limit).` : `Visible test ${i + 1} timed out after 2 seconds.`
      });
      // Stop running remaining tests on timeout
      break;
    }

    if (res.error) {
      failures.push({
        testIndex: i,
        isHidden,
        message: isHidden ? `Hidden test ${i + 1} failed due to an error.` : `Error in test ${i + 1}: ${res.error}`
      });
      continue;
    }

    // Compare with deep equality
    if (deepEqual(res.result, test.expected)) {
      passed++;
    } else {
      failures.push({
        testIndex: i,
        isHidden,
        message: isHidden
          ? `Hidden test ${i + 1} failed.`
          : `Visible test ${i + 1} failed. Expected: ${JSON.stringify(test.expected)}, Received: ${JSON.stringify(res.result)}`
      });
    }
  }

  return {
    passed,
    total: tests.length,
    failures,
    timedOut: overallTimedOut
  };
}
