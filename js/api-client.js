/**
 * api-client.js
 * Client-side interface for generating questions and grading answers.
 * Attempts to call the serverless endpoint `/api/defense`.
 * If no key exists or network fails, automatically falls back to offline Mock Mode.
 */

import { generateMockQuestions, evaluateMockAnswer, getStudyConcepts } from './mock.js';

/**
 * Generates 3 interview questions for the given code and mode.
 * @param {string} code 
 * @param {string} fileName 
 * @param {'gentle'|'standard'|'brutal'} mode 
 * @returns {Promise<{ isMock: boolean, questions: Array<any>, studyConcepts: Array<string> }>}
 */
export async function getInterviewQuestions(code, fileName, mode) {
  try {
    const res = await fetch('/api/defense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'questions',
        mode,
        fileName,
        code
      })
    });

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
  } catch (err) {
    // Network error or local static server without serverless runtime
  }

  // Graceful fallback to deterministic offline Mock Mode
  const mockQuestions = generateMockQuestions(code, fileName, mode);
  const mockConcepts = getStudyConcepts(code);

  return {
    isMock: true,
    questions: mockQuestions,
    studyConcepts: mockConcepts
  };
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
  try {
    const res = await fetch('/api/defense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'grade',
        mode,
        fileName,
        code,
        question,
        answer
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data.total === 'number') {
        return {
          isMock: false,
          ...data
        };
      }
    }
  } catch (err) {
    // Fall through to mock
  }

  // Offline mock rubric evaluation
  const mockResult = evaluateMockAnswer(question, answer, code, mode);
  return {
    isMock: true,
    ...mockResult
  };
}
