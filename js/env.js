/**
 * env.js
 * Comprehensive environment & client capabilities detection.
 * Used for graceful degradation, device checks, and diagnostic reporting.
 */

export function checkEnvironment() {
  // 1. LocalStorage detection with write/remove test
  let localStorageOk = false;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__pd_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      localStorageOk = true;
    }
  } catch (e) {
    localStorageOk = false;
  }

  // 2. Worker detection
  const workerOk = typeof Worker !== 'undefined';

  // 3. Fetch detection
  const fetchOk = typeof fetch === 'function';

  // 4. Download capability (Blob + createObjectURL)
  const downloadOk = typeof Blob !== 'undefined' && 
    typeof URL !== 'undefined' && 
    typeof URL.createObjectURL === 'function';

  // 5. Screen dimensions
  const screen = {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  };

  // 6. Network status
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // 7. Concise User-Agent summary (no full UA dump)
  let userAgentSummary = 'Standard Browser';
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMac = /Macintosh|Mac OS X/.test(ua) && !isIOS;
    const isWindows = /Windows/.test(ua);
    const isLinux = /Linux/.test(ua) && !isAndroid;

    let os = 'Desktop';
    if (isIOS) os = 'iOS';
    else if (isAndroid) os = 'Android';
    else if (isMac) os = 'macOS';
    else if (isWindows) os = 'Windows';
    else if (isLinux) os = 'Linux';

    let browser = 'Browser';
    if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/CriOS/i.test(ua)) browser = 'Chrome iOS';
    else if (/FxiOS/i.test(ua)) browser = 'Firefox iOS';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';

    userAgentSummary = `${os} ${browser}`;
  }

  return {
    localStorageOk,
    workerOk,
    fetchOk,
    downloadOk,
    screen,
    online,
    userAgentSummary
  };
}

/**
 * Generates formatted plain text diagnostic info suitable for clipboard copy or support report.
 * @param {ReturnType<typeof checkEnvironment>} [env]
 * @returns {string}
 */
export function getDiagnosticSummary(env) {
  const e = env || checkEnvironment();
  return [
    `=== ProjectDefense Device Diagnostic ===`,
    `Generated: ${new Date().toISOString()}`,
    `Device/Browser: ${e.userAgentSummary}`,
    `Screen Size: ${e.screen.width}x${e.screen.height}`,
    `Saving data on this device: ${e.localStorageOk ? 'OK' : 'Restricted (In-Memory Fallback)'}`,
    `Background worker: ${e.workerOk ? 'Supported' : 'Not supported'}`,
    `Network fetch: ${e.fetchOk ? 'Available' : 'Unavailable'}`,
    `File export: ${e.downloadOk ? 'Supported' : 'Fallback to Textarea'}`,
    `Connection: ${e.online ? 'Online' : 'Offline'}`,
    `========================================`
  ].join('\n');
}

/**
 * Copies plain text to clipboard with fallback.
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback below
    }
  }

  // Fallback using textarea + execCommand
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 99999);
    const success = document.execCommand('copy');
    document.body.removeChild(ta);
    return success;
  } catch (err) {
    return false;
  }
}
