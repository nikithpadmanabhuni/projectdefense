/**
 * api/defense.js
 * Vercel-style Serverless Function for ProjectDefense AI.
 * Reads GROQ_API_KEY strictly from server-side environment variables.
 * Never exposes the key or logs student code.
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are permitted.' });
  }

  // Check for Server-Side Environment Variable
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({ error: 'NO_KEY', message: 'Server environment variable GROQ_API_KEY is not configured.' });
  }

  try {
    const { mode = 'standard', fileName = 'code', code = '', action = 'questions', answer = '', question = '' } = req.body || {};

    // Enforce 50KB payload constraint
    if (code && typeof code === 'string' && code.length > 50 * 1024) {
      return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'Code exceeds 50KB limit.' });
    }

    if (action === 'questions') {
      return await handleGenerateQuestions(apiKey, mode, fileName, code, res);
    } else if (action === 'grade') {
      return await handleGradeAnswer(apiKey, mode, fileName, code, question, answer, res);
    } else {
      return res.status(400).json({ error: 'INVALID_ACTION', message: 'Action must be "questions" or "grade".' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' });
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
    return res.status(502).json({ error: 'UPSTREAM_API_ERROR', message: 'Failed to communicate with LLM provider.' });
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

Grade the answer using this rubric:
- Clarity (0 to 5): Communication, structure, and readability.
- Accuracy (0 to 5): Technical correctness and understanding of the code.
- Depth (0 to 5): Mention of architectural trade-offs, edge cases, or "because" rationale.

Provide specific, constructive feedback.
Return strictly valid JSON matching this schema:
{
  "clarity": integer,
  "accuracy": integer,
  "depth": integer,
  "total": integer,
  "feedback": "2-3 sentences of honest, constructive feedback."
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
      temperature: 0.2
    })
  });

  if (!groqRes.ok) {
    return res.status(502).json({ error: 'UPSTREAM_API_ERROR', message: 'Failed to communicate with LLM provider.' });
  }

  const groqData = await groqRes.json();
  const content = groqData.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  return res.status(200).json({
    isMock: false,
    ...parsed
  });
}

function getPersonaSystemPrompt(mode) {
  if (mode === 'gentle') {
    return 'You are Prof. Sharma, a gentle and encouraging college examiner interviewing a 3rd year B.Tech student on their project code. Ask conceptual questions testing core fundamentals without being intimidating.';
  }
  if (mode === 'brutal') {
    return 'You are an aggressive, skeptical Senior Startup CTO grilling a candidate. Target weak architecture, missing error boundaries, potential AI boilerplate, race conditions, and lack of unit tests. Be blunt, direct, and rigorous.';
  }
  return 'You are a Senior Technical Lead at a software company conducting a standard technical round. Focus on clean code, maintainability, edge cases, input validation, and production best practices.';
}
