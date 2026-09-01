# CodeMentor AI

> An interactive Python learning platform with AI-assisted tutoring.

**Current status: Phase A1 — Project Foundation** ✅

---

## What is CodeMentor AI?

CodeMentor AI is a Python learning platform where students learn by writing and running code inside the application. The platform helps students understand errors, receive hints, debug code, and progressively solve programming problems — with AI assistance available when needed.

The project is built in two parts:

| Part | Focus |
|------|-------|
| **Part A — Core Engine** | Code Editor, Code Runner, Diagnostics, AI Tutor, Progress System |
| **Part B — Educational Course** | Python curriculum, lessons, practice, exams |

*Part B begins only after Part A is stable.*

---

## Current Phase: A1 — Project Foundation

Phase A1 establishes the clean, working foundation for all future phases:

- ✅ React + Vite frontend application
- ✅ Flask backend with maintainable route structure
- ✅ Frontend ↔ Backend API communication (`GET /api/health`)
- ✅ Environment / configuration management
- ✅ Git-ready project structure

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, plain CSS |
| Backend | Python, Flask |
| Database | SQLite *(introduced in a later phase)* |
| AI | OpenAI / Claude / Gemini / Ollama *(Phase A7+)* |

---

## Project Structure

```
code-mentor/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API communication (api.js)
│   │   ├── hooks/             # Custom React hooks (future)
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css          # Global CSS design system
│   ├── public/
│   ├── index.html
│   ├── vite.config.js         # Dev proxy → Flask :5000
│   ├── package.json
│   └── .env.example
│
├── backend/                   # Flask application
│   ├── app/
│   │   ├── routes/
│   │   │   └── health.py      # GET /api/health
│   │   ├── services/          # Business logic (future)
│   │   ├── utils/             # Shared helpers (future)
│   │   ├── __init__.py        # App factory
│   │   └── config.py          # Environment-based config
│   ├── tests/
│   │   └── test_health.py     # Backend tests
│   ├── run.py                 # Flask entry point
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                      # Project documentation (future)
├── .gitignore
├── README.md
└── CodeMentor_AI_Project_Blueprint_PRD.md
```

---

## Prerequisites

- **Python** 3.10+ ([python.org](https://www.python.org/))
- **Node.js** 18+ and **npm** ([nodejs.org](https://nodejs.org/))
- **Git**

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd code-mentor
```

### 2. Backend setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Copy and edit the example environment file
copy .env.example .env
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Copy the example environment file
copy .env.example .env.local
```

---

## Running the Application

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the backend

```bash
cd backend
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

python run.py
```

Flask will start on **http://localhost:5000**

### Terminal 2 — Start the frontend

```bash
cd frontend
npm run dev
```

Vite will start on **http://localhost:5173**

Open **http://localhost:5173** in your browser.

---

## Verifying Frontend ↔ Backend Communication

1. Start the Flask backend (Terminal 1).
2. Start the Vite frontend (Terminal 2).
3. Open [http://localhost:5173](http://localhost:5173).
4. The dashboard should display **"Backend Status: Connected"** with a green indicator.

If Flask is not running, the dashboard will show **"Backend Status: Unreachable"** with a red indicator.

You can also test the API directly:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "CodeMentor AI Backend",
  "phase": "A1"
}
```

---

## Running Backend Tests

```bash
cd backend
.\venv\Scripts\activate
python -m pytest tests/ -v
```

---

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| A1 | Project Foundation | ✅ Complete |
| A2 | Code Editor (Monaco) | 🔜 Next |
| A3 | Code Runner Engine | 🔜 Planned |
| A4 | Code Diagnostic Engine | 🔜 Planned |
| A5 | Task Evaluation Engine | 🔜 Planned |
| A6 | Known Mistake / Hint System | 🔜 Planned |
| A7 | AI Tutor Engine | 🔜 Planned |
| A8 | AI Connection & Configuration | 🔜 Planned |
| A9 | AI Error Explanation | 🔜 Planned |
| A10 | Custom Question Mode | 🔜 Planned |
| A11 | Help / AI Usage Counter | 🔜 Planned |
| A12 | Progress & Score Engine | 🔜 Planned |
| A13 | Debug Mode | 🔜 Planned |
| A14 | Part A Integration & Testing | 🔜 Planned |

---

## Contributing

This project follows a phase-by-phase development strategy. See `CodeMentor_AI_Project_Blueprint_PRD.md` for the full project specification.

Do not start Part B until Part A is stable.
