/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * api-client.js
 * Client-side interface for generating questions and grading answers.
 * Attempts to call the serverless endpoint `/api/defense`.
 * Enforces 25s timeout and gracefully degrades to offline Mock Mode on any failure.
 */

import { generateMockQuestions, evaluateMockAnswer, getStudyConcepts } from './mock.js';

const AI_ROUTE_TIMEOUT_MS = 25000; // 25 seconds limit for LLM inference

/**
 * Checks if Live AI is configured on the backend without triggering question generation.
 * @returns {Promise<{ ok: boolean, liveAvailable: boolean }>}
 */
export async function checkLiveAiAvailability() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, liveAvailable: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/defense', {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return { ok: true, liveAvailable: Boolean(data.liveAvailable) };
    }
  } catch (_) {
    clearTimeout(timer);
  }

  return { ok: false, liveAvailable: false };
}

/**
 * Generates 3 interview questions for the given code and mode.
 * @param {string} code 
 * @param {string} fileName 
 * @param {'gentle'|'standard'|'brutal'} mode 
 * @returns {Promise<{ isMock: boolean, questions: Array<any>, studyConcepts: Array<string> }>}
 */
export async function getInterviewQuestions(code, fileName, mode) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return getOfflineMockQuestions(code, fileName, mode);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_ROUTE_TIMEOUT_MS);

  try {
    const res = await fetch('/api/defense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'questions',
        mode,
        fileName,
        code
      })
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length >= 3) {
        return {
          isMock: false,
          questions: data.questions,
          studyConcepts: data.studyConcepts || getStudyConcepts(code)
        };
      }
    }
  } catch (_) {
    clearTimeout(timer);
    // Silent degradation to Mock Mode
  }

  return getOfflineMockQuestions(code, fileName, mode);
}

/**
 * Grades an individual answer against the rubric.
 * @param {string} question 
 * @param {string} answer 
 * @param {string} code 
 * @param {string} fileName 
 * @param {'gentle'|'standard'|'brutal'} mode 
 * @returns {Promise<{ isMock: boolean, clarity: number, accuracy: number, depth: number, total: number, feedback: string }>}
 */
export async function gradeStudentAnswer(question, answer, code, fileName, mode) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return getOfflineMockEvaluation(question, answer, code, mode);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_ROUTE_TIMEOUT_MS);

  try {
    const res = await fetch('/api/defense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'grade',
        mode,
        fileName,
        code,
        question,
        answer
      })
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.total === 'number') {
        return {
          isMock: false,
          ...data
        };
      }
    }
  } catch (_) {
    clearTimeout(timer);
    // Silent degradation to Mock Mode
  }

  return getOfflineMockEvaluation(question, answer, code, mode);
}

function getOfflineMockQuestions(code, fileName, mode) {
  const mockQuestions = generateMockQuestions(code, fileName, mode);
  const mockConcepts = getStudyConcepts(code);
  return {
    isMock: true,
    questions: mockQuestions,
    studyConcepts: mockConcepts
  };
}

function getOfflineMockEvaluation(question, answer, code, mode) {
  const mockResult = evaluateMockAnswer(question, answer, code, mode);
  return {
    isMock: true,
    ...mockResult
  };
}
