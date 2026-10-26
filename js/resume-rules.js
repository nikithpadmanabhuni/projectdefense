/**
 * ProjectDefense - Proprietary & Confidential
 * Copyright (c) 2026 Nikith Padmanabhuni. All Rights Reserved.
 * Unauthorized copying, distribution, reverse-engineering, or commercial use is strictly prohibited.
 */

/**
 * resume-rules.js
 * Rule-based resume bullet checker and rewriter.
 * Strictly adheres to rule: NEVER invent numbers, metrics, or technologies.
 * Detects passive filler, missing results, and weak phrasing without external AI.
 */

export const ACTION_VERBS = [
  'Built',
  'Developed',
  'Designed',
  'Implemented',
  'Integrated',
  'Deployed',
  'Automated',
  'Optimized',
  'Tested'
];

export const KNOWN_TECHS = [
  'React', 'Flutter', 'Dart', 'JavaScript', 'TypeScript', 'Java', 'Python',
  'C++', 'C', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Supabase',
  'HTML', 'CSS', 'Tailwind', 'Node', 'Express', 'FastAPI', 'Django',
  'Spring Boot', 'Docker', 'Redis', 'Git', 'AWS', 'REST', 'GraphQL'
];

const FILLER_STARTS = [
  'assisted in',
  'helped',
  'worked on',
  'responsible for',
  'participated in',
  'learned basics of',
  'learned how to',
  'involved in',
  'did project on',
  'created a basic',
  'contributed to'
];

/**
 * Checks a resume bullet for common anti-patterns.
 * @param {string} rawBullet 
 * @returns {{
 *   isValid: boolean,
 *   issues: Array<{ type: string, message: string }>,
 *   detectedTech: Array<string>,
 *   hasMetric: boolean,
 *   hasActionVerb: boolean,
 *   charCount: number
 * }}
 */
export function analyzeBullet(rawBullet) {
  const text = (rawBullet || '').trim();
  const lower = text.toLowerCase();
  const issues = [];

  // Length checks
  if (text.length < 40) {
    issues.push({
      type: 'LENGTH_SHORT',
      message: 'Too short (under 40 characters). Add context on what you engineered and why.'
    });
  } else if (text.length > 200) {
    issues.push({
      type: 'LENGTH_LONG',
      message: 'Too wordy (over 200 characters). Recruiters scan in 6 seconds; keep it under 200 characters.'
    });
  }

  // Filler start check
  const matchedFiller = FILLER_STARTS.find((f) => lower.startsWith(f));
  if (matchedFiller) {
    issues.push({
      type: 'FILLER_START',
      message: `Weak passive start ("${matchedFiller}"). Start directly with a strong past-tense action verb (e.g. "Built", "Designed").`
    });
  }

  // Action verb at start check
  const firstWord = text.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '');
  const startsWithActionVerb = ACTION_VERBS.some((v) => v.toLowerCase() === firstWord?.toLowerCase());
  if (!startsWithActionVerb && !matchedFiller) {
    issues.push({
      type: 'NO_ACTION_VERB',
      message: `Does not start with an approved action verb. Start with words like "Architected", "Engineered", "Implemented", or "Built".`
    });
  }

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

  // Known tech detection
  const detectedTech = KNOWN_TECHS.filter((tech) => {
    const regex = new RegExp(`(?:^|\\W)${escapeRegex(tech)}(?=\\W|$)`, 'i');
    return regex.test(text);
  });

  if (detectedTech.length === 0) {
    issues.push({
      type: 'MISSING_TECH',
      message: 'No specific engineering tools or technologies named. Explicitly list the stack (e.g., React, Flutter, SQL, Node).'
    });
  }

  // Measurable result check (numbers, percentages, scale, time)
  const hasMetric = /\b\d+(?:\.\d+)?%?\b|\b(latency|users|throughput|requests|seconds|ms|queries)\b/i.test(text);
  if (!hasMetric) {
    issues.push({
      type: 'MISSING_METRIC',
      message: 'Missing measurable results. Mention concrete facts (e.g., number of test cases, latency reduction, user count, or uptime).'
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
    detectedTech,
    hasMetric,
    hasActionVerb: startsWithActionVerb,
    charCount: text.length
  };
}

/**
 * Creates a template outline for the student to fill in real numbers.
 * Never invents metrics!
 * @param {string} rawBullet 
 * @param {Array<string>} detectedTech 
 * @param {string} chosenVerb 
 * @returns {{ template: string, placeholders: Array<string> }}
 */
export function buildRewriteTemplate(rawBullet, detectedTech = [], chosenVerb = 'Built') {
  const techList = Array.isArray(detectedTech) ? detectedTech : (detectedTech ? [detectedTech] : []);
  const stack = techList.length > 0 ? techList.join(' & ') : '[tech stack]';
  
  // Clean raw bullet into core task
  let cleaned = (rawBullet || '').trim();
  FILLER_STARTS.forEach((f) => {
    if (cleaned.toLowerCase().startsWith(f)) {
      cleaned = cleaned.slice(f.length).trim();
    }
  });

  cleaned = cleaned.replace(/^(an?|the)\s+/i, '');

  return {
    template: `${chosenVerb} [what you built] using ${stack} to [purpose or problem solved], resulting in [measurable result: e.g. N users, X% reduction, or N seconds].`,
    placeholders: [
      '[what you built]',
      '[purpose or problem solved]',
      '[measurable result: e.g. N users, X% reduction, or N seconds]'
    ]
  };
}
