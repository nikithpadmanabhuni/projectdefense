/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * runner-worker.js
 * Dedicated Web Worker script for executing untrusted student JavaScript solutions.
 * Loaded via `worker-src 'self'` without requiring blob: permissions.
 */

self.onmessage = function(e) {
  const { code, input, fnName } = e.data;
  try {
    // Evaluate student solution inside isolated worker thread
    const fn = new Function(
      code + '; return (typeof ' + fnName + ' !== "undefined") ? ' + fnName + ' : null;'
    )();

    if (typeof fn !== 'function') {
      self.postMessage({ 
        error: 'Function "' + fnName + '" is not defined. Please check your function name.' 
      });
      return;
    }

    // Call student function with arguments
    const result = fn.apply(null, input);
    self.postMessage({ result: result });
  } catch (err) {
    self.postMessage({ error: err.message || String(err) });
  }
};
