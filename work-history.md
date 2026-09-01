# CodeMentor AI — Work History & Handoff Document

**Purpose:** Handoff document for a new coding agent or developer.  
**Project:** CodeMentor AI — Interactive Python Learning Platform  
**Repository:** https://github.com/Suhail-khan-91/CodeMentor-AI.git  
**Branch:** `master`  
**Local directory:** `C:\Users\Suhail\Desktop\Soheab\code-mentor\`  
**PRD (source of truth):** `CodeMentor_AI_Project_Blueprint_PRD.md` (in project root)

---

## Project Overview

CodeMentor AI is built in two major parts:
- **Part A — Core Platform Engine** (currently in progress, A1+A2 complete)
- **Part B — Educational Course** (not started, begins after Part A is stable)

Part A is divided into 14 phases (A1–A14). Each phase is completed and tested before moving to the next.

---

## PHASE A1 — Project Foundation

**Status:** ✅ COMPLETE  
**Git commit:** `83baae4` — "Phase A1: Project Foundation - React+Vite frontend, Flask backend, health API, git setup"  
**Date completed:** 2026-09-01

---

### What Was Built

#### Backend — Flask Application

**Technology:** Python 3.14, Flask 3.0.3, flask-cors 4.0.1, python-dotenv 1.0.1, pytest 8.2.2

**Virtual environment location:** `backend/venv/` (excluded from Git via `.gitignore`)

**Files created:**

| File | Purpose |
|------|---------|
| `backend/run.py` | Flask entry point — runs `create_app()` and starts dev server on port 5000 |
| `backend/requirements.txt` | Python dependencies: Flask, flask-cors, python-dotenv, pytest |
| `backend/.env.example` | Example env vars (copy to `.env` for local use — `.env` is gitignored) |
| `backend/app/__init__.py` | **App factory** — `create_app(config_name)` creates Flask instance, loads config, enables CORS, registers blueprints |
| `backend/app/config.py` | Three config classes: `DevelopmentConfig`, `TestingConfig`, `ProductionConfig`. Selected via `FLASK_ENV` env var. Uses `python-dotenv` to load `.env`. |
| `backend/app/routes/__init__.py` | Routes package init (comment only) |
| `backend/app/routes/health.py` | `GET /api/health` blueprint (`health_bp`). Returns `{"status":"ok","service":"CodeMentor AI Backend","phase":"A1"}`. Also registers JSON `404` and `500` error handlers. |
| `backend/app/services/__init__.py` | Empty placeholder — future service modules go here |
| `backend/app/utils/__init__.py` | Empty placeholder — future utility modules go here |
| `backend/tests/__init__.py` | Test package init |
| `backend/tests/test_health.py` | 5 pytest tests: HTTP 200, JSON content type, `status == ok`, service field present, unknown route returns JSON 404 |

**How to start the backend:**
```bash
cd backend
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux
python run.py
# Runs on http://localhost:5000
```

**How to run backend tests:**
```bash
cd backend
.\venv\Scripts\activate
python -m pytest tests/ -v
# Result: 5 passed in 0.14s
```

**Key API endpoint:**
```
GET http://localhost:5000/api/health
Response: {"status": "ok", "service": "CodeMentor AI Backend", "phase": "A1"}
```

**Architecture decisions:**
- App factory pattern (`create_app`) chosen so new blueprints can be registered cleanly in future phases without modifying core files.
- Each feature group (runner, diagnostics, AI, etc.) will get its own blueprint in `app/routes/`.
- Config is environment-based (not hardcoded). Set `FLASK_ENV=development|testing|production`.
- CORS is enabled globally via `flask-cors`, `ALLOWED_ORIGIN` defaults to `http://localhost:5173`.

---

#### Frontend — React + Vite Application

**Technology:** React 19, Vite 8.2.2, plain CSS (no Tailwind, no UI library)

**How to install dependencies:**
```bash
cd frontend
npm install
```

**How to start the frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173 (may use 5174 if 5173 is occupied)
```

**Files created:**

| File | Purpose |
|------|---------|
| `frontend/index.html` | Page title "CodeMentor AI", meta description |
| `frontend/vite.config.js` | Vite config — **dev proxy**: all `/api/*` requests forwarded to `http://localhost:5000`. This means the frontend calls `/api/health` (not `http://localhost:5000/api/health`) and Vite proxies it to Flask. No CORS issues in dev. |
| `frontend/.env.example` | `VITE_API_BASE_URL=` (leave blank to use Vite proxy; set if pointing to remote backend) |
| `frontend/src/index.css` | **Global CSS design system** — CSS custom properties (tokens) for colours, typography, spacing, radii, shadows. Google Font: Inter. Full reset. `.container` utility class. |
| `frontend/src/main.jsx` | React entry point — unchanged from Vite scaffold |
| `frontend/src/App.jsx` | App root — Phase A1 version simply renders `<Navbar /> + <Home />` |
| `frontend/src/App.css` | Minimal: `.app { min-height: 100vh; display: flex; flex-direction: column; }` |
| `frontend/src/services/api.js` | **Centralised API layer** — `apiGet(path)` and `checkHealth()`. All fetch calls go here. Uses `VITE_API_BASE_URL` env var (empty = use Vite proxy). |
| `frontend/src/components/Navbar.jsx` | Sticky glassmorphism navbar — brand, nav links array, phase badge |
| `frontend/src/components/Navbar.css` | Backdrop-blur, brand, nav link, phase badge styles |
| `frontend/src/components/StatusBadge.jsx` | Backend connection indicator — three states: `loading` (pulsing dot), `connected` (green), `error` (red). Accessible with `aria-live`. |
| `frontend/src/components/StatusBadge.css` | Animated dot, state-based border/glow colours |
| `frontend/src/pages/Home.jsx` | Dashboard — hero section, calls `checkHealth()` on mount, shows `StatusBadge`, 6 feature cards for future phases |
| `frontend/src/pages/Home.css` | Hero grid, gradient heading, macOS-style code preview decoration, responsive feature card grid with hover animations |

**CSS design tokens (defined in `index.css` `:root`):**
```
--color-bg, --color-surface, --color-surface-2, --color-border
--color-primary (#6c63ff), --color-primary-hover (#8179ff)
--color-accent (#00d4aa), --color-text, --color-text-muted
--color-success (#22c55e), --color-error (#ef4444), --color-warning (#f59e0b)
--font-family (Inter), font sizes, spacing scale, radii, shadows
```

**Architecture decisions:**
- API calls are centralised in `src/services/api.js` — UI components never contain `fetch()` calls directly.
- Vite dev proxy (`/api → localhost:5000`) means no CORS config needed on the Flask side during development (though CORS is still enabled on Flask for completeness).
- Directories created but empty in A1: `src/hooks/` (custom React hooks for future phases).

---

#### Root-level Files

| File | Purpose |
|------|---------|
| `.gitignore` | Covers: `node_modules/`, `venv/`, `.env`, `*.env.local`, `__pycache__/`, `*.pyc`, `dist/`, `build/`, `.DS_Store`, `Thumbs.db`, IDE files |
| `README.md` | Full setup and run instructions for new developers |
| `docs/README.md` | Placeholder — future architecture docs go here |

**Git:**
- Repository initialised with `git init`
- Initial commit: `83baae4`
- Remote `origin` set to `https://github.com/Suhail-khan-91/CodeMentor-AI.git`

---

### What Was Intentionally NOT Built in A1

- ❌ Monaco Editor (Phase A2)
- ❌ Python code execution (Phase A3)
- ❌ Any database layer (SQLite deferred to when first required)
- ❌ AI integration (Phase A7+)
- ❌ React Router (not needed yet — added lightweight routing in A2)
- ❌ Authentication
- ❌ Production deployment infrastructure

---

### A1 Test Results

| Test | Result |
|------|--------|
| `python -m pytest tests/ -v` | ✅ 5/5 passed |
| `GET /api/health` directly | ✅ `{"status":"ok",...}` |
| Vite proxy `/api/health` via frontend port | ✅ Proxied correctly |
| Browser — page loads, Backend Status: Connected | ✅ Confirmed |

---

## PHASE A2 — Code Editor

**Status:** ✅ COMPLETE  
**Git commit:** `c29cd10` — "Phase A2: Add Monaco Python Code Editor"  
**Date completed:** 2026-09-01

---

### What Was Built

#### New npm Dependency

`@monaco-editor/react` — installed via `npm install @monaco-editor/react`  
7 new packages added. `package.json` and `package-lock.json` updated.

**Known issue:** 2 audit warnings in `dompurify` (a Monaco transitive dependency). These are upstream Monaco issues, not introduced by project code. No fix is available via `npm audit fix` — will resolve when Monaco releases a patched version. No security impact for a local dev tool.

---

#### New Frontend Files

| File | Purpose |
|------|---------|
| `frontend/src/components/CodeEditor.jsx` | **Reusable Monaco wrapper component** (see details below) |
| `frontend/src/components/CodeEditor.css` | Monaco chrome styling — header bar, loading spinner, focus glow |
| `frontend/src/pages/EditorPage.jsx` | **Coding workspace page** — manages code state, Run/Reset buttons, output placeholder |
| `frontend/src/pages/EditorPage.css` | Two-column workspace layout, shared `.btn` button system |

---

#### `CodeEditor.jsx` — Key Details

**Component type:** Fully controlled (value + onChange props). Code state lives in the parent (`EditorPage`), not inside this component. This is intentional — Phase A3 only needs to modify `EditorPage.handleRun()`, not `CodeEditor`.

**Default code (exported as `DEFAULT_PYTHON_CODE`):**
```python
# Welcome to CodeMentor AI — Python Editor
# Write your Python code below and press Run Code when ready.

print("Hello, World!")
```

**Monaco configuration (`EDITOR_OPTIONS` object inside the file):**
```javascript
language: 'python'
theme: 'vs-dark'
fontSize: 14
fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace"
fontLigatures: true
lineNumbers: 'on'
minimap: { enabled: false }
automaticLayout: true       // re-flows when container resizes
tabSize: 4
insertSpaces: true
wordWrap: 'on'
autoIndent: 'full'
formatOnType: true
formatOnPaste: true
quickSuggestions: true
bracketPairColorization: { enabled: true }
cursorBlinking: 'smooth'
smoothScrolling: true
padding: { top: 16, bottom: 16 }
```

**Props:**
```
value      {string}   — Controlled code content
onChange   {Function} — Called with new string on every edit
height     {string}   — CSS height (default: '420px')
readOnly   {boolean}  — If true, editor is non-editable (default: false)
```

---

#### `EditorPage.jsx` — Key Details

- Manages `code` state with `useState(DEFAULT_PYTHON_CODE)`.
- `handleCodeChange` — passed as `onChange` to `CodeEditor`.
- `handleClear` — resets code to `DEFAULT_PYTHON_CODE`.
- `handleRun` — **intentional no-op** in A2. Logs to console. Phase A3 will replace this with a `POST /api/run` call.
- `isRunning` state exists but is always `false` in A2 — the Run button uses it for disabled state and "Running…" label (ready for A3 to flip).
- Output panel renders a placeholder explaining Phase A3 will add execution.
- Layout: two-column grid (editor left, output right). Stacks to single column on screens < 960px.

**Button system (defined in `EditorPage.css`):**
```css
.btn              /* base */
.btn--primary     /* purple, used for Run Code */
.btn--ghost       /* transparent border, used for Reset */
```
These classes are available for reuse in future phase pages.

---

#### Modified Existing Files

**`App.jsx` — Lightweight client-side routing:**
- No React Router installed (keeping deps minimal per PRD philosophy).
- Uses `window.location.pathname` + `pushState` + `popstate` listener.
- Route table:
  - `/` → `<Home />`
  - `/editor` → `<EditorPage />`
- Internal `<a>` clicks are intercepted to prevent full page reload.
- Adding new routes: update the `getPage()` function and add the import + JSX branch.

**`Navbar.jsx`:**
- Added `{ label: 'Editor', href: '/editor' }` to `NAV_LINKS` array.
- Phase badge updated from "Phase A1" → "Phase A2".

**`Home.jsx`:**
- Editor feature card now has `href: '/editor'` and `live: true`.
- Live cards render a "Try it →" link.
- Section subtitle updated to show "Phase A2 ✅ live".

**`Home.css`:**
- Added `.feature-card--live` (accent green border).
- Added `.feature-card__footer` (flex row: phase badge + optional link).
- Added `.feature-card__link` ("Try it →" link style).

---

### A2 Architecture Decision — Where Execution Logic Lives

The CodeEditor component has **zero knowledge** of execution. The data flow for Phase A3 is:

```
EditorPage (owns code state)
    │
    ├── CodeEditor (renders Monaco, calls onChange)
    │
    └── handleRun() ← Phase A3 will implement this
            │
            └── POST /api/run { code } → Flask
                    │
                    └── result → setOutput() → render in output panel
```

Only `EditorPage.jsx` needs modification in Phase A3. `CodeEditor.jsx` is complete and should not need changes.

---

### What Was Intentionally NOT Built in A2

- ❌ Python code execution (`subprocess`, sandbox, timeout)
- ❌ Any backend changes (Flask is unchanged from A1)
- ❌ Real output display (output panel is a placeholder)
- ❌ Error diagnostics
- ❌ React Router (lightweight routing sufficient at this stage)

---

### A2 Test Results

| Test | Result |
|------|--------|
| Monaco Editor loads with Python syntax highlighting | ✅ |
| Line numbers visible | ✅ |
| Dark theme (vs-dark) | ✅ |
| Default Python starter code shown | ✅ |
| Code can be typed and edited (tested: `x = 42`) | ✅ |
| Char count updates on edit | ✅ |
| Reset button returns code to default | ✅ |
| Run Code button present — no execution occurs | ✅ |
| Output panel shows Phase A3 placeholder | ✅ |
| A1 Backend Status: Connected badge still works on Home | ✅ |
| Navbar: Dashboard ↔ Editor navigation | ✅ |
| Browser back/forward navigation works | ✅ |

---

## Current Project State

### Git Log
```
c29cd10  Phase A2: Add Monaco Python Code Editor
83baae4  Phase A1: Project Foundation - React+Vite frontend, Flask backend, health API, git setup
```

### Directory Structure (as of A2)
```
code-mentor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx     ← NEW in A2
│   │   │   ├── CodeEditor.css     ← NEW in A2
│   │   │   ├── Navbar.jsx         ← Modified in A2
│   │   │   ├── Navbar.css
│   │   │   ├── StatusBadge.jsx
│   │   │   └── StatusBadge.css
│   │   ├── pages/
│   │   │   ├── EditorPage.jsx     ← NEW in A2
│   │   │   ├── EditorPage.css     ← NEW in A2
│   │   │   ├── Home.jsx           ← Modified in A2
│   │   │   └── Home.css           ← Modified in A2
│   │   ├── services/
│   │   │   └── api.js             ← A1, unchanged in A2
│   │   ├── hooks/                 ← empty, ready for future
│   │   ├── App.jsx                ← Modified in A2 (routing added)
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css              ← A1 design system, unchanged in A2
│   ├── public/
│   ├── index.html
│   ├── vite.config.js             ← A1, proxy config unchanged
│   ├── package.json               ← Modified in A2 (@monaco-editor/react added)
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── health.py          ← A1, unchanged in A2
│   │   ├── services/              ← empty placeholder
│   │   ├── utils/                 ← empty placeholder
│   │   ├── __init__.py            ← A1 app factory
│   │   └── config.py              ← A1 config classes
│   ├── tests/
│   │   └── test_health.py         ← A1, 5 tests, all passing
│   ├── venv/                      ← gitignored
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   └── README.md                  ← placeholder
├── .gitignore
├── README.md
├── work-history.md                ← this file
└── CodeMentor_AI_Project_Blueprint_PRD.md
```

---

## How to Run the Project (as of A3)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### Step 1 — Backend
```bash
cd backend
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
python run.py
# → Flask running on http://localhost:5000
```

### Step 2 — Frontend
```bash
cd frontend
npm run dev
# → Vite running on http://localhost:5173
```

### Step 3 — Verify
- Open http://localhost:5173 — Home page should show **Backend Status: Connected** and **Phase A3 Live**
- Click **Editor** in navbar — Monaco editor loads with Python syntax highlighting and the live Output Terminal
- Write or edit Python code and press **Run Code** (or `Ctrl+Enter`) to execute and see live output and execution metrics

---

## PHASE A3 — Code Runner Engine

**Status:** ✅ COMPLETE  
**Date completed:** 2026-09-01  

---

### What Was Built

#### Backend — Code Runner Engine

**Architecture:** Pluggable execution architecture using abstract `BaseRunner` interface, enabling effortless transition to Docker/sandbox environments in the future without changing routes or frontend logic.

**Files created:**

| File | Purpose |
|------|---------|
| `backend/app/services/runner/base.py` | `ExecutionResult` dataclass and `BaseRunner` abstract interface |
| `backend/app/services/runner/parser.py` | Deterministic traceback and error parser (`error_type`, `error_message`, `line_number`, `is_syntax_error`) |
| `backend/app/services/runner/subprocess_runner.py` | `SubprocessRunner` executing code in isolated temporary directories with 5.0s timeout, environment scrubbing, output truncation (64KB), and process termination |
| `backend/app/services/runner/__init__.py` | Runner factory `get_runner()` returning configured runner backend |
| `backend/app/routes/runner.py` | `POST /api/run` route blueprint with payload validation |
| `backend/tests/test_runner.py` | Comprehensive pytest suite (23 tests) covering execution, errors, timeouts, stdin, unicode, truncation, and API endpoints |

**Modified backend files:**
- `backend/app/config.py`: Added `EXECUTION_TIMEOUT` (5.0s), `MAX_CODE_LENGTH` (50,000), `MAX_OUTPUT_BYTES` (65,536), and `RUNNER_TYPE` (subprocess).
- `backend/app/__init__.py`: Registered `runner_bp` blueprint under `/api`.
- `backend/app/routes/health.py`: Updated phase status to `A3`.

**Key API endpoint:**
```
POST http://localhost:5000/api/run
Body: { "code": "print('Hello, World!')", "stdin": "" }
Response (HTTP 200):
{
  "status": "success",
  "stdout": "Hello, World!\n",
  "stderr": "",
  "exit_code": 0,
  "execution_time_ms": 35.2,
  "timed_out": false,
  "error": null,
  "details": {
    "error_type": null,
    "error_message": null,
    "line_number": null
  }
}
```

---

#### Frontend — Output Terminal & Runner Integration

**Files modified:**

| File | Changes Made |
|------|--------------|
| `frontend/src/services/api.js` | Added `apiPost(path, body)` and `runCode(code, stdin)` |
| `frontend/src/pages/EditorPage.jsx` | Connected `handleRun()` to `runCode()`, added `isRunning`/`result`/`apiError` state management, built rich Output Terminal with status badges, execution time, error banners, and `Ctrl+Enter` shortcut |
| `frontend/src/pages/EditorPage.css` | Styled terminal output, status pills (Success, Runtime Error, Syntax Error, Timed Out), loader animation, and error callouts |
| `frontend/src/components/Navbar.jsx` | Updated phase badge to `Phase A3` |
| `frontend/src/pages/Home.jsx` | Updated Code Runner feature card to `live: true` with `/editor` link, updated subtitle |

---

### What Was Intentionally NOT Built in A3

- ❌ AI hints or error explanations (Phase A7+)
- ❌ A4 Diagnostic Engine heuristics (Phase A4)
- ❌ A5 Task Evaluation / test case grading (Phase A5)
- ❌ Custom Question Mode (Phase A10)
- ❌ Course content / lessons / exams (Part B)
- ❌ Docker daemon dependencies (clean pluggable interface implemented instead)

---

### A3 Test Results

| Test Suite / Component | Result |
|------------------------|--------|
| `python -m pytest tests/ -v` | ✅ 28/28 passed (5 health + 23 runner tests) |
| `POST /api/run` Success execution | ✅ `status: "success"`, stdout captured, exit_code 0 |
| `POST /api/run` Syntax error handling | ✅ `status: "syntax_error"`, error_type "SyntaxError", line identified |
| `POST /api/run` Runtime error handling | ✅ `status: "runtime_error"`, error_type "ZeroDivisionError", line identified |
| `POST /api/run` Timeout enforcement | ✅ `status: "timeout"`, process killed, timed_out True |
| `POST /api/run` Input validation | ✅ 400 Bad Request on missing code / invalid JSON |
| Browser Monaco Editor → Run Code flow | ✅ Code executes, live stdout & ms timing displayed |
| Browser Runtime Error visualization | ✅ Error badge + traceback displayed cleanly |
| Keyboard shortcut (`Ctrl+Enter`) | ✅ Triggers execution |

---

## Current Project State (as of A3)

### Directory Structure
```
code-mentor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── CodeEditor.css
│   │   │   ├── Navbar.jsx         ← Updated (Phase A3)
│   │   │   ├── Navbar.css
│   │   │   ├── StatusBadge.jsx
│   │   │   └── StatusBadge.css
│   │   ├── pages/
│   │   │   ├── EditorPage.jsx     ← Updated (Phase A3)
│   │   │   ├── EditorPage.css     ← Updated (Phase A3)
│   │   │   ├── Home.jsx           ← Updated (Phase A3)
│   │   │   └── Home.css
│   │   ├── services/
│   │   │   └── api.js             ← Updated (runCode, apiPost)
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── health.py          ← Updated (Phase A3)
│   │   │   └── runner.py          ← NEW in A3 (POST /api/run)
│   │   ├── services/
│   │   │   └── runner/            ← NEW in A3
│   │   │       ├── __init__.py    ← Runner factory (get_runner)
│   │   │       ├── base.py        ← BaseRunner & ExecutionResult
│   │   │       ├── parser.py      ← Traceback & error parser
│   │   │       └── subprocess_runner.py ← Subprocess execution
│   │   ├── utils/
│   │   ├── __init__.py            ← App factory (runner_bp registered)
│   │   └── config.py              ← Runner settings added
│   ├── tests/
│   │   ├── test_health.py         ← 5 tests
│   │   └── test_runner.py         ← NEW in A3 (23 tests)
│   ├── venv/                      ← gitignored
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   └── README.md
├── .gitignore
├── README.md
├── work-history.md                ← this file
└── CodeMentor_AI_Project_Blueprint_PRD.md
```

---

## Next Phase

**Phase A4 — Code Diagnostic Engine** (not started)

What A4 must do:
1. Receive raw error output and structured metadata (`details.error_type`, `details.line_number`) from A3 Code Runner.
2. Translate technical/cryptic Python errors into beginner-friendly explanations.
3. Deterministically identify common rookie mistakes (e.g. unclosed parentheses, missing colons, off-by-one indicators).
4. Display friendly diagnostic cards beneath the code editor.
