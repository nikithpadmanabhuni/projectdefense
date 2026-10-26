/**
 * =========================================================================
 * ProjectDefense - Security, Copyright & Intellectual Property Protection
 * =========================================================================
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * 
 * PROPRIETARY & CONFIDENTIAL:
 * This website, its viva defense concepts, scoring algorithms, question sets,
 * interactive personas, design system, and underlying source code are the
 * exclusive intellectual property of Nikith Padmanabhuni.
 * 
 * Unauthorized copying, scraping, reverse engineering, redistribution,
 * framing, cloning, or commercial use is strictly prohibited by law.
 * Violators are subject to legal civil and criminal prosecution under
 * copyright, trademark, and intellectual property statutes.
 * =========================================================================
 */

(function () {
  'use strict';

  // 1. Anti-Clickjacking / Frame-Busting
  // Prevents malicious sites from embedding ProjectDefense in an iframe
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location.href;
    }
  } catch (e) {
    window.location.replace('about:blank');
  }

  // 2. Toast Notification Helper for Security Alerts
  let activeToastTimeout = null;
  function showSecurityNotice(message) {
    let toast = document.getElementById('pd-security-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pd-security-toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.style.cssText = [
        'position: fixed',
        'bottom: 24px',
        'left: 50%',
        'transform: translateX(-50%) translateY(100px)',
        'background: rgba(15, 23, 42, 0.96)',
        'color: #F8FAFC',
        'border: 1px solid #3B82F6',
        'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(59, 130, 246, 0.35)',
        'padding: 12px 20px',
        'border-radius: 12px',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'font-size: 13px',
        'font-weight: 500',
        'z-index: 999999',
        'display: flex',
        'align-items: center',
        'gap: 10px',
        'opacity: 0',
        'transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        'pointer-events: none',
        'max-width: 90vw',
        'text-align: center'
      ].join(';');
      document.body.appendChild(toast);
    }

    toast.innerHTML = [
      '<svg style="width:18px;height:18px;color:#60A5FA;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
      '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>',
      '</svg>',
      '<span>' + message + '</span>'
    ].join('');

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (activeToastTimeout) clearTimeout(activeToastTimeout);
    activeToastTimeout = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3200);
  }

  // 3. Disable Context Menu (Right-Click)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    showSecurityNotice('Protected by Copyright © 2026 Nikith Padmanabhuni. Content & code copying is restricted.');
    return false;
  }, false);

  // 4. Disable Dangerous Keyboard Shortcuts (DevTools, View Source, Save Page, Print)
  document.addEventListener('keydown', function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
    const key = (e.key || '').toUpperCase();
    const keyCode = e.keyCode || e.which;

    // F12 -> DevTools
    if (keyCode === 123 || key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Developer inspection is locked on this protected site.');
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I -> Inspect Element
    if (ctrlOrCmd && ((isMac && e.altKey && key === 'I') || (e.shiftKey && key === 'I'))) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Inspect Element is restricted. Proprietary concept © Nikith Padmanabhuni.');
      return false;
    }

    // Ctrl+Shift+J / Cmd+Option+J -> Console
    if (ctrlOrCmd && ((isMac && e.altKey && key === 'J') || (e.shiftKey && key === 'J'))) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Developer console inspection is restricted.');
      return false;
    }

    // Ctrl+Shift+C / Cmd+Option+C -> Element Selector
    if (ctrlOrCmd && ((isMac && e.altKey && key === 'C') || (e.shiftKey && key === 'C'))) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U -> View Source
    if (ctrlOrCmd && (key === 'U' || (isMac && e.altKey && key === 'U'))) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Source code view is protected by Copyright © 2026 Nikith Padmanabhuni.');
      return false;
    }

    // Ctrl+S / Cmd+S -> Save Webpage
    if (ctrlOrCmd && key === 'S') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Saving this application offline is restricted.');
      return false;
    }

    // Ctrl+P / Cmd+P -> Print / Export PDF
    if (ctrlOrCmd && key === 'P') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Printing/saving questions & layout is protected.');
      return false;
    }

    // Ctrl+A / Cmd+A -> Global Select All (allow inside inputs & textareas, block full-page scraping)
    if (ctrlOrCmd && key === 'A') {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (!isInput) {
        e.preventDefault();
        return false;
      }
    }
  }, true);

  // 5. Copy Interception with Watermark Injection
  document.addEventListener('copy', function (e) {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    // Allow students to copy their own typed code inside the editor or inputs
    if (isInput) return;

    // Otherwise, protect concept and UI content
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    e.preventDefault();
    const copiedText = selection.toString();
    const copyrightWatermark = '\n\n--- [Protected Concept & Content: Copyright © 2026 Nikith Padmanabhuni. All Rights Reserved. ProjectDefense: https://projectdefense-xi.vercel.app] ---';
    
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', copiedText + copyrightWatermark);
    }
    showSecurityNotice('Content copied with copyright notice. All Rights Reserved to Nikith Padmanabhuni.');
  });

  // 6. Disable Drag & Drop of Images, SVGs, and Links
  document.addEventListener('dragstart', function (e) {
    const target = e.target;
    if (target && (target.tagName === 'IMG' || target.tagName === 'SVG' || target.tagName === 'A')) {
      e.preventDefault();
      return false;
    }
  });

  // 7. Console Security Banner & Proprietary Notice
  const printConsoleBanner = function () {
    try {
      console.clear();
      const titleStyle = 'color: #3B82F6; font-size: 20px; font-weight: 800; text-shadow: 0 0 8px rgba(59,130,246,0.5);';
      const authorStyle = 'color: #F8FAFC; font-size: 14px; font-weight: bold; background: #1E293B; padding: 4px 8px; border-radius: 4px;';
      const warningStyle = 'color: #EF4444; font-size: 12px; font-weight: 600; line-height: 1.5;';
      const bodyStyle = 'color: #94A3B8; font-size: 11px;';

      console.log('%c🛡️ PROJECTDEFENSE INTELLECTUAL PROPERTY & SECURITY', titleStyle);
      console.log('%cCopyright © 2026 Nikith Padmanabhuni. All Rights Reserved.', authorStyle);
      console.log('%cWARNING: UNAUTHORIZED CODE/CONCEPT CLONING IS STRICTLY PROHIBITED', warningStyle);
      console.log(
        '%cThis platform, its viva defense engine, interview questions, evaluation rubric, algorithms, and visual architecture are the proprietary creation of Nikith Padmanabhuni.\n' +
        'Any duplication, unauthorized reproduction, decompilation, scraping, or distribution of this software without explicit written permission will result in legal action under the Copyright Act and DMCA notices.',
        bodyStyle
      );
    } catch (_) {}
  };

  printConsoleBanner();

  // Periodically check DevTools / window size anomalies
  let devtoolsDetected = false;
  setInterval(function () {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if ((widthDiff || heightDiff) && !devtoolsDetected) {
      devtoolsDetected = true;
      printConsoleBanner();
    } else if (!widthDiff && !heightDiff) {
      devtoolsDetected = false;
    }
  }, 1500);

  // 8. Inject Anti-Select & Print Protection Styles
  const styleEl = document.createElement('style');
  styleEl.innerHTML = [
    '/* Prevent text selection of concepts, headlines, and cards */',
    '.pd-protected, h1, h2, h3, h4, h5, h6, nav, header, footer, [data-protected] {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  -ms-user-select: none !important;',
    '  user-select: none !important;',
    '}',
    '/* Keep input fields and student practice editors editable */',
    'input, textarea, [contenteditable="true"] {',
    '  -webkit-user-select: text !important;',
    '  -moz-user-select: text !important;',
    '  -ms-user-select: text !important;',
    '  user-select: text !important;',
    '}',
    '/* Prevent mobile long-press image saving */',
    'img, svg {',
    '  -webkit-touch-callout: none !important;',
    '  pointer-events: none !important;',
    '}',
    'button img, a img, .interactive img, button svg, a svg {',
    '  pointer-events: auto !important;',
    '}',
    '/* Hide page content when printing/saving to PDF */',
    '@media print {',
    '  body * {',
    '    visibility: hidden !important;',
    '  }',
    '  body::before {',
    '    content: "PROTECTED CONTENT: Copyright © 2026 Nikith Padmanabhuni. All Rights Reserved. Printing or saving to PDF is prohibited." !important;',
    '    visibility: visible !important;',
    '    position: fixed !important;',
    '    top: 40% !important;',
    '    left: 10% !important;',
    '    right: 10% !important;',
    '    font-size: 18pt !important;',
    '    font-weight: bold !important;',
    '    text-align: center !important;',
    '    color: #000 !important;',
    '  }',
    '}'
  ].join('\n');

  if (document.head) {
    document.head.appendChild(styleEl);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.head.appendChild(styleEl);
    });
  }

})();
