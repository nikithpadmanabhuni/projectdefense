/**
 * feedback.js
 * Manages the pilot feedback form, character counter, JSON export,
 * and graceful fallback for browsers where Blob downloads are blocked.
 */

import { checkEnvironment, copyToClipboard } from './env.js';

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initFeedbackForm();
  });
}

function initFeedbackForm() {
  const form = document.getElementById('feedback-form');
  const textarea = document.getElementById('feedback-confusing');
  const counter = document.getElementById('feedback-char-count');
  const fallbackBox = document.getElementById('feedback-fallback-container');
  const fallbackTextarea = document.getElementById('feedback-fallback-textarea');
  const copyBtn = document.getElementById('feedback-copy-btn');
  const statusMsg = document.getElementById('feedback-status-message');

  if (textarea && counter) {
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 1000`;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const usefulnessEl = document.getElementById('feedback-usefulness');
      const realismEl = document.getElementById('feedback-realism');
      const confusing = textarea ? textarea.value.trim() : '';
      const reuseChecked = document.querySelector('input[name="reuse"]:checked')?.value || 'Not specified';

      const env = checkEnvironment();

      const feedbackPayload = {
        submittedAt: new Date().toISOString(),
        usefulness: usefulnessEl ? Number(usefulnessEl.value) : 3,
        realism: realismEl ? Number(realismEl.value) : 3,
        confusingOrBroken: confusing || 'None reported',
        wouldUseAgain: reuseChecked,
        clientEnvironment: {
          userAgentSummary: env.userAgentSummary,
          screen: `${env.screen.width}x${env.screen.height}`,
          localStorageOk: env.localStorageOk
        }
      };

      const jsonString = JSON.stringify(feedbackPayload, null, 2);
      let downloadSucceeded = false;

      // Attempt standard Blob download if supported
      if (env.downloadOk) {
        try {
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `projectdefense-feedback-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          downloadSucceeded = true;
        } catch (err) {
          downloadSucceeded = false;
        }
      }

      if (downloadSucceeded) {
        if (statusMsg) {
          statusMsg.textContent = '✓ Thank you! Your feedback file has been downloaded. Please send it to the developer.';
          statusMsg.className = 'p-3 rounded-lg text-xs font-medium block bg-emerald-950/60 text-emerald-300 border border-emerald-500/30';
        }
        form.reset();
        if (counter) counter.textContent = '0 / 1000';
      } else {
        // Fallback: Display text in readonly textarea with copy button
        if (fallbackBox && fallbackTextarea) {
          fallbackTextarea.value = jsonString;
          fallbackBox.classList.remove('hidden');
          fallbackTextarea.focus();
          fallbackTextarea.select();
        }
        if (statusMsg) {
          statusMsg.textContent = 'File download is not supported in this browser. Please copy your feedback text below:';
          statusMsg.className = 'p-3 rounded-lg text-xs font-medium block bg-amber-950/60 text-amber-300 border border-amber-500/30';
        }
      }
    });
  }

  if (copyBtn && fallbackTextarea) {
    copyBtn.addEventListener('click', async () => {
      fallbackTextarea.select();
      fallbackTextarea.setSelectionRange(0, 99999);
      const success = await copyToClipboard(fallbackTextarea.value);
      if (success) {
        copyBtn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => { copyBtn.textContent = 'Select All & Copy Text'; }, 2000);
      }
    });
  }
}
