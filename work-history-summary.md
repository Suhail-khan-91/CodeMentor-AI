# CodeMentor AI — Work History Summary (Phases A1–A5)

**Repository:** [https://github.com/Suhail-khan-91/CodeMentor-AI.git](https://github.com/Suhail-khan-91/CodeMentor-AI.git)  
**Branch:** `master`  
**Current Status:** All Core Engine Foundation Phases (A1–A5) are completed, tested (79/79 automated tests passing), and committed to GitHub.

---

## 🧭 Executive Overview

CodeMentor AI is an interactive Python learning platform engineered to help beginners learn programming with instant feedback, intelligent diagnostics, and progressive pedagogy. The project is split into **Part A (Core Platform Engines: A1–A14)** and **Part B (Educational Course Content)**.

Phases **A1 through A5** establish the full deterministic local core: code editing, isolated subprocess execution, plain-English error diagnostics, and automated test-case evaluation.

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 19, Vite, `@monaco-editor/react`, pure Vanilla CSS (dark-mode glassmorphic design tokens).
- **Backend:** Python 3.14, Flask 3.0.3, `flask-cors`, `python-dotenv`, `pytest`.
- **Execution & Security:** Python standard library `subprocess` runner with 5.0s timeout protection, 64KB memory output caps, and clean temporary directory execution.
- **Deterministic AI-Free Guarantee (A1–A5):** All error diagnostics, syntax parsing, and test-case grading use standard library AST, regexes, and matchers with zero external LLM/AI dependencies.

---

## 📋 Phase-by-Phase Implementation Summary

### Phase A1 — Project Foundation
- **Git Commit:** `83baae4`
- **Key Deliverables:**
  - Flask Application Factory (`create_app`) with modular blueprint architecture and environment configs (`DevelopmentConfig`, `TestingConfig`, `ProductionConfig`).
  - React + Vite application with centralized `index.css` design system (HSL color tokens, typography, dark theme).
  - Centralized API layer (`frontend/src/services/api.js`) and live health check status badge component.
- **Key Endpoints:** `GET /api/health`

---

### Phase A2 — Python Code Editor Integration
- **Git Commit:** `c29cd10`
- **Key Deliverables:**
  - Integrated Monaco Editor (`@monaco-editor/react`) configured for Python (`vs-dark` theme, Fira Code font, line numbers, mini-map, tab size 4).
  - Reusable, controlled `CodeEditor` component with loading skeletons and fallback states.
  - Dedicated `/editor` page with responsive workspace layout and sample starter scripts.

---

### Phase A3 — Code Runner Engine
- **Git Commit:** `08d44be`
- **Key Deliverables:**
  - Abstract runner interface (`BaseRunner`) and concrete `SubprocessRunner`.
  - Safe subprocess execution: 5.0s hard timeout, standard input piping, 64KB memory output truncation, and environment variable scrubbing.
  - Deterministic traceback parser extracting `error_type`, `error_message`, and `line_number`.
  - Frontend output terminal displaying `stdout`, `stderr`, execution metrics (`ms`), and `Ctrl+Enter` execution shortcut.
- **Key Endpoints:** `POST /api/run`

---

### Phase A4 — Code Diagnostic Engine
- **Git Commit:** `be714ad`
- **Key Deliverables:**
  - Pure rule-based educational diagnostic pipeline (`CodeDiagnostic` model, `DiagnosticEngine`).
  - **Syntax Rules:** Missing colons (`if`, `def`, `for`, `while`, `class`), unclosed quotes, unmatched brackets `()[]{}`, assignment in conditions (`=` vs `==`), indentation/tab errors, and reserved keyword misuses.
  - **Runtime Rules:** `ZeroDivisionError`, `NameError` (with built-in casing typo suggestions like `Print` $\rightarrow$ `print`), `TypeError` (string + int concatenation), `IndexError`, `KeyError`, `AttributeError`, `ValueError`, `RecursionError`, and `TimeoutError`.
  - Reusable frontend `DiagnosticCard` component displaying category badges (`💡 Syntax`, `⚠️ Runtime`, `⏱ Timeout`), problematic code snippets, and actionable "How to fix" pro-tips.
- **Key Endpoints:** `POST /api/diagnose`, plus auto-diagnostic inclusion in `POST /api/run`.

---

### Phase A5 — Task Evaluation Engine
- **Git Commit:** `d87be52`
- **Key Deliverables:**
  - Structured data models: `TestCase`, `TaskDefinition`, `TestCaseResult`, and `EvaluationResult`.
  - Flexible output matcher (`comparer.py`) supporting 4 comparison modes:
    - `trimmed` (whitespace & newline normalization)
    - `exact` (strict character equality)
    - `ignore_case` (case-insensitive matching)
    - `numeric_float` (float comparison with $\pm 10^{-4}$ tolerance)
  - 5 starter practice challenges (*Hello World*, *Personalized Greeting*, *Even or Odd*, *Temperature Converter*, *Sum of Two Numbers*).
  - Hidden test case parameter masking to protect solution secrets from client inspection.
  - Interactive `TaskEvaluationPanel` UI with score progress bar (`100%`), test case accordion cards, and side-by-side Expected vs Actual diff views.
  - Workspace Mode Switcher: `⚡ Free Play Mode` vs `🎯 Task Evaluation Mode`.
- **Key Endpoints:** `POST /api/evaluate`, `GET /api/tasks`, `GET /api/tasks/<id>`

---

## 🌐 Master REST API Endpoints

| Method | Endpoint | Description | Phase |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Backend liveness and phase status check | A1 |
| `POST` | `/api/run` | Execute Python code, capture stdout/stderr, attach diagnostics on error | A3/A4 |
| `POST` | `/api/diagnose` | Standalone diagnostic generation from code and error metadata | A4 |
| `GET` | `/api/tasks` | Retrieve all practice tasks with masked hidden test case secrets | A5 |
| `GET` | `/api/tasks/<id>` | Retrieve single practice task by ID | A5 |
| `POST` | `/api/evaluate` | Grade Python code against multiple test cases and return scoring breakdown | A5 |

---

## 🧪 Test Suite & Verification Summary

All backend tests are executed via `pytest`:
```bash
cd backend
.\venv\Scripts\activate
python -m pytest tests/ -v
```

### Current Test Breakdown (79/79 Passed):
- `tests/test_health.py` — **5 tests** (Health checks, 404 handlers, headers)
- `tests/test_runner.py` — **23 tests** (Subprocess execution, syntax/runtime errors, timeouts, memory limits, stdin)
- `tests/test_diagnostics.py` — **30 tests** (Syntax rules, runtime rules, casing typo corrections, fallback diagnostics)
- `tests/test_evaluator.py` — **21 tests** (Match modes, logical failures, test crash diagnostics, hidden test masking, evaluator API routes)

**Result:** ✅ **79 passed in 3.19s** (100% green, 0 warnings).

---

## 📂 Current Directory Structure

```text
code-mentor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx          (Monaco Python editor)
│   │   │   ├── DiagnosticCard.jsx      (Educational error cards)
│   │   │   ├── TaskEvaluationPanel.jsx (Test case grading & diff view)
│   │   │   ├── Navbar.jsx              (Header & phase badge)
│   │   │   └── StatusBadge.jsx         (Backend connectivity indicator)
│   │   ├── pages/
│   │   │   ├── EditorPage.jsx          (Dual-mode Free Play & Task Evaluation)
│   │   │   └── Home.jsx                (Platform dashboard & feature cards)
│   │   ├── services/
│   │   │   └── api.js                  (Central API communication layer)
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── health.py               (GET /api/health)
│   │   │   ├── runner.py               (POST /api/run)
│   │   │   ├── diagnostics.py          (POST /api/diagnose)
│   │   │   └── evaluator.py            (POST /api/evaluate, GET /api/tasks)
│   │   ├── services/
│   │   │   ├── runner/                 (Subprocess execution engine)
│   │   │   ├── diagnostics/            (Rule-based syntax & runtime diagnostics)
│   │   │   └── evaluator/              (Test case comparison & grading engine)
│   │   └── __init__.py                 (Flask app factory)
│   ├── tests/                          (79 automated pytest tests)
│   └── run.py
│
├── work-history.md                     (Full comprehensive work log)
├── work-history-summary.md             (This summary document)
└── CodeMentor_AI_Project_Blueprint_PRD.md (Master project PRD)
```

---

## 🚀 Next Milestone

**Phase A6 — Rule-Based Hint System** (Ready to start)
- Tiered, progressive hints (Conceptual Nudge $\rightarrow$ Strategy $\rightarrow$ Structural Clue).
- Hint reveal state tracking without giving away solutions.
- Ground-truth foundation for the future AI Tutor (Phase A7).
