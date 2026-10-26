/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * defense.js
 * Orchestrates the 4-step Project Defense oral exam flow:
 * Step 1: Import GitHub repository / Select file
 * Step 2: Choose Interviewer Mode
 * Step 3: Interactive defense questioning & answer input
 * Step 4: Rubric evaluation, scoring, and study concepts
 */

import { parseGitHubUrl, fetchRepoMetadata, fetchRepoFileTree, fetchFileContent } from './github.js';
import { getInterviewQuestions, gradeStudentAnswer, checkLiveAiAvailability } from './api-client.js';
import { saveDefenseResult } from './storage.js';
import { checkAndIssueCertificate, renderCertificateUI } from './certificate.js';

// Sample fallback code for zero-friction offline testing
const SAMPLE_OFFLINE_CODE = `// Sample E-Commerce Checkout Service
import { useState, useEffect } from 'react';

export class OrderCheckoutService {
  constructor(apiClient, analyticsTracker) {
    this.api = apiClient;
    this.analytics = analyticsTracker;
    this.cachedOrders = new Map();
  }

  async processPayment(orderId, paymentMethod) {
    if (!orderId || !paymentMethod) {
      throw new Error('Invalid checkout parameters');
    }

    try {
      this.analytics.trackEvent('checkout_started', { orderId });
      const response = await this.api.post('/checkout', {
        orderId,
        paymentMethod,
        timestamp: Date.now()
      });

      this.cachedOrders.set(orderId, response.data);
      return response.data;
    } catch (err) {
      this.analytics.trackEvent('checkout_failed', { orderId, error: err.message });
      throw err;
    }
  }
}`;

// Built-in Capstone Templates (Zero-friction viva practice without GitHub)
const TEMPLATES = {
  ecommerce: {
    path: 'OrderCheckoutService.js',
    content: SAMPLE_OFFLINE_CODE
  },
  auth: {
    path: 'auth_middleware.py',
    content: `# JWT Authentication & Security Middleware
import jwt
import time
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "production-app-secret-key-change-in-env"
ALGORITHM = "HS256"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Authorization token missing", "status": 401}), 401
            
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("exp") < time.time():
                return jsonify({"error": "Token expired. Please re-authenticate", "status": 401}), 401
            current_user = payload.get("user_id")
            role = payload.get("role", "student")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token signature expired", "status": 401}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid credential token supplied", "status": 401}), 401
            
        return f(current_user, role, *args, **kwargs)
    return decorated
`
  },
  ml: {
    path: 'fraud_detection_pipeline.py',
    content: `# Machine Learning Fraud Detection & Inference Service
import numpy as np
import logging

class FraudDetectionModel:
    def __init__(self, model_weights_path=None, threshold=0.85):
        self.threshold = threshold
        self.logger = logging.getLogger("MLInferenceService")
        self.feature_means = np.array([120.5, 3.2, 0.05, 1.4])
        self.weights = np.array([0.42, 0.28, 0.85, 0.15])
        
    def preprocess_features(self, raw_transaction):
        amount = float(raw_transaction.get("amount", 0.0))
        velocity = float(raw_transaction.get("txn_last_hour", 1))
        risk_score = float(raw_transaction.get("ip_risk_score", 0.0))
        hour_of_day = float(raw_transaction.get("hour", 12)) / 24.0
        
        features = np.array([amount, velocity, risk_score, hour_of_day])
        normalized = (features - self.feature_means) / (self.feature_means + 1e-6)
        return normalized

    def predict(self, raw_transaction):
        try:
            features = self.preprocess_features(raw_transaction)
            raw_logit = np.dot(features, self.weights)
            probability = 1.0 / (1.0 + np.exp(-raw_logit))
            
            is_fraud = bool(probability >= self.threshold)
            self.logger.info(f"Transaction scored: {probability:.4f} (Flagged: {is_fraud})")
            return {
                "fraud_probability": round(float(probability), 4),
                "is_flagged": is_fraud,
                "confidence_interval": 0.95
            }
        except Exception as e:
            self.logger.error(f"Inference failure: {str(e)}")
            return {"error": "Prediction pipeline failed", "fallback_flag": True}
`
  },
  student_db: {
    path: 'StudentManagementService.java',
    content: `// Student Academic Records & CGPA Calculation Service
package com.projectdefense.academic;

import java.sql.*;
import java.util.*;

public class StudentManagementService {
    private final String dbUrl;
    private final Map<String, Double> cgpaCache = new HashMap<>();

    public StudentManagementService(String dbUrl) {
        this.dbUrl = dbUrl;
    }

    public synchronized double calculateCGPA(String studentId, List<Integer> courseCredits, List<Double> gradePoints) throws SQLException {
        if (studentId == null || courseCredits.size() != gradePoints.size() || courseCredits.isEmpty()) {
            throw new IllegalArgumentException("Mismatched or empty grade parameters.");
        }

        double totalCredits = 0.0;
        double weightedPoints = 0.0;

        for (int i = 0; i < courseCredits.size(); i++) {
            int credit = courseCredits.get(i);
            double grade = gradePoints.get(i);
            totalCredits += credit;
            weightedPoints += (credit * grade);
        }

        double calculatedCGPA = Math.round((weightedPoints / totalCredits) * 100.0) / 100.0;
        cgpaCache.put(studentId, calculatedCGPA);

        try (Connection conn = DriverManager.getConnection(this.dbUrl);
             PreparedStatement stmt = conn.prepareStatement("UPDATE students SET cgpa = ?, updated_at = NOW() WHERE student_id = ?")) {
            stmt.setDouble(1, calculatedCGPA);
            stmt.setString(2, studentId);
            stmt.executeUpdate();
        }

        return calculatedCGPA;
    }
}
`
  }
};

// Application State
const state = {
  step: 1,
  repoOwner: '',
  repoName: '',
  defaultBranch: 'main',
  eligibleFiles: [],
  selectedFile: null, // { path, content, size }
  selectedMode: 'standard', // 'gentle' | 'standard' | 'brutal'
  questions: [],
  studyConcepts: [],
  answers: ['', '', ''],
  evaluations: [],
  isMock: true
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setupStep1Handlers();
    setupStep2Handlers();
    setupStep3Handlers();
    setupStep4Handlers();
    renderStep(1);
    initEngineBadge();
  });
}

async function initEngineBadge() {
  try {
    const status = await checkLiveAiAvailability();
    updateEngineStatusBadge(!status.liveAvailable);
  } catch (_) {
    updateEngineStatusBadge(true);
  }
}

// ==========================================
// STEP 1 HANDLERS: CODE IMPORT (PASTE, UPLOAD, TEMPLATE, OR OPTIONAL GITHUB)
// ==========================================
function setupStep1Handlers() {
  const loadBtn = document.getElementById('load-repo-btn');
  const sampleBtn = document.getElementById('load-sample-btn');
  const urlInput = document.getElementById('github-repo-url');
  const fileSelect = document.getElementById('repo-file-select');
  const proceedBtn = document.getElementById('proceed-to-mode-btn');

  const tabPasteBtn = document.getElementById('tab-btn-paste');
  const tabUploadBtn = document.getElementById('tab-btn-upload');
  const tabTemplatesBtn = document.getElementById('tab-btn-templates');
  const tabGithubBtn = document.getElementById('tab-btn-github');

  const panelPaste = document.getElementById('panel-paste');
  const panelUpload = document.getElementById('panel-upload');
  const panelTemplates = document.getElementById('panel-templates');
  const panelGithub = document.getElementById('panel-github');

  const pasteFilenameInput = document.getElementById('paste-filename');
  const pasteCodeInput = document.getElementById('paste-code-content');
  const pasteApplyBtn = document.getElementById('paste-apply-btn');
  const localFileInput = document.getElementById('local-file-input');

  const tabs = [
    { btn: tabPasteBtn, panel: panelPaste },
    { btn: tabUploadBtn, panel: panelUpload },
    { btn: tabTemplatesBtn, panel: panelTemplates },
    { btn: tabGithubBtn, panel: panelGithub }
  ];

  function switchTab(activeBtn, activePanel) {
    clearStep1Error();
    tabs.forEach(({ btn, panel }) => {
      if (!btn || !panel) return;
      if (btn === activeBtn) {
        btn.setAttribute('aria-selected', 'true');
        btn.className = 'px-3.5 py-2 rounded-lg text-xs font-semibold transition-smooth bg-blue-600 text-white shadow-sm flex items-center gap-1.5 min-h-[40px]';
        panel.classList.remove('hidden');
      } else {
        btn.setAttribute('aria-selected', 'false');
        btn.className = 'px-3.5 py-2 rounded-lg text-xs font-medium transition-smooth bg-[#1F2937] text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1.5 min-h-[40px]';
        panel.classList.add('hidden');
      }
    });
  }

  if (tabPasteBtn) tabPasteBtn.addEventListener('click', () => switchTab(tabPasteBtn, panelPaste));
  if (tabUploadBtn) tabUploadBtn.addEventListener('click', () => switchTab(tabUploadBtn, panelUpload));
  if (tabTemplatesBtn) tabTemplatesBtn.addEventListener('click', () => switchTab(tabTemplatesBtn, panelTemplates));
  if (tabGithubBtn) tabGithubBtn.addEventListener('click', () => switchTab(tabGithubBtn, panelGithub));

  // Pre-fill paste textarea with default sample code for instant start
  if (pasteCodeInput && !pasteCodeInput.value) {
    pasteCodeInput.value = SAMPLE_OFFLINE_CODE;
    handleFileSelected('OrderCheckoutService.js', SAMPLE_OFFLINE_CODE, SAMPLE_OFFLINE_CODE.length);
  }

  // 1. Paste Code Handler
  if (pasteApplyBtn) {
    pasteApplyBtn.addEventListener('click', () => {
      clearStep1Error();
      const code = pasteCodeInput ? pasteCodeInput.value.trim() : '';
      if (!code) {
        showStep1Error('Please paste your source code into the editor box first.');
        return;
      }
      const fileName = (pasteFilenameInput && pasteFilenameInput.value.trim()) || 'CustomProjectModule.js';
      state.repoOwner = 'local';
      state.repoName = 'direct-input';
      handleFileSelected(fileName, code, code.length);
    });
  }

  // 2. Upload File Handler
  if (localFileInput) {
    localFileInput.addEventListener('change', () => {
      clearStep1Error();
      const file = localFileInput.files && localFileInput.files[0];
      if (!file) return;

      if (file.size > 100 * 1024) {
        showStep1Error('File exceeds 100 KB limit. Please select a single source code file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = String(e.target.result);
        state.repoOwner = 'local';
        state.repoName = 'uploaded-file';
        handleFileSelected(file.name, content, file.size);

        if (pasteFilenameInput) pasteFilenameInput.value = file.name;
        if (pasteCodeInput) pasteCodeInput.value = content;
      };
      reader.onerror = () => {
        showStep1Error('Could not read the uploaded file. Please try pasting the code text instead.');
      };
      reader.readAsText(file);
    });
  }

  // 3. Sample Templates Handler
  document.querySelectorAll('.template-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      clearStep1Error();
      const key = btn.dataset.template;
      const tmpl = TEMPLATES[key];
      if (tmpl) {
        state.repoOwner = 'demo';
        state.repoName = 'template-' + key;
        handleFileSelected(tmpl.path, tmpl.content, tmpl.content.length);

        if (pasteFilenameInput) pasteFilenameInput.value = tmpl.path;
        if (pasteCodeInput) pasteCodeInput.value = tmpl.content;
      }
    });
  });

  // 4. Optional GitHub Repo Button
  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      clearStep1Error();
      const rawUrl = urlInput.value.trim();

      if (!rawUrl) {
        showStep1Error('Please enter a public GitHub repository URL, or switch to the "Paste Code" / "Sample Templates" tab.');
        return;
      }

      try {
        const { owner, repo } = parseGitHubUrl(rawUrl);
        setLoadingState(loadBtn, true, 'Loading repo...');

        // 1. Fetch metadata
        const meta = await fetchRepoMetadata(owner, repo);
        state.repoOwner = owner;
        state.repoName = repo;
        state.defaultBranch = meta.defaultBranch;

        // 2. Fetch file tree
        const files = await fetchRepoFileTree(owner, repo, meta.defaultBranch);
        state.eligibleFiles = files;

        // 3. Populate file dropdown
        populateFileDropdown(files);
        setLoadingState(loadBtn, false, 'Load repo');
      } catch (err) {
        setLoadingState(loadBtn, false, 'Load repo');
        showStep1Error(err.message);
      }
    });
  }

  // Quick Load Sample Code Button (kept for backward compatibility)
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      clearStep1Error();
      state.repoOwner = 'demo';
      state.repoName = 'sample-project';
      state.defaultBranch = 'main';
      state.eligibleFiles = [
        { path: 'src/services/OrderCheckoutService.js', size: SAMPLE_OFFLINE_CODE.length }
      ];

      populateFileDropdown(state.eligibleFiles);
      handleFileSelected('src/services/OrderCheckoutService.js', SAMPLE_OFFLINE_CODE, SAMPLE_OFFLINE_CODE.length);
    });
  }

  // Dropdown Change Handler
  if (fileSelect) {
    fileSelect.addEventListener('change', async () => {
      const selectedPath = fileSelect.value;
      if (!selectedPath) return;

      if (state.repoOwner === 'demo') {
        handleFileSelected(selectedPath, SAMPLE_OFFLINE_CODE, SAMPLE_OFFLINE_CODE.length);
        return;
      }

      try {
        fileSelect.disabled = true;
        const fileData = await fetchFileContent(state.repoOwner, state.repoName, selectedPath);
        handleFileSelected(fileData.path, fileData.content, fileData.size);
      } catch (err) {
        showStep1Error(err.message);
      } finally {
        fileSelect.disabled = false;
      }
    });
  }

  // Proceed to Step 2
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (!state.selectedFile || !state.selectedFile.content) {
        showStep1Error('Please select or paste a valid code file first.');
        return;
      }
      renderStep(2);
    });
  }
}

function populateFileDropdown(files) {
  const pickerContainer = document.getElementById('file-picker-container');
  const fileSelect = document.getElementById('repo-file-select');
  const countEl = document.getElementById('eligible-files-count');

  if (countEl) countEl.textContent = String(files.length);
  fileSelect.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '-- Choose a file to defend --';
  fileSelect.appendChild(placeholder);

  files.forEach((f) => {
    const opt = document.createElement('option');
    opt.value = f.path;
    const sizeKb = (f.size / 1024).toFixed(1);
    opt.textContent = `${f.path} (${sizeKb} KB)`;
    fileSelect.appendChild(opt);
  });

  pickerContainer.classList.remove('hidden');

  // Automatically select the first file if available
  if (files.length > 0) {
    fileSelect.value = files[0].path;
    fileSelect.dispatchEvent(new Event('change'));
  }
}

function handleFileSelected(path, content, size) {
  state.selectedFile = { path, content, size };

  const previewCard = document.getElementById('file-preview-card');
  const previewFilename = document.getElementById('preview-filename');
  const previewFilesize = document.getElementById('preview-filesize');
  const previewSnippet = document.getElementById('code-snippet-preview');

  if (previewFilename) previewFilename.textContent = path;
  if (previewFilesize) previewFilesize.textContent = `${(size / 1024).toFixed(1)} KB`;
  if (previewSnippet) {
    // Show first 20 lines as preview
    const lines = content.split('\n').slice(0, 20).join('\n');
    previewSnippet.textContent = lines + (content.split('\n').length > 20 ? '\n... (truncated preview)' : '');
  }

  if (previewCard) previewCard.classList.remove('hidden');
}

function showStep1Error(msg) {
  const errEl = document.getElementById('github-url-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
}

function clearStep1Error() {
  const errEl = document.getElementById('github-url-error');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
}

// ==========================================
// STEP 2 HANDLERS: INTERVIEWER MODE
// ==========================================
function setupStep2Handlers() {
  const backBtn = document.getElementById('back-to-step-1-btn');
  const generateBtn = document.getElementById('generate-questions-btn');
  const modeRadios = document.querySelectorAll('input[name="interviewer-mode"]');

  // Mode radio card selection styling
  modeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      state.selectedMode = radio.value;
      updateModeCardsUI();
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderStep(1);
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      renderStep(3);
      await loadQuestionsForStep3();
    });
  }
}

function updateModeCardsUI() {
  document.querySelectorAll('.mode-card').forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      card.className = 'mode-card flex flex-col justify-between p-4 rounded-xl border-2 border-blue-500 bg-blue-950/20 cursor-pointer transition-smooth';
    } else {
      card.className = 'mode-card flex flex-col justify-between p-4 rounded-xl border border-[#1F2937] bg-[#0B0F17]/50 hover:border-slate-600 cursor-pointer transition-smooth';
    }
  });
}

// ==========================================
// STEP 3 HANDLERS: DEFEND QUESTIONS
// ==========================================
function setupStep3Handlers() {
  const backBtn = document.getElementById('back-to-step-2-btn');
  const submitBtn = document.getElementById('submit-answers-btn');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderStep(2);
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      clearSubmissionError();

      // Validate all answers have at least 20 chars
      const textareas = document.querySelectorAll('.answer-textarea');
      const answers = [];

      for (let i = 0; i < textareas.length; i++) {
        const val = textareas[i].value.trim();
        if (val.length < 20) {
          showSubmissionError(`Please provide at least 20 characters for Answer #${i + 1} before submitting.`);
          textareas[i].focus();
          return;
        }
        answers.push(val);
      }

      state.answers = answers;
      setLoadingState(submitBtn, true, 'Evaluating answers against rubric...');

      try {
        const evals = [];
        for (let i = 0; i < state.questions.length; i++) {
          const q = state.questions[i];
          const a = answers[i];
          const evalResult = await gradeStudentAnswer(q.text, a, state.selectedFile.content, state.selectedFile.path, state.selectedMode);
          evals.push(evalResult);
        }

        state.evaluations = evals;

        // Save session result
        const overallScore = evals.reduce((sum, e) => sum + (e.total || 0), 0);
        saveDefenseResult({
          file: state.selectedFile.path,
          mode: state.selectedMode,
          score: overallScore,
          maxScore: 45
        });

        setLoadingState(submitBtn, false, 'Submit Answers & Get Evaluation');
        renderStep(4);
        renderResultsStep4();
      } catch (err) {
        setLoadingState(submitBtn, false, 'Submit Answers & Get Evaluation');
        showSubmissionError('Evaluation failed. Please try again.');
      }
    });
  }
}

async function loadQuestionsForStep3() {
  const loading = document.getElementById('questions-loading');
  const container = document.getElementById('questions-list-container');
  const fileDisplay = document.getElementById('active-file-display');

  if (fileDisplay && state.selectedFile) {
    fileDisplay.textContent = state.selectedFile.path;
  }

  if (loading) loading.classList.remove('hidden');
  if (container) container.classList.add('hidden');

  try {
    const res = await getInterviewQuestions(state.selectedFile.content, state.selectedFile.path, state.selectedMode);
    state.isMock = res.isMock;
    state.questions = res.questions;
    state.studyConcepts = res.studyConcepts;

    updateEngineStatusBadge(state.isMock);
    renderQuestionCards(res.questions);
  } catch (err) {
    // Safety fallback
  } finally {
    if (loading) loading.classList.add('hidden');
    if (container) container.classList.remove('hidden');
  }
}

function renderQuestionCards(questions) {
  const container = document.getElementById('questions-list-container');
  container.innerHTML = '';

  questions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-xl bg-[#0B0F17] border border-[#1F2937] space-y-3';

    // Header with Question number and Concept Pill
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between text-xs font-mono';

    const numSpan = document.createElement('span');
    numSpan.className = 'font-bold text-blue-400';
    numSpan.textContent = `Question ${index + 1} of 3`;

    const conceptSpan = document.createElement('span');
    conceptSpan.className = 'px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]';
    conceptSpan.textContent = q.targetConcept || 'Architecture';

    header.appendChild(numSpan);
    header.appendChild(conceptSpan);

    // Question Text (Strictly safe with textContent)
    const qText = document.createElement('p');
    qText.className = 'text-sm font-semibold text-white leading-relaxed';
    qText.textContent = q.text;

    // Answer Label & Counter Row (placed above textarea to remain visible on mobile keyboards)
    const labelRow = document.createElement('div');
    labelRow.className = 'flex items-center justify-between text-[11px]';

    const label = document.createElement('label');
    label.setAttribute('for', `answer-${index}`);
    label.className = 'block font-semibold text-slate-400 uppercase tracking-wider text-[11px]';
    label.textContent = 'Your Technical Defense:';

    // Character Counter
    const counter = document.createElement('div');
    counter.className = 'text-right font-mono text-slate-500 text-[11px]';
    counter.textContent = '0 / 2000 (min 20)';

    labelRow.appendChild(label);
    labelRow.appendChild(counter);

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.id = `answer-${index}`;
    textarea.rows = 4;
    textarea.maxLength = 2000;
    textarea.className = 'answer-textarea w-full bg-[#111827] border border-[#1F2937] rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-smooth';
    textarea.placeholder = 'Type your technical explanation (e.g. why this pattern was chosen, how errors are caught, and performance trade-offs)...';

    textarea.addEventListener('input', () => {
      const len = textarea.value.trim().length;
      counter.textContent = `${len} / 2000 (min 20)`;
      if (len >= 20) {
        counter.className = 'text-right font-mono text-emerald-400 text-[11px]';
      } else {
        counter.className = 'text-right font-mono text-slate-500 text-[11px]';
      }
    });

    card.appendChild(header);
    card.appendChild(qText);
    card.appendChild(labelRow);
    card.appendChild(textarea);

    container.appendChild(card);
  });
}

function showSubmissionError(msg) {
  const errEl = document.getElementById('submission-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
}

function clearSubmissionError() {
  const errEl = document.getElementById('submission-error');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
}

// ==========================================
// STEP 4 HANDLERS: RUBRIC RESULTS
// ==========================================
function setupStep4Handlers() {
  const restartBtn = document.getElementById('restart-defense-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.selectedFile = null;
      state.answers = ['', '', ''];
      state.evaluations = [];
      renderStep(1);
    });
  }
}

function renderResultsStep4() {
  const container = document.getElementById('results-list-container');
  const overallScoreEl = document.getElementById('overall-score-display');
  const conceptsListEl = document.getElementById('study-concepts-list');

  container.innerHTML = '';

  let cumulativeScore = 0;
  const maxPossible = state.questions.length * 15; // 45 max

  state.evaluations.forEach((res, i) => {
    cumulativeScore += res.total || 0;

    const card = document.createElement('div');
    card.className = 'p-5 rounded-xl bg-[#0B0F17] border border-[#1F2937] space-y-4';

    // Header: Question & Total score for this question
    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between border-b border-[#1F2937] pb-3 text-xs';

    const qNum = document.createElement('span');
    qNum.className = 'font-mono font-bold text-slate-300';
    qNum.textContent = `Question ${i + 1}`;

    const scorePill = document.createElement('span');
    scorePill.className = 'font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20';
    scorePill.textContent = `${res.total || 0} / 15 points`;

    topRow.appendChild(qNum);
    topRow.appendChild(scorePill);

    // Question Text
    const qText = document.createElement('p');
    qText.className = 'text-xs sm:text-sm font-semibold text-white';
    qText.textContent = state.questions[i].text;

    // Student's answer quote
    const ansBox = document.createElement('div');
    ansBox.className = 'bg-[#111827] p-3 rounded-lg border border-[#1F2937] text-xs text-slate-300 space-y-1';
    
    const ansLabel = document.createElement('span');
    ansLabel.className = 'text-[10px] uppercase font-mono text-slate-500 block';
    ansLabel.textContent = 'Your Answer:';

    const ansContent = document.createElement('p');
    ansContent.className = 'italic';
    ansContent.textContent = `"${state.answers[i]}"`;

    ansBox.appendChild(ansLabel);
    ansBox.appendChild(ansContent);

    // Rubric Breakdown (Clarity, Accuracy, Depth)
    const rubricGrid = document.createElement('div');
    rubricGrid.className = 'grid grid-cols-3 gap-2 text-center text-xs font-mono';

    rubricGrid.appendChild(createRubricPill('Clarity', res.clarity || 0));
    rubricGrid.appendChild(createRubricPill('Accuracy', res.accuracy || 0));
    rubricGrid.appendChild(createRubricPill('Depth', res.depth || 0));

    // Constructive Feedback
    const feedbackBox = document.createElement('div');
    feedbackBox.className = 'p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200';
    feedbackBox.textContent = res.feedback;

    card.appendChild(topRow);
    card.appendChild(qText);
    card.appendChild(ansBox);
    card.appendChild(rubricGrid);
    card.appendChild(feedbackBox);

    container.appendChild(card);
  });

  // Overall Score & Certificate Issuance
  const pct = Math.round((cumulativeScore / maxPossible) * 100);
  if (overallScoreEl) {
    overallScoreEl.textContent = `${cumulativeScore} / ${maxPossible} (${pct}%)`;
  }

  // Automatic Certificate Generation for 50%+ Score
  const awardContainer = document.getElementById('defense-certificate-award');
  if (awardContainer) {
    if (pct >= 50) {
      const issueResult = checkAndIssueCertificate({
        score: cumulativeScore,
        maxScore: maxPossible,
        type: 'Oral Project Defense',
        projectOrFile: state.selectedFile ? state.selectedFile.path : 'Repository Source Code'
      });
      if (issueResult.issued) {
        awardContainer.classList.remove('hidden');
        renderCertificateUI(awardContainer, issueResult.cert);
      }
    } else {
      awardContainer.classList.add('hidden');
    }
  }

  // Recommended Study Concepts
  if (conceptsListEl) {
    conceptsListEl.innerHTML = '';
    state.studyConcepts.forEach((concept) => {
      const li = document.createElement('li');
      li.textContent = concept;
      conceptsListEl.appendChild(li);
    });
  }
}

function createRubricPill(label, score) {
  const div = document.createElement('div');
  div.className = 'p-2 rounded bg-[#111827] border border-[#1F2937]';

  const title = document.createElement('span');
  title.className = 'text-[10px] text-slate-400 block';
  title.textContent = label;

  const val = document.createElement('span');
  val.className = 'text-xs font-bold text-white';
  val.textContent = `${score} / 5`;

  div.appendChild(title);
  div.appendChild(val);
  return div;
}

// ==========================================
// NAVIGATION & PROGRESS CONTROLLER
// ==========================================
function renderStep(stepNumber) {
  state.step = stepNumber;

  // Toggle step panels
  document.getElementById('step-1-panel').classList.toggle('hidden', stepNumber !== 1);
  document.getElementById('step-2-panel').classList.toggle('hidden', stepNumber !== 2);
  document.getElementById('step-3-panel').classList.toggle('hidden', stepNumber !== 3);
  document.getElementById('step-4-panel').classList.toggle('hidden', stepNumber !== 4);

  // Update top step indicators
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`step-ind-${i}`);
    if (!ind) continue;

    if (i === stepNumber) {
      ind.className = 'flex items-center gap-2 text-blue-400 font-bold';
      ind.querySelector('span').className = 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs';
    } else if (i < stepNumber) {
      ind.className = 'flex items-center gap-2 text-emerald-400 font-medium';
      ind.querySelector('span').className = 'w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs';
    } else {
      ind.className = 'flex items-center gap-2 text-slate-500';
      ind.querySelector('span').className = 'w-6 h-6 rounded-full bg-[#111827] border border-[#1F2937] text-slate-400 flex items-center justify-center text-xs';
    }
  }

  // Update compact mobile step label
  const mobileLabel = document.getElementById('mobile-step-summary');
  if (mobileLabel) {
    const titles = ['Import Code', 'Interviewer Mode', 'Defend (Questions)', 'Rubric Results'];
    mobileLabel.textContent = `Step ${stepNumber} of 4: ${titles[stepNumber - 1]}`;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateEngineStatusBadge(isMock) {
  const badge = document.getElementById('engine-status-badge');
  const label = document.getElementById('engine-status-text');

  if (isMock) {
    badge.className = 'px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#111827] border border-amber-500/30 text-amber-400 flex items-center gap-1.5';
    badge.querySelector('span').className = 'w-2 h-2 rounded-full bg-amber-400';
    label.textContent = 'Mock Mode (Offline)';
  } else {
    badge.className = 'px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#111827] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5';
    badge.querySelector('span').className = 'w-2 h-2 rounded-full bg-emerald-400';
    label.textContent = 'Live AI Mode';
  }
}

function setLoadingState(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = text;
}
