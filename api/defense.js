/**
 * api/defense.js
 * Vercel Serverless Function for ProjectDefense.
 * 
 * GET: Returns status and whether Live AI mode is available (without leaking the key).
 * POST: Handles questions generation or grading via Groq LLM API.
 * 
 * Supports both CommonJS and ES Module exports for Vercel serverless compatibility.
 */

async function handler(req, res) {
  // Always set CORS and JSON headers
  res.setHeader('Content-Type', 'application/json');

  // Handle GET status check
  if (req.method === 'GET') {
    const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
    return res.status(200).json({
      ok: true,
      liveAvailable: hasKey
    });
  }

  // Only allow POST beyond here
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET and POST requests are permitted.'
    });
  }

  // Check for Server-Side Environment Variable
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({
      error: 'NO_KEY',
      message: 'Server environment variable GROQ_API_KEY is not configured.'
    });
  }

  try {
    const { mode = 'standard', fileName = 'code', code = '', action = 'questions', answer = '', question = '' } = req.body || {};

    // Enforce 50KB payload constraint
    if (code && typeof code === 'string' && code.length > 50 * 1024) {
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Code exceeds 50KB limit.'
      });
    }

    if (action === 'questions') {
      return await handleGenerateQuestions(apiKey, mode, fileName, code, res);
    } else if (action === 'grade') {
      return await handleGradeAnswer(apiKey, mode, fileName, code, question, answer, res);
    } else {
      return res.status(400).json({
        error: 'INVALID_ACTION',
        message: 'Action must be "questions" or "grade".'
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected server error occurred: ' + (err.message || String(err))
    });
  }
}

async function handleGenerateQuestions(apiKey, mode, fileName, code, res) {
  const personaInstruction = getPersonaSystemPrompt(mode);

  const prompt = `${personaInstruction}
You are examining a student's source code file named "${fileName}".
Based strictly on the code below, generate exactly 3 targeted interview questions about the architecture, edge cases, and design trade-offs.

CODE:
\`\`\`
${code.slice(0, 15000)}
\`\`\`

Return strictly valid JSON in this exact structure:
{
  "questions": [
    { "id": 1, "text": "Question 1", "targetConcept": "Concept 1" },
    { "id": 2, "text": "Question 2", "targetConcept": "Concept 2" },
    { "id": 3, "text": "Question 3", "targetConcept": "Concept 3" }
  ],
  "studyConcepts": ["Concept A", "Concept B"]
}`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!groqRes.ok) {
    return res.status(502).json({
      error: 'UPSTREAM_API_ERROR',
      message: 'Failed to communicate with LLM provider.'
    });
  }

  const groqData = await groqRes.json();
  const content = groqData.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  return res.status(200).json({
    isMock: false,
    questions: parsed.questions,
    studyConcepts: parsed.studyConcepts || []
  });
}

async function handleGradeAnswer(apiKey, mode, fileName, code, question, answer, res) {
  const personaInstruction = getPersonaSystemPrompt(mode);

  const prompt = `${personaInstruction}
The student was asked this question about their code file "${fileName}":
Question: "${question}"

Student's Answer:
"${answer}"

Evaluate the student's answer on 3 criteria (each scored 1 to 3):
1. Clarity (1-3): Is the explanation concise and structured?
2. Accuracy (1-3): Is the technical explanation correct regarding the code?
3. Depth (1-3): Does it mention trade-offs, edge cases, or architecture reasons?

Calculate total score (clarity + accuracy + depth) out of 9.
Provide constructive, direct feedback (2-3 sentences) on what was good and what was missing.

Return strictly valid JSON in this exact structure:
{
  "clarity": 3,
  "accuracy": 3,
  "depth": 3,
  "total": 9,
  "feedback": "Your constructive feedback here"
}`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!groqRes.ok) {
    return res.status(502).json({
      error: 'UPSTREAM_API_ERROR',
      message: 'Failed to communicate with LLM provider.'
    });
  }

  const groqData = await groqRes.json();
  const content = groqData.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  return res.status(200).json({
    isMock: false,
    clarity: parsed.clarity || 2,
    accuracy: parsed.accuracy || 2,
    depth: parsed.depth || 2,
    total: parsed.total || (parsed.clarity + parsed.accuracy + parsed.depth) || 6,
    feedback: parsed.feedback || 'Good attempt. Focus on articulating architectural trade-offs.'
  });
}

function getPersonaSystemPrompt(mode) {
  switch (mode) {
    case 'gentle':
      return 'You are a supportive College Examiner who wants to help students learn. Ask encouraging, foundational questions about why they chose this structure.';
    case 'brutal':
      return 'You are a Grumpy Senior Staff Engineer at a top tech company. You have zero tolerance for hand-waving or tutorial-copying. Ask tough, razor-sharp questions grilling them on edge cases, race conditions, memory leaks, and architectural trade-offs.';
    case 'standard':
    default:
      return 'You are an experienced Technical Interviewer. Ask fair, practical, probing questions to verify whether the candidate truly understands their code and can explain their choices.';
  }
}

// Support both ES Module and CommonJS exports for Vercel
module.exports = handler;
module.exports.default = handler;
