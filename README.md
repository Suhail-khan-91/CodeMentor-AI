# CodeMentor AI

> An AI-powered interactive Python learning and coding platform for beginners.

CodeMentor AI helps students learn Python by writing, running, debugging, and improving code with automated diagnostics, task evaluation, progressive hints, and AI-powered tutoring.

## ✨ Features

- 🐍 Interactive Python Editor with Monaco Editor
- ⚡ Controlled Python Code Execution
- 🔍 Beginner-Friendly Error Diagnostics
- 🎯 Automated Task & Test-Case Evaluation
- 💡 Progressive Rule-Based Hints
- 🤖 AI Tutor & AI Error Explanation
- ✏️ Custom Question Mode
- 🐞 Debug Mode
- 📊 Progress & Score Tracking
- ⚙️ Multiple AI Provider Support

## 🤖 AI Architecture

CodeMentor AI uses a **hybrid AI architecture** combining deterministic programming systems with LLMs.

```text
                  CodeMentor AI
                       │
                React Frontend
                       │
                 Flask REST API
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Code Runner    Diagnostics     Evaluator
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                Hint / AI Layer
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       OpenAI       Claude       Gemini
          │
       Ollama
     (Local LLM)

The platform can use rule-based systems for deterministic feedback and LLMs for contextual tutoring, deeper explanations, and personalized guidance.

🧠 AI Workflow

Student Code
     ↓
Run / Evaluate
     ↓
Detect Problem
     ↓
Rule-Based Hint
     ↓
AI Tutor
     ↓
Student Improves Code
     ↓
Run Again

AI responses can be generated using cloud LLM APIs or local models through Ollama, allowing the system to remain flexible across different AI providers.

🛠️ Tech Stack
Category	Technologies
Frontend	React, Vite, Monaco Editor
Backend	Python, Flask
Database	SQLite
AI	OpenAI, Claude, Gemini, Ollama
APIs	REST, JSON
Testing	Pytest
Version Control	Git, GitHub

<img width="1157" height="997" alt="1" src="https://github.com/user-attachments/assets/1896e930-2bb9-4bfa-96d5-430fb29ae425" />
<img width="1071" height="789" alt="3" src="https://github.com/user-attachments/assets/63bb216d-10b1-4598-9b3c-2da1b7e6c981" />
<img width="764" height="947" alt="4" src="https://github.com/user-attachments/assets/36a854c8-3079-442d-b5fd-4291dd2cf4be" />
<img width="878" height="746" alt="5" src="https://github.com/user-attachments/assets/fb5feadb-5f16-460a-862d-3dde8e9664d7" />


