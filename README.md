# ProjectDefense

> "Know your project well enough to defend it."

ProjectDefense is an honest, practical web application designed for 2nd–4th year B.Tech students (CSE/IT) to turn their technical projects into interview-ready stories and practice explaining their code under pressure.

---

## Complete Features

### 1. Landing Page & Gap Analyzer (`index.html`)
- Value statement highlighting the gap between building projects with tutorials/AI and defending code in live technical interviews.
- Clear privacy & data transparency section explaining local storage, zero server tracking, and client-side processing.
- Direct links to all practice modules.

### 2. Profile Baseline & Setup (`onboarding.html`)
- Captures student baseline: Full name, college, branch, year, target role, completed projects count, internship experience, and primary coding language.
- Inline form validation with accessible `aria-live="polite"` error notifications (zero alert boxes).
- Pre-fills with existing profile data if already saved, with a confirmed clear option.

### 3. Student Dashboard & Readiness Tracker (`dashboard.html`)
- Displays student credentials and target role.
- 7-item **Readiness Checklist** that persists across page refreshes in `localStorage`.
- Dynamic **Readiness Score** calculation with a color-coded progress bar and suggested next steps.
- Live summary chips showing No-AI coding attempts and 30-day sprint progress.
- Includes a confirmed **"Reset all my data"** option that completely clears all stored `projectdefense.*` keys.

### 4. Project Defense Oral Exam Simulator (`defense.html`)
- **Step 1 (GitHub Import)**: Parses public repository URLs, fetches metadata, retrieves the default branch file tree, and filters for eligible code files (.js, .dart, .html, .py, .java, .ts, .css) under 50KB. Includes an offline sample project button.
- **Step 2 (Interviewer Mode)**: Select between Gentle College Examiner, Standard HR + Technical, and Brutal Startup CTO.
- **Step 3 (Questions & Defense)**: Formulates 3 targeted questions analyzing function structure, async error handling, and state management. Requires at least 20 characters per answer.
- **Step 4 (Rubric Evaluation)**: Scores each answer across Clarity (0–5), Technical Accuracy (0–5), and Depth (0–5) with an overall score out of 45 and 2 recommended study concepts.
- **Offline Mock Mode**: Runs 100% offline without any API keys.
- **Optional Live AI Mode**: Automatically enables when deployed to Vercel with `GROQ_API_KEY`.

### 5. No-AI Coding Practice Area (`coding.html`)
- 30 high-frequency campus recruitment problems (12 Arrays & Strings, 6 Recursion, 4 Stacks/Queues, 4 Math/Bits, 4 SQL-in-JS).
- Each problem includes at least 2 visible test cases and 3 hidden test cases.
- In-browser code runner using isolated Web Workers with a strict 2-second timeout to safely catch infinite loops without freezing the main thread.
- Plain `<textarea>` editor with zero autocompletion or copilot suggestions.
- Optional **Strict Mode** toggle preventing copy-pasting.
- Countdown timer (15, 20, 30 min) that automatically locks the editor upon expiration.
- Preserves written code per problem in `localStorage`.

### 6. Resume Bullet Improver (`resume.html`)
- Rule-based checker detecting passive filler starts ("Assisted in", "Worked on"), missing action verbs, missing tech stacks, and missing measurable numbers.
- **Strict Rule: Never invents numbers or metrics.** Prompts the student to fill in real facts.
- Mandatory confirmation: *"I confirm every claim in this bullet is true."*
- Maintains up to 10 saved drafts in storage with copy and delete controls.

### 7. 30-Day Placement Sprint (`sprint.html`)
- Day-by-day checklist covering the 25 core algorithm patterns, 10 SQL queries, and 5 system design concepts.
- Interactive SQL practice section with normalized text self-checking.
- Automatic **Weak-Topic Alert** triggered if any topic falls below a 50% pass rate in coding attempts.
- Streak counter and progress bar persisting across refreshes.

### 8. Student Pilot Kit & Feedback (`feedback.html`)
- Collects pilot testing ratings (usefulness 1–5, realism 1–5, confusion notes, reuse likelihood).
- Submitting downloads a client-side JSON response file for zero-infrastructure data collection.
- Ready for future Google Form or backend webhook integration.

---

## File Tree

```
projectdefense/
├── index.html          # Landing page with value statement & privacy notice
├── onboarding.html     # Profile setup form with inline validation
├── dashboard.html      # Shows profile + interactive checklist + reset all data
├── defense.html        # Interactive 4-step Project Defense oral exam module
├── coding.html         # No-AI coding sandbox with 30 problems & Web Worker runner
├── resume.html         # Resume bullet improver (never invents numbers)
├── sprint.html         # 30-Day placement sprint schedule & SQL self-check
├── feedback.html       # Pilot feedback form with downloadable response file
├── vercel.json         # Vercel deployment configuration with clean URLs
├── css/
│   └── custom.css      # Dark theme styling, visible focus rings, and transitions
├── js/
│   ├── storage.js      # Centralized localStorage helper for all modules
│   ├── onboarding.js   # Form validation, pre-fill logic, and save handlers
│   ├── dashboard.js    # Profile renderer, checklist persistence, and stats
│   ├── nav.js          # Shared, accessible header navigation across all pages
│   ├── github.js       # GitHub URL parsing, repo metadata, file tree & content fetch
│   ├── defense.js      # 4-step defense workflow, answer validation & UI state
│   ├── mock.js         # Offline deterministic question generator & rubric scorer
│   ├── api-client.js   # Calls /api/defense with graceful fallback to Mock Mode
│   ├── problems.js     # Bank of 30 problems with visible and hidden tests
│   ├── runner.js       # Isolated Web Worker runner with 2s timeout & deep equality
│   ├── coding.js       # Coding workbench controller, filters, timer, and attempts
│   ├── resume-rules.js # Rule-based bullet anti-pattern detection & template builder
│   ├── resume.js       # Resume UI controller, draft saving & character limits
│   └── sprint.js       # 30-day plan checklist, SQL self-checker & weak-topic alerts
├── api/
│   └── defense.js      # Serverless function (Vercel-style) calling Groq (Llama 3.3)
├── .env.example        # Documentation for optional serverless GROQ_API_KEY
├── .gitignore          # Ignores .env, .vercel, and node artifacts
└── README.md           # Documentation, run instructions, and pilot guide
```

---

## How to Run Locally

### 1. Running in Mock Mode (Default - Zero API Key Needed)
Run standard static server. The app automatically detects that no serverless `/api` endpoint is available and runs 100% offline using the built-in deterministic evaluation engine in `js/mock.js`.

```bash
# Navigate to the project folder
cd projectdefense

# Start a local HTTP server on port 8000
python3 -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

*(Or with npx: `npx serve .`)*

---

## How to Deploy to Vercel

ProjectDefense is pre-configured for instant zero-configuration deployment on Vercel:

1. Push your repository to GitHub (ensure `.env` is ignored by `.gitignore`).
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Root Directory to `projectdefense` (or deploy from workspace root).
4. (Optional) In your Vercel Project Settings &rarr; **Environment Variables**, add:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_...` (obtain free at [console.groq.com](https://console.groq.com))
5. Deploy!
   - If `GROQ_API_KEY` is set, Project Defense runs in **Live AI Mode**.
   - If not set, Project Defense automatically falls back to **Mock Mode (Offline)** and displays the badge.

---

## Security & Hardening Checklist

- **Content Security Policy (CSP)**: Added `<meta http-equiv="Content-Security-Policy">` to all HTML pages restricting sources to `'self'`, `https://cdn.tailwindcss.com`, `worker-src blob:`, and `https://api.github.com`.
- **Zero XSS**: All dynamic user inputs, GitHub code, and evaluation text are rendered strictly via `textContent` or programmatic DOM creation, never `innerHTML`.
- **Web Worker Sandbox**: Code execution runs inside an isolated Web Worker with a 2-second timeout. The main window's DOM, storage, and network are completely unexposed.
- **Hidden Test Privacy**: Hidden test inputs are never rendered in failure messages or outputs.
- **Zero Client Secrets**: No API keys or tokens are stored in client-side code.
- **Privacy Transparency**: Clear disclosure on `index.html` detailing local storage usage and zero server tracking.

---

## Student Pilot Plan (1 to 2 Weeks)

1. **Self-Test (Day 1)**:
   - Create a profile on `onboarding.html`.
   - Load a public repository in `defense.html` and answer all 3 questions.
   - Solve 1 timed problem on `coding.html` and verify timer countdown.
   - Run the resume bullet checker on `resume.html`.
2. **Invite 5 Classmates (Days 2 to 3)**:
   - Share your live link with trusted classmates: *"I built a practice tool that asks questions about your own GitHub project and tests coding without AI. Please try it and share feedback at the end."*
3. **Expand to 15–20 Students (Days 4 to 10)**:
   - Collect `.json` feedback files via `feedback.html`.
   - Review weak-topic alerts and questions that felt unrealistic.
4. **Prioritize Next Steps (Day 11+)**:
   - Fix the top 3 user-reported points before adding new features.
