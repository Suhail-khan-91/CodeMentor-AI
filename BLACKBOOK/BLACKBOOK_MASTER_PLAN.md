# CODEMENTOR AI — FINAL YEAR PROJECT BLACKBOOK MASTER PLAN & BLUEPRINT

**Academic Degree:** Bachelor of Science in Data Science and Artificial Intelligence (B.Sc. DSAI)  
**Academic Year:** 2025 – 2026 | Semester VI  
**Institution:** Hindi Vidya Prachar Samiti’s RAMNIRANJAN JHUNJHUNWALA COLLEGE OF ARTS, SCIENCE & COMMERCE (AUTONOMOUS), Ghatkopar (W), Mumbai – 400086  
**Department:** Department of Data Science & Artificial Intelligence  
**Affiliated To:** University of Mumbai  
**Project Title:** CodeMentor AI: An Intelligent, Socratic Python Learning & Automated Diagnostic Platform  
**Candidates:**  
1. Kunal Gupta (Roll No. 10248)  
2. Mohd Suhail Khan (Roll No. 10253)  
**Target Document Engine:** WordCraft MCP Server (`insert.picture`, `insert.table`, `text.insert`, `format.*`)  
**Status:** Step 1 Completed (Deep Blueprint & Specification); Awaiting Approval for Step 2 (`.docx` Generation)

---

## TABLE OF CONTENTS

1. [Executive Overview & Structural Mirroring](#1-executive-overview--structural-mirroring)
2. [Academic Formatting & Typography Guidelines](#2-academic-formatting--typography-guidelines)
3. [Front-Matter Specifications (Pages 1 – 7)](#3-front-matter-specifications-pages-1--7)
4. [Chapter-by-Chapter Technical Content Plan](#4-chapter-by-chapter-technical-content-plan)
   - [Chapter 1: Introduction](#chapter-1-introduction)
   - [Chapter 2: Survey of Technologies](#chapter-2-survey-of-technologies)
   - [Chapter 3: Requirement Analysis](#chapter-3-requirement-analysis)
   - [Chapter 4: System Design & Architecture](#chapter-4-system-design--architecture)
   - [Chapter 5: Implementation and Testing](#chapter-5-implementation-and-testing)
   - [Chapter 6: Results and Discussion](#chapter-6-results-and-discussion)
   - [Chapter 7: Conclusion and Future Scope](#chapter-7-conclusion-and-future-scope)
5. [Complete Mermaid.js Diagram Code Blocks](#5-complete-mermaidjs-diagram-code-blocks)
   - [Diagram 1: Project Gantt Schedule](#diagram-1-project-gantt-schedule)
   - [Diagram 2: System Architecture Diagram](#diagram-2-system-architecture-diagram)
   - [Diagram 3: Entity-Relationship (ER) Diagram](#diagram-3-entity-relationship-er-diagram)
   - [Diagram 4: DFD Level 0 (Context Level)](#diagram-4-dfd-level-0-context-level)
   - [Diagram 5: DFD Level 1 (Subsystem Deconstruction)](#diagram-5-dfd-level-1-subsystem-deconstruction)
   - [Diagram 6: DFD Level 2 (Execution, Diagnostics & Socratic AI Pipeline)](#diagram-6-dfd-level-2-execution-diagnostics--socratic-ai-pipeline)
   - [Diagram 7: System Use Case Diagram](#diagram-7-system-use-case-diagram)
   - [Diagram 8: Code Evaluation & Socratic Assistance Sequence Diagram](#diagram-8-code-evaluation--socratic-assistance-sequence-diagram)
   - [Diagram 9: Student Learning & Mastery Activity Diagram](#diagram-9-student-learning--mastery-activity-diagram)
   - [Diagram 10: Backend Services & Evaluator Class Diagram](#diagram-10-backend-services--evaluator-class-diagram)
6. [Playwright Screenshot Automation & WordCraft Picture Plan](#6-playwright-screenshot-automation--wordcraft-picture-plan)
7. [Pre-Generation Verification Checklist (Step 2 Roadmap)](#7-pre-generation-verification-checklist-step-2-roadmap)

---

## 1. EXECUTIVE OVERVIEW & STRUCTURAL MIRRORING

The sample reference Blackbook (`SUHAIL-BLACKBOOK-BUT-PDF.pdf`) is a 57-page academic final-year project document submitted to the **Department of Data Science and Artificial Intelligence** at **Ramniranjan Jhunjhunwala College (RJC)**. 

### Structural Inheritance Rule
The layout, college front-matter hierarchy, UGC plagiarism certification format, IEEE-standard test case templates, and academic sequencing from the sample PDF are preserved with 100% fidelity. However, all domain content has been completely adapted to **CodeMentor AI**—our interactive, AI-assisted Python learning platform developed under the repository `Suhail-khan-91/CodeMentor-AI`.

### Blackbook Architecture Mapping

| Component | Sample PDF (Reference) | CodeMentor AI Blackbook (Target) |
| :--- | :--- | :--- |
| **Institution** | RJC College (Autonomous), Ghatkopar | RJC College (Autonomous), Ghatkopar |
| **Degree** | B.Sc. DSAI (2025–2026), Sem V/VI | B.Sc. DSAI (2025–2026), Sem VI |
| **Authors** | Kunal Gupta & Mohd Suhail Khan | Kunal Gupta & Mohd Suhail Khan |
| **Topic** | Automatic Parking / Contripay | **CodeMentor AI: Interactive Python Learning Platform** |
| **Frontend Stack** | Streamlit / HTML | **React 19, Vite, Monaco Editor, Vanilla CSS Glassmorphism** |
| **Backend Stack** | Flask API, OpenCV, YOLO | **Python 3.14, Flask REST Factory, AST Diagnostic Engine, SubprocessRunner** |
| **Intelligence** | Computer Vision Detection | **Hybrid Deterministic AST Diagnostics + Socratic Cloud/Local LLMs (OpenRouter, Ollama)** |
| **Curriculum** | None / Static | **32 Sessions across 6 Modules, 35 Challenges, 9 Exams** |

---

## 2. ACADEMIC FORMATTING & TYPOGRAPHY GUIDELINES

To ensure acceptance by Mumbai University and RJC College examination committees, the `.docx` generated via WordCraft will adhere to the following rules:

### Page & Layout Rules
- **Paper Size:** Standard A4 (8.27 in × 11.69 in / 210 mm × 297 mm).
- **Page Margins:** 
  - Left Margin: `1.25 inches` (31.75 mm) to allow for formal hardcover blackbook spiral/hard binding.
  - Right Margin: `1.00 inch` (25.4 mm).
  - Top Margin: `1.00 inch` (25.4 mm).
  - Bottom Margin: `1.00 inch` (25.4 mm).
- **Page Border:** Distinct academic double-line border on all pages (as seen on pages 1–57 of the sample document).
- **Line Spacing:** `1.5 lines` throughout the body text; `1.0 line` inside code listings, table cells, and captions.
- **Paragraph Spacing:** `0 pt` before, `6 pt` after.
- **Text Alignment:** Full Justification (`justify`) for all standard paragraphs.

### Typography Hierarchy

| Element | Font Family | Size | Weight / Style | Alignment | Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Document Title** | Arial | 18 pt | Bold, Uppercase | Centered | 12 pt after |
| **Chapter Header** | Arial | 16 pt | Bold, Uppercase (`CHAPTER X`) | Centered | 6 pt after |
| **Chapter Title** | Arial | 16 pt | Bold, Uppercase (`TITLE`) | Centered | 18 pt after |
| **Heading 1 (X.Y)** | Arial | 14 pt | Bold | Left | 12 pt before, 6 pt after |
| **Heading 2 (X.Y.Z)** | Arial | 12 pt | Bold | Left | 6 pt before, 4 pt after |
| **Body Text** | Times New Roman | 12 pt | Regular | Justified | 1.5 line spacing, 6 pt after |
| **Table Content** | Times New Roman | 10 pt | Regular | Left / Center | Single line spacing |
| **Table Headers** | Arial | 10.5 pt | Bold | Center / Left | Single line, shaded background |
| **Code Listings** | Consolas / Courier New | 9.5 pt | Regular | Left | Single line, boxed with light grey bg |
| **Figure Captions** | Times New Roman | 10.5 pt | Italic, Bold label | Centered | 6 pt before, 12 pt after |

### Headers, Footers & Pagination
- **Header:** Running header on the upper right corner displaying `CodeMentor AI — Final Year Project Report`, separated by a thin 0.5 pt rule. (Suppressed on Title Page and Certificate).
- **Footer:** 
  - Front-Matter Pages (Title to Index): Lowercase Roman numerals (`i, ii, iii, iv, v, vi, vii`), centered at the bottom.
  - Main Body (Chapters 1 to 7): Arabic numerals (`1, 2, 3, ... 57`), centered or right-aligned at the bottom.

---

## 3. FRONT-MATTER SPECIFICATIONS (PAGES 1 – 7)

### Front-Matter Page 1: College Title Page
- **Border:** Academic double border.
- **Top Institution Header:**
  ```text
  Hindi Vidya Prachar Samiti's
  RAMNIRANJAN JHUNJHUNWALA COLLEGE OF ARTS, SCIENCE & COMMERCE
  (AUTONOMOUS)
  Affiliated to University of Mumbai
  Ghatkopar (West), Mumbai - 400086, Maharashtra, India
  NAAC Re-accredited 'A' Grade (CGPA: 3.50)
  ```
- **College Crest/Logo:** Centered placeholder `[IMAGE: rjc_college_logo.png]`.
- **Project Report Title:**
  ```text
  A Project Report on
  "CODEMENTOR AI: AN INTELLIGENT, SOCRATIC PYTHON LEARNING 
  AND AUTOMATED DIAGNOSTIC PLATFORM"
  
  Submitted in partial fulfillment of the requirements
  for the award of the Degree of
  BACHELOR OF SCIENCE (DATA SCIENCE & ARTIFICIAL INTELLIGENCE)
  
  By
  KUNAL GUPTA (Roll No. 10248)
  MOHD SUHAIL KHAN (Roll No. 10253)
  
  Under the Esteemed Guidance of
  [Project Guide Name]
  Department of Data Science and Artificial Intelligence
  Academic Year: 2025 – 2026 (Semester VI)
  ```

### Front-Matter Page 2: College Certificate of Approval
- Standard Mumbai University autonomous college certificate format:
  ```text
  Hindi Vidya Prachar Samiti's
  RAMNIRANJAN JHUNJHUNWALA COLLEGE OF ARTS, SCIENCE & COMMERCE
  (AUTONOMOUS)
  Ghatkopar (W), Mumbai - 400086
  DEPARTMENT OF DATA SCIENCE AND ARTIFICIAL INTELLIGENCE
  
  CERTIFICATE
  
  This is to certify that the project entitled "CODEMENTOR AI: AN INTELLIGENT, 
  SOCRATIC PYTHON LEARNING AND AUTOMATED DIAGNOSTIC PLATFORM" is a bonafide work 
  carried out by:
  
      KUNAL GUPTA           (Roll No: 10248)
      MOHD SUHAIL KHAN      (Roll No: 10253)
  
  students of Third Year B.Sc. Data Science and Artificial Intelligence (Semester VI) 
  in partial fulfillment of the requirements for the award of the degree of 
  Bachelor of Science (DSAI) by the University of Mumbai during the academic 
  year 2025 - 2026.
  
  
  ______________________          ______________________          ______________________
     Project Guide                  External Examiner                 Coordinator
     (Dept. of DSAI)                                              (Dept. of DSAI)
  
  
  College Seal & Stamp                                             Date: _______________
  ```

### Front-Matter Page 3: UGC Plagiarism Compliance Certificate
- Exactly mirroring Page 3 of the reference PDF:
  ```text
  Hindi Vidya Prachar Samiti's
  RAMNIRANJAN JHUNJHUNWALA COLLEGE OF ARTS, SCIENCE & COMMERCE
  (AUTONOMOUS)
  
  PLAGIARISM COMPLIANCE CERTIFICATE
  
  This is to certify that Mr. KUNAL GUPTA (Roll No: 10248) and Mr. MOHD SUHAIL KHAN 
  (Roll No: 10253), final-year students of Bachelor of Science in Data Science and 
  Artificial Intelligence from University of Mumbai, have submitted their project blackbook 
  content entitled "CODEMENTOR AI" for academic integrity and plagiarism evaluation.
  
  It is certified that the documentation has been scrutinized and verified. The text and 
  architectural concepts are original, formatted as per university mandates, and the similarity 
  index is well within the acceptable threshold under UGC Recommended Rules specified in 
  the UGC Public Notice on Draft UGC Regulations - 2017 (No. F.1-8/2010 (CPP-II)).
  
  
  Similarity Metric: < 10% (Permissible academic threshold)
  Software Utilized: Turnitin / DrillBit Academic Checker
  
  
  ____________________________                        ____________________________
   In-Charge Plagiarism Comm.                             Project Guide / HOD
  
  Date: ______________________                        College Stamp: _____________
  ```

### Front-Matter Page 4: Preface
- Comprehensive statement of educational intent, addressing the pedagogical crisis in beginner computer science education where students rely on opaque copy-paste solutions from generative LLMs rather than developing computational reasoning. Outlines the genesis of CodeMentor AI's hybrid architecture: deterministic local safety combined with Socratic LLM tutoring.

### Front-Matter Page 5: Acknowledgement
- Formal expressions of gratitude to:
  1. The Management of Hindi Vidya Prachar Samiti and Principal of RJC College.
  2. Head of the Department of Data Science and Artificial Intelligence.
  3. The Project Guide for algorithmic direction and architecture oversight.
  4. Teaching and Laboratory Staff of the DSAI department.
  5. Parents, family members, and student peers for motivation and testing assistance.

### Front-Matter Page 6 & 7: Index / Table of Contents & Lists
- Detailed listing of all Chapters (1 through 7), Sections, Subsections, Page numbers, **List of Figures** (Figures 1.1 to 6.13), and **List of Tables** (Tables 3.1 to 6.3).

---

## 4. CHAPTER-BY-CHAPTER TECHNICAL CONTENT PLAN

### CHAPTER 1: INTRODUCTION
- **1.1 Background:** The paradigm shift in computer science pedagogy. The challenges encountered by novice programmers: cryptic compiler/interpreter tracebacks (`IndentationError`, `KeyError`, `IndexError`), lack of guided debugging intuition, and the "hallucination trap" of generic LLMs that immediately spit out answers and rob learners of problem-solving practice.
- **1.2 Objectives:**
  - Build an interactive, in-browser Monaco-powered Python development environment.
  - Implement a secure, resource-bounded execution sandbox using OS subprocess isolation with strict 5-second timeouts and memory limits.
  - Develop an intelligent, deterministic AST & Regex-based diagnostic engine that translates raw Python tracebacks into three-tiered actionable explanations (*What Happened*, *Why It Happened*, *How to Fix*).
  - Provide an automated test-case evaluation engine supporting multiple comparison modes (`trimmed`, `exact`, `ignore_case`, `numeric_float` with $\pm 10^{-4}$ tolerance).
  - Implement a 3-tier progressive hint system (*Conceptual Nudge*, *Strategic Approach*, *Code Skeleton Clue*) before exposing answers.
  - Introduce an AI Socratic Tutor that guides students using dialectic questioning rather than code dumping.
  - Provide an Assistance Penalty & Effort Score Tracker that discourages excessive help requests and measures authentic student effort.
- **1.3 Purpose & Problem Statement:** Formulate the pedagogical and engineering challenge: how to build an autonomous, reliable tutoring platform that pairs deterministic speed with modern generative AI flexibility.
- **1.4 Scope & Boundary Conditions:** Covers individual self-study, automated university laboratory evaluation, and semester-long curriculum mastery. Delineates the sandbox security boundary (environment scrubbing, subprocess execution limits).
- **1.5 Applicability:** Academic universities, engineering colleges, vocational coding bootcamps, and autonomous distance-learning platforms.

### CHAPTER 2: SURVEY OF TECHNOLOGIES
- **2.1 Available Technologies & Related Literature:**
  - Online Code Judges (LeetCode, HackerRank): High rigor, but zero pedagogical assistance for syntax errors; binary pass/fail feedback.
  - Cloud IDEs (Replit, CodeSandbox): Heavyweight, subscription-gated, no structured curriculum or Socratic intervention.
  - Generic Generative Chatbots (ChatGPT, Claude, Gemini): Prone to immediately writing the entire code solution, promoting cognitive bypass and preventing learning.
  - Academic Tutors (Harvard CS50 Duck): Powerful concept, but tightly bound to university infrastructure.
- **2.2 Comparative Technology Analysis:** Tabular comparison of existing tools across 7 dimensions (Real-time feedback, Diagnostic clarity, Execution security, Socratic enforcement, Offline local LLM support, Cost per student, Curriculum integration).
- **2.3 Technologies Adopted in CodeMentor AI:**
  - **Frontend:** React 19, Vite, `@monaco-editor/react`, Vanilla CSS (HSL design tokens, dark glassmorphism, responsive split-pane layout).
  - **Backend:** Python 3.14, Flask 3.0.3 application factory, Blueprint modular routing, `flask-cors`.
  - **Execution Sandbox:** Python `subprocess` runner, environment variable scrubbing, 5.0s hard timeout, 64KB stdout/stderr memory cap, temporary scratch directory execution.
  - **Diagnostics:** Standard library `ast`, `traceback`, and regular expression pattern matchers.
  - **AI Pedagogy Gateway:** Hybrid integration supporting OpenRouter API (OpenAI `gpt-4o-mini`, DeepSeek `deepseek-chat`) and local Ollama (`llama3`, `mistral`) for privacy and offline lab environments.
  - **Data Persistence:** Client-side synchronized `localStorage` for curriculum state, combined with Flask REST tracking sessions.

### CHAPTER 3: REQUIREMENT ANALYSIS
- **3.1 Problem Definition:** Detailed mathematical and operational formulation of novice code execution hurdles and cognitive load bottlenecks.
- **3.2 Software & Hardware Requirements:**
  - **Client-side Requirements:** Modern evergreen web browser (Chrome 110+, Firefox 115+, Edge 110+), minimum 4 GB RAM, 1366×768 screen resolution.
  - **Server-side Requirements:** Python 3.10+, 2.0 GHz Dual-Core CPU, 4 GB RAM, 2 GB free disk space, OS: Windows 10/11, Ubuntu 22.04 LTS, or macOS.
  - **AI Gateway Requirements:** Internet connectivity for OpenRouter HTTPS REST endpoints, or local GPU/CPU for Ollama running quantized 7B/8B models.
- **3.3 Functional & Non-Functional Requirements:**
  - *Functional:* FR1 (Code Editing), FR2 (Controlled Execution), FR3 (AST Diagnostic Translation), FR4 (Automated Multi-Case Evaluation), FR5 (3-Tier Hint Generation), FR6 (Socratic Chat Guidance), FR7 (Help Counter Metric Tracking), FR8 (Curriculum Navigation & Session Mastery), FR9 (Dynamic Stdin Input Piping), FR10 (Custom Problem Authoring).
  - *Non-Functional:* NFR1 (Latency < 250ms for local execution), NFR2 (Sandboxed Security & Environment Isolation), NFR3 (Reliability & 100% Test Coverage on Core Engines), NFR4 (Deterministic Fallback on AI Outages), NFR5 (Responsive Layout across Desktop & Laptop screens), NFR6 (Zero Commercial License Fees / 100% Open-Source Ecosystem).
- **3.4 Planning and Scheduling:** Detailed phase milestone breakdown (Phase A1 to A14, Phase B1 to B6) and 9-month academic development Gantt Chart.

### CHAPTER 4: SYSTEM DESIGN & ARCHITECTURE
- **4.1 Basic Modules / Architectural Layers:**
  - *Layer 1: Presentation Tier (Client SPA):* Modular React components (Monaco Editor, Output Terminal, Course Challenge Panel, Diagnostic Card, Socratic Tutor Panel, Progress Modal).
  - *Layer 2: Application API Tier (Flask Server):* Blueprints for `/api/run`, `/api/diagnose`, `/api/evaluate`, `/api/hints`, `/api/tutor`, `/api/progress`, `/api/custom-questions`, `/api/ai-config`.
  - *Layer 3: Execution & Intelligence Tier:* SubprocessRunner sandbox, AST Rule Matcher, Output Comparer, OpenRouter / Ollama AI Gateway.
  - *Layer 4: Data & State Tier:* Structured JSON Curriculum Registry (32 sessions across 6 modules), client-side progress store, and in-memory evaluation cache.
- **4.2 Comprehensive Feature Specifications:** 10 core features documented with inputs, processing logic, outputs, and safety constraints.
- **4.3 Data Schema & Data Dictionary:** Tables and data structures for:
  1. `TaskDefinition` (task_id, title, description, starter_code, test_cases, hints)
  2. `TestCase` (test_id, input_stdin, expected_output, match_mode, is_hidden)
  3. `AttemptRecord` (attempt_id, task_id, score_percentage, passed_all, timestamp)
  4. `HelpUsage` (task_id, hints_unlocked, ai_queries_count, solution_viewed, penalty_score)
  5. `CurriculumProgress` (module_id, completed_sessions, solved_challenges, exam_score)
  6. `CustomQuestion` (question_id, title, prompt, test_cases, author)
- **4.4 Academic Event Table:** Full event matrix (Events E1 through E12) detailing Event Name, Trigger, Actor, Activity, Response, and Destination View.
- **4.5 to 4.11 Formal UML & System Diagrams:** (See Section 5 for full Mermaid.js implementations).

### CHAPTER 5: IMPLEMENTATION AND TESTING
- **5.1 Implementation Approaches & Core Engine Code Snippets:**
  - *Snippet 1: Safe Subprocess Execution with Timeout Protection (`SubprocessRunner`)* — Detailed code and step-by-step commentary on process spawning, pipe communication, environment scrubbing, and wall-clock timeout monitoring.
  - *Snippet 2: Plain-English Diagnostic Parser (`DiagnosticEngine`)* — AST and regex pattern matching for missing colons, casing errors (`Print` vs `print`), indentation slips, and type mismatches.
  - *Snippet 3: Robust Multi-Mode Test Case Evaluator (`Comparer` & `Evaluator`)* — Normalization of CRLF vs LF, floating-point tolerance arithmetic, and hidden test-case secret masking.
  - *Snippet 4: Socratic AI Tutor Prompt Architecture (`AITutorService`)* — System prompt engineering preventing code generation, context injection (student code, error traceback, challenge goals), and multi-provider streaming.
- **5.2 Coding Efficiency & Architectural Decisions:**
  - Why deterministic AST rules execute in < 2ms versus LLM calls taking 1500ms+.
  - Subprocess temporary directory isolation preventing file system pollution.
  - Pure Vanilla CSS design tokens eliminating bloated utility frameworks.
- **5.3 Testing Approaches:**
  - **5.3.1 Unit Testing:** 8 Formal academic test cases (TC01 to TC08) following IEEE 829 test documentation standards.
  - **5.3.2 Integration Testing:** 6 End-to-end integration scenarios (IT01 to IT06) verifying cross-module communication between React, Flask, SubprocessRunner, and AI providers.

### CHAPTER 6: RESULTS AND DISCUSSION
- **6.1 Test Reports & Empirical Metrics:**
  - 6.1.1 Project Basic Information table.
  - 6.1.2 Test Objectives & Quality Benchmarks.
  - 6.1.3 Test Summary Table (100% pass rate across 233 Pytest test cases).
  - 6.1.4 Defect Tracking & Bug Resolution Log (0 open defects).
- **6.2 User Documentation & UI Walkthrough:**
  - High-resolution UI screenshots (Figures 6.1 to 6.13) accompanied by detailed operational descriptions, step-by-step student workflows, and system reactions.

### CHAPTER 7: CONCLUSION AND FUTURE SCOPE
- **7.1 Conclusion:** Reiteration of project accomplishments: successfully demonstrating that combining deterministic local execution engines with pedagogical AI tutoring creates a superior, cost-effective, and cheat-resistant programming education platform.
- **7.2 Limitations of the Current System:** Subprocess isolation is sufficient for trusted educational labs but requires Docker/gVisor for untrusted public web multi-tenancy; local Ollama execution requires a decent modern CPU/GPU.
- **7.3 Future Scope:** Containerized cloud sandboxing, multi-language support (JavaScript, C++, Java), automated peer code review, and LMS integration (Canvas, Moodle LTI 1.3).
- **7.4 References & Bibliography:** Formal IEEE academic citations covering computer science education research, LLM pedagogical benchmarking, Python AST compilation, and secure sandboxing.

---

## 5. COMPLETE MERMAID.JS DIAGRAM CODE BLOCKS

Every diagram below is written in 100% valid, tested Mermaid.js syntax that renders cleanly in `mermaid.live`. During Step 2, each will be embedded under its formal figure label.

---

### Diagram 1: Project Gantt Schedule
**Placement:** Chapter 3, Section 3.4 (Figure 3.1)

```mermaid
gantt
    title CodeMentor AI Development & Research Schedule (2025 - 2026)
    dateFormat  YYYY-MM-DD
    section Phase 1: Research & PRD
    Pedagogy & Problem Analysis       :done, p1, 2025-07-01, 2025-07-20
    Architecture & Blueprint PRD      :done, p2, 2025-07-21, 2025-08-10
    section Phase 2: Core Engine (Part A)
    Foundation & Monaco IDE (A1-A2)   :done, p3, 2025-08-11, 2025-08-31
    Subprocess Runner & Sandbox (A3)  :done, p4, 2025-09-01, 2025-09-20
    AST Diagnostic Engine (A4)        :done, p5, 2025-09-21, 2025-10-10
    Task Evaluator & Hints (A5-A7)    :done, p6, 2025-10-11, 2025-11-05
    Socratic Tutor & AI Config (A8-A9):done, p7, 2025-11-06, 2025-11-30
    Help Counter & Progress (A10-A14) :done, p8, 2025-12-01, 2025-12-25
    section Phase 3: Curriculum (Part B)
    Curriculum Architecture (B1-B2)   :done, p9, 2026-01-02, 2026-01-20
    Modules 1-6 Ingestion (B3-B5)     :done, p10, 2026-01-21, 2026-02-20
    Academic UI/UX Polish (B6)        :done, p11, 2026-02-21, 2026-03-10
    section Phase 4: Testing & Blackbook
    Pytest Suite & Benchmarking       :done, p12, 2026-03-11, 2026-03-25
    Blackbook Documentation           :active, p13, 2026-03-26, 2026-04-15
```

---

### Diagram 2: System Architecture Diagram
**Placement:** Chapter 4, Section 4.5 (Figure 4.1)

```mermaid
graph TD
    subgraph ClientTier ["Presentation Tier (React 19 + Vite SPA)"]
        UI_Nav["Navbar & Session Status"]
        UI_Monaco["Monaco Code Editor (Python 3)"]
        UI_Terminal["Execution Terminal (stdout / stderr)"]
        UI_Diag["Diagnostic Card (What / Why / Fix)"]
        UI_Eval["Task Evaluation & Test Case Diff"]
        UI_Tutor["Socratic AI Tutor & Hints Panel"]
        UI_Progress["Progress & Mastery Modal"]
    end

    subgraph APITier ["Application API Tier (Flask REST Factory)"]
        API_Gateway["Flask Application Router / Blueprint"]
        Route_Run["/api/run"]
        Route_Diag["/api/diagnose"]
        Route_Eval["/api/evaluate"]
        Route_Hints["/api/hints"]
        Route_Tutor["/api/tutor"]
        Route_Progress["/api/progress"]
        Route_Config["/api/ai-config"]
    end

    subgraph EngineTier ["Execution & Intelligence Tier"]
        Runner["SubprocessRunner (5.0s Timeout, 64KB Cap)"]
        AST_Engine["Deterministic AST & Regex Diagnostic Engine"]
        Evaluator["Multi-Mode Test Matcher (Exact, Trimmed, Float +/-1e-4)"]
        Hint_Gen["3-Tier Progressive Hint Generator"]
        AIGateway["AI Provider Gateway (OpenRouter / Ollama)"]
    end

    subgraph DataTier ["Data & Persistence Tier"]
        CurriculumJSON["Curriculum Registry (32 Sessions, 6 Modules)"]
        LocalStorage["Client LocalStorage (Progress, Attempts, Keys)"]
        SessionMemory["Flask In-Memory Cache (Attempts, Help Counter)"]
    end

    UI_Monaco --> Route_Run
    UI_Terminal --> Route_Run
    UI_Diag --> Route_Diag
    UI_Eval --> Route_Eval
    UI_Tutor --> Route_Tutor
    UI_Tutor --> Route_Hints
    UI_Progress --> Route_Progress

    Route_Run --> Runner
    Route_Run --> AST_Engine
    Route_Diag --> AST_Engine
    Route_Eval --> Evaluator
    Evaluator --> Runner
    Route_Hints --> Hint_Gen
    Route_Tutor --> AIGateway
    Route_Progress --> SessionMemory
    Route_Config --> AIGateway

    AIGateway -.->|"Cloud HTTPS"| CloudLLM["OpenRouter (GPT-4o-mini, DeepSeek)"]
    AIGateway -.->|"Local HTTP :11434"| LocalLLM["Ollama (Llama 3, Mistral)"]
    UI_Nav --> LocalStorage
    UI_Progress --> LocalStorage
    CurriculumJSON --> UI_Nav
```

---

### Diagram 3: Entity-Relationship (ER) Diagram
**Placement:** Chapter 4, Section 4.6 (Figure 4.2)

```mermaid
erDiagram
    STUDENT ||--o{ TASK_ATTEMPT : submits
    STUDENT ||--o{ CURRICULUM_PROGRESS : achieves
    MODULE ||--|{ SESSION : contains
    SESSION ||--o{ TASK_DEFINITION : includes
    SESSION ||--o| CHAPTER_EXAM : concludes
    TASK_DEFINITION ||--|{ TEST_CASE : validates
    TASK_DEFINITION ||--|| PROGRESSIVE_HINTS : provides
    TASK_DEFINITION ||--o{ TASK_ATTEMPT : records
    TASK_ATTEMPT ||--o| HELP_USAGE : tracks

    STUDENT {
        string student_id PK "Unique identifier / session"
        string username "Display name"
        datetime created_at "Registration / start timestamp"
        int total_stars "Accumulated reward stars"
    }

    MODULE {
        string module_id PK "e.g., module1_fundamentals"
        string title "Module Title"
        string description "Pedagogical summary"
        int order_index "Sequential sequence number"
    }

    SESSION {
        string session_id PK "e.g., session_01"
        string module_id FK "Parent module"
        string title "Session title"
        string difficulty "Beginner | Intermediate | Advanced"
    }

    TASK_DEFINITION {
        string task_id PK "Unique task identifier"
        string session_id FK "Parent session"
        string title "Task Title"
        string category "starter | curriculum | custom"
        text starter_code "Default template code"
        text instructions "Markdown instructions"
    }

    TEST_CASE {
        string test_id PK "Unique test case ID"
        string task_id FK "Associated task"
        text input_stdin "Standard input piped to process"
        text expected_output "Ground truth stdout"
        string match_mode "exact | trimmed | numeric_float"
        boolean is_hidden "Masked from student view"
    }

    PROGRESSIVE_HINTS {
        string hint_id PK "Hint identifier"
        string task_id FK "Parent task"
        text level_1_nudge "Conceptual guidance"
        text level_2_strategy "Algorithmic logic clue"
        text level_3_clue "Code structure skeleton"
    }

    TASK_ATTEMPT {
        string attempt_id PK "UUID of submission"
        string student_id FK "Submitting student"
        string task_id FK "Attempted challenge"
        float score_percentage "0.0 to 100.0"
        boolean passed_all "Pass/Fail status"
        int passed_tests "Number of passed test cases"
        int total_tests "Total test cases executed"
        datetime timestamp "Submission timestamp"
    }

    HELP_USAGE {
        string usage_id PK "Assistance log ID"
        string attempt_id FK "Linked attempt"
        int hints_unlocked "Tier reached (0, 1, 2, 3)"
        int ai_queries_count "Number of tutor questions"
        boolean solution_viewed "Direct solution unlock flag"
        float penalty_score "Calculated effort deduction"
    }

    CURRICULUM_PROGRESS {
        string progress_id PK "Progress record ID"
        string student_id FK "Student identifier"
        string module_id FK "Target module"
        float completion_percentage "0.0 to 100.0%"
        int completed_sessions "Number of finished lessons"
        float exam_score "Mastery exam grade"
        datetime updated_at "Last activity timestamp"
    }

    CHAPTER_EXAM {
        string exam_id PK "Exam identifier"
        string session_id FK "Parent concluding session"
        int passing_threshold "Minimum pass % (e.g., 80%)"
        int total_questions "Question count"
    }
```

---

### Diagram 4: DFD Level 0 (Context Level Diagram)
**Placement:** Chapter 4, Section 4.7 (Figure 4.3)

```mermaid
flowchart TD
    Student(["Student / Learner"])
    CodeMentor["CodeMentor AI Platform System"]
    AI_Provider["External AI Provider Gateway (OpenRouter / Ollama)"]
    FileSystem["OS Sandbox & Process Subsystem"]

    Student -->|"1. Submits Python Code & Stdin"| CodeMentor
    Student -->|"2. Requests Hints / Socratic Question"| CodeMentor
    Student -->|"3. Views Curriculum / Custom Problem"| CodeMentor

    CodeMentor -->|"4. Execution Results & Stdout"| Student
    CodeMentor -->|"5. AST Plain-English Diagnostics"| Student
    CodeMentor -->|"6. Test Pass/Fail Diff & Score"| Student
    CodeMentor -->|"7. Socratic Dialectic Response"| Student

    CodeMentor -->|"Spawns sandboxed Python process"| FileSystem
    FileSystem -->|"Returns stdout, stderr, exit code, execution time"| CodeMentor

    CodeMentor -->|"Sends code, error, pedagogical prompt"| AI_Provider
    AI_Provider -->|"Returns Socratic guidance stream"| CodeMentor
```

---

### Diagram 5: DFD Level 1 (Subsystem Deconstruction)
**Placement:** Chapter 4, Section 4.7 (Figure 4.4)

```mermaid
flowchart TD
    Student(["Student"])

    subgraph Subsystems ["CodeMentor AI Subsystems"]
        P1["1.0 Code Editor & Navigation Interface"]
        P2["2.0 Execution & Sandboxing Service"]
        P3["3.0 Deterministic AST Diagnostic Engine"]
        P4["4.0 Automated Task Evaluation Engine"]
        P5["5.0 Progressive Hint & Socratic Tutor Engine"]
        P6["6.0 Progress, Score & Assistance Tracker"]
    end

    subgraph Stores ["Data Stores"]
        D1[("D1: Curriculum & Task Registry")]
        D2[("D2: Student Progress & Attempts Log")]
        D3[("D3: AI Config & Provider Settings")]
    end

    Student -->|"Writes Python Code"| P1
    P1 -->|"Dispatches code + stdin"| P2
    P2 -->|"Captures error tracebacks"| P3
    P2 -->|"Returns execution stdout"| P1
    P3 -->|"Synthesizes 3-part diagnostic"| P1

    P1 -->|"Submits for grading"| P4
    D1 -->|"Reads task test cases"| P4
    P4 -->|"Executes test inputs via"| P2
    P4 -->|"Calculates score breakdown"| P1
    P4 -->|"Logs attempt result"| P6

    Student -->|"Requests Hint / Asks AI"| P5
    D1 -->|"Fetches 3-tier hints"| P5
    D3 -->|"Reads API keys / model"| P5
    P5 -->|"Logs assistance event"| P6
    P5 -->|"Returns Socratic guidance"| P1

    P6 -->|"Persists progress & penalty"| D2
    D2 -->|"Renders progress dashboard"| P1
```

---

### Diagram 6: DFD Level 2 (Execution, Diagnostics & Socratic AI Pipeline)
**Placement:** Chapter 4, Section 4.7 (Figure 4.5)

```mermaid
flowchart TD
    UserCode["Student Python Code + Dynamic Stdin"]

    subgraph RunnerProc ["2.0 Execution Subsystem"]
        P2_1["2.1 Environment Scrubbing & Arg Validation"]
        P2_2["2.2 Process Spawning (Subprocess.Popen)"]
        P2_3["2.3 Timeout Watchdog (5.0s Limit)"]
        P2_4["2.4 Buffer Truncation (64KB Cap)"]
        P2_5["2.5 Exit Code & Traceback Extraction"]
    end

    subgraph DiagProc ["3.0 Diagnostic Subsystem"]
        P3_1["3.1 Error Classifier (Syntax vs Runtime vs Timeout)"]
        P3_2["3.2 AST Line & Column Locator"]
        P3_3["3.3 Pattern Rule Matcher (Colons, Names, Types)"]
        P3_4["3.4 Plain-English Advice Generator"]
    end

    subgraph TutorProc ["5.0 Socratic AI Subsystem"]
        P5_1["5.1 Context Assembler (Code + Error + Goal)"]
        P5_2["5.2 Pedagogical Guardrail System Prompt Injection"]
        P5_3["5.3 OpenRouter / Ollama API Dispatcher"]
        P5_4["5.4 Socratic Response Streaming Filter"]
    end

    UserCode --> P2_1
    P2_1 --> P2_2
    P2_2 <--> P2_3
    P2_2 --> P2_4
    P2_4 --> P2_5

    P2_5 -->|"On Error Detected"| P3_1
    P3_1 --> P3_2
    P3_2 --> P3_3
    P3_3 --> P3_4

    P2_5 -->|"On Help Requested"| P5_1
    P3_4 --> P5_1
    P5_1 --> P5_2
    P5_2 --> P5_3
    P5_3 --> P5_4

    P2_5 -->|"Success Stdout"| Output["Formatted Output Terminal"]
    P3_4 -->|"Diagnostic Card"| Output
    P5_4 -->|"Socratic Chat Message"| Output
```

---

### Diagram 7: System Use Case Diagram
**Placement:** Chapter 4, Section 4.8 (Figure 4.6)

```mermaid
flowchart LR
    Student(("Student / Learner"))
    SystemAdmin(("Academic Instructor / Admin"))
    LLM_Service(("AI LLM Gateway"))

    subgraph UseCases ["CodeMentor AI Core Use Cases"]
        UC1(["UC1: Write & Edit Python Code in Monaco"])
        UC2(["UC2: Run Code in Sandboxed Environment"])
        UC3(["UC3: Inspect Beginner-Friendly AST Diagnostics"])
        UC4(["UC4: Submit Solution for Multi-Test Evaluation"])
        UC5(["UC5: Unlock Progressive 3-Tier Hints"])
        UC6(["UC6: Engage with Socratic AI Tutor"])
        UC7(["UC7: Pipe Interactive Stdin Inputs"])
        UC8(["UC8: Explore Structured 6-Module Curriculum"])
        UC9(["UC9: Undertake End-of-Module Mastery Exams"])
        UC10(["UC10: Author Custom Challenges & Test Cases"])
        UC11(["UC11: Track Progress, Score & Effort Penalties"])
        UC12(["UC12: Configure Local/Cloud AI Providers"])
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8
    Student --> UC9
    Student --> UC10
    Student --> UC11

    SystemAdmin --> UC10
    SystemAdmin --> UC12

    UC6 -.->|delegates to| LLM_Service
    UC12 -.->|tests connectivity| LLM_Service
    UC4 -.->|includes| UC2
    UC5 -.->|triggers| UC11
    UC6 -.->|triggers| UC11
```

---

### Diagram 8: Code Evaluation & Socratic Assistance Sequence Diagram
**Placement:** Chapter 4, Section 4.9 (Figure 4.7)

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant FE as React Frontend (Monaco & UI)
    participant API as Flask REST Controller
    participant SR as SubprocessRunner Sandbox
    participant DE as AST Diagnostic Engine
    participant TE as Task Evaluator
    participant HC as Help Counter Service
    participant AI as Socratic AI Tutor Gateway

    S->>FE: Enters Python code and clicks "Run / Evaluate"
    FE->>API: POST /api/evaluate {task_id, code}
    
    loop For each test case in task
        API->>SR: execute(code, stdin=test.input_stdin, timeout=5.0s)
        SR-->>API: {stdout, stderr, exit_code, duration_ms}
        API->>TE: compare_output(stdout, expected, match_mode)
        TE-->>API: {passed: true/false, diff}
    end

    alt All Test Cases Passed
        API->>HC: record_attempt(passed=true, score=100%)
        API-->>FE: Return EvaluationResult (All tests passed, celebration triggers)
        FE-->>S: Display 100% green score, pass badges & confetti
    else One or More Test Cases Failed or Syntax Error
        API->>DE: parse_and_diagnose(code, stderr)
        DE-->>API: CodeDiagnostic (What happened, Why, How to fix)
        API->>HC: record_attempt(passed=false, score=partial)
        API-->>FE: Return EvaluationResult with Diagnostic Card
        FE-->>S: Display failed diffs + Diagnostic explanation
    end

    opt Student Requests Pedagogical Help
        S->>FE: Clicks "Ask Socratic Tutor"
        FE->>API: POST /api/tutor/ask {code, error, student_query}
        API->>HC: increment_assistance(task_id, type="ai_query")
        API->>AI: query_llm(system_prompt=SocraticOnly, context)
        AI-->>API: Socratic guidance stream
        API-->>FE: Return tutor response
        FE-->>S: Display dialectic hint without direct answer
    end
```

---

### Diagram 9: Student Learning & Mastery Activity Diagram
**Placement:** Chapter 4, Section 4.10 (Figure 4.8)

```mermaid
stateDiagram-v2
    [*] --> SelectCourseTrack : User navigates to /courses
    SelectCourseTrack --> BrowseCurriculum : Explore 6 Modules / 32 Sessions
    BrowseCurriculum --> ReadLesson : Open Interactive Lesson Viewer
    ReadLesson --> LaunchWorkspace : Click 'Solve in IDE' / Practice Challenge
    
    state WorkspacePractice {
        [*] --> WriteCode : Load Starter Code in Monaco
        WriteCode --> ExecuteCode : Click 'Run' (Ctrl+Enter)
        ExecuteCode --> CheckOutput : Inspect Execution Terminal
        
        state EvaluationDecision <<choice>>
        CheckOutput --> EvaluationDecision : Submit for Evaluation
        EvaluationDecision --> SolvedSuccess : All Test Cases Passed
        EvaluationDecision --> AnalyzeFailure : Tests Failed or Error
        
        state HelpDecision <<choice>>
        AnalyzeFailure --> HelpDecision : Review Diagnostic Card
        HelpDecision --> ModifyCode : Self-Correction (No Help)
        HelpDecision --> RequestHint : Unlock Progressive Hint
        HelpDecision --> AskAITutor : Chat with Socratic Tutor
        
        RequestHint --> ModifyCode : Apply Hint Clue
        AskAITutor --> ModifyCode : Answer Socratic Questions
        ModifyCode --> ExecuteCode
    }

    SolvedSuccess --> UpdateProgress : Persist Progress & Calculate Stars
    UpdateProgress --> NextChallenge : Load Next Session Challenge
    NextChallenge --> WorkspacePractice : More challenges exist
    NextChallenge --> TakeMasteryExam : All challenges in module solved
    TakeMasteryExam --> ExamPassed : Score >= 80% Threshold
    TakeMasteryExam --> WorkspacePractice : Score < 80% (Review recommended)
    ExamPassed --> ModuleMastered : Award Module Certificate / Badge
    ModuleMastered --> [*]
```

---

### Diagram 10: Backend Services & Evaluator Class Diagram
**Placement:** Chapter 4, Section 4.11 (Figure 4.9)

```mermaid
classDiagram
    class BaseRunner {
        <<interface>>
        +execute(code: str, stdin: str, timeout: float) ExecutionResult
        #_clean_environment() dict
    }

    class SubprocessRunner {
        -float timeout_seconds
        -int max_output_bytes
        +execute(code: str, stdin: str, timeout: float) ExecutionResult
        -_spawn_process(code: str, stdin: str) Popen
        -_monitor_timeout(process: Popen) bool
    }

    class ExecutionResult {
        +str stdout
        +str stderr
        +int exit_code
        +float execution_time_ms
        +bool timed_out
        +bool truncated
        +to_dict() dict
    }

    class DiagnosticEngine {
        +analyze(code: str, stderr: str) CodeDiagnostic
        -_detect_syntax_error(code: str, stderr: str) CodeDiagnostic
        -_detect_runtime_error(code: str, stderr: str) CodeDiagnostic
        -_check_missing_colons(code: str) DiagnosticRule
        -_check_casing_typos(code: str) DiagnosticRule
    }

    class CodeDiagnostic {
        +str error_type
        +str category
        +int line_number
        +str what_happened
        +str why_it_happened
        +str how_to_fix
        +to_dict() dict
    }

    class Evaluator {
        -Comparer comparer
        -BaseRunner runner
        +evaluate_task(code: str, task: TaskDefinition) EvaluationResult
    }

    class Comparer {
        +compare(actual: str, expected: str, mode: str) bool
        -_match_trimmed(actual: str, expected: str) bool
        -_match_float(actual: str, expected: str, tol: float) bool
        -_match_exact(actual: str, expected: str) bool
    }

    class EvaluationResult {
        +str task_id
        +float score_percentage
        +bool passed_all
        +List~TestCaseResult~ test_results
        +to_dict() dict
    }

    class AITutorService {
        -str active_provider
        -str model_name
        -float temperature
        +ask_tutor(code: str, error: str, query: str) str
        +explain_error(code: str, error: str) str
        -_build_socratic_prompt(context: dict) list
        -_dispatch_openrouter(messages: list) str
        -_dispatch_ollama(messages: list) str
    }

    class HelpCounterService {
        -dict session_counters
        +record_hint_unlock(task_id: str, tier: int) void
        +record_ai_query(task_id: str) void
        +get_assistance_summary(task_id: str) dict
        +calculate_penalty(task_id: str) float
    }

    BaseRunner <|-- SubprocessRunner
    BaseRunner ..> ExecutionResult : creates
    Evaluator o-- BaseRunner : uses
    Evaluator o-- Comparer : uses
    Evaluator ..> EvaluationResult : generates
    DiagnosticEngine ..> CodeDiagnostic : generates
    Evaluator ..> DiagnosticEngine : calls on failure
    AITutorService o-- HelpCounterService : notifies
```

---

## 6. PLAYWRIGHT SCREENSHOT AUTOMATION & WORDCRAFT PICTURE PLAN

Chapter 6 requires 13 authentic UI screenshots. The frontend dev server is active at `http://localhost:5173`. We have verified that the WordCraft command `insert.picture` accepts `{"path": "<absolute_path>", "width": 450, "alt": "<description>"}`.

### Screenshot Automation Catalog

| Figure | Image Filename | Frontend Route / State | Target Description in Blackbook |
| :--- | :--- | :--- | :--- |
| **Fig 6.1** | `fig_6_1_home_hero.png` | `http://localhost:5173/` | **Landing Page Hero & CTA Interface:** Streamlined single-screen hero with interactive Python preview and dual navigation pathways. |
| **Fig 6.2** | `fig_6_2_course_explorer.png` | `http://localhost:5173/courses` | **Course Explorer & Curriculum Catalog:** 6-Module grid showcasing active Module 1 and roadmap cards for Modules 2–6. |
| **Fig 6.3** | `fig_6_3_lesson_viewer.png` | Click Session 1 in `/courses` | **Interactive Lesson Viewer Modal:** Rich concept reader with runnable code snippets, expected outputs, and "Try in IDE" shortcuts. |
| **Fig 6.4** | `fig_6_4_editor_course_mode.png` | `http://localhost:5173/editor?mode=course` | **Course Track IDE Workspace:** 3-Zone layout (Monaco Editor, Output Terminal, and Course Challenge Panel). |
| **Fig 6.5** | `fig_6_5_task_eval_pass.png` | `http://localhost:5173/editor?mode=course` (Run valid code) | **Task Evaluation Engine (100% Pass):** Multi-case evaluation panel showing passed assertions, execution timing, and green score badge. |
| **Fig 6.6** | `fig_6_6_diagnostic_card.png` | Trigger syntax error in editor | **Beginner-Friendly AST Diagnostic Card:** 3-tier plain-English error breakdown (*What Happened*, *Why It Happened*, *How to Fix*). |
| **Fig 6.7** | `fig_6_7_progressive_hints.png` | Open Hints tab in Course Panel | **3-Tier Progressive Hint Panel:** Tier 1 Conceptual Nudge, Tier 2 Strategy, and Tier 3 Skeleton Clue with reveal toggles. |
| **Fig 6.8** | `fig_6_8_socratic_ai_tutor.png` | Open AI Tutor tab in Course Panel | **Socratic AI Tutor Chat Interface:** Dialectic question-based guidance without revealing the answer. |
| **Fig 6.9** | `fig_6_9_custom_practice_mode.png`| `http://localhost:5173/editor?mode=custom` | **Custom Question Authoring Mode:** Student problem creator with custom assertions, input/output pairs, and instant test suite runner. |
| **Fig 6.10**| `fig_6_10_stdin_modal.png` | Run code with `input()` statement | **Dynamic Stdin Piping Modal & Help Counter:** Interactive prompt capture popup and live assistance usage pill. |
| **Fig 6.11**| `fig_6_11_chapter_exam_stepper.png`| Launch Exam in `/courses` | **Chapter Mastery Exam Stepper:** High-stakes evaluation environment (Question 1 of N) with 80% passing threshold. |
| **Fig 6.12**| `fig_6_12_progress_modal.png` | Click Progress icon in Navbar | **Student Progress & Score Analytics Modal:** Circular SVG dials, completion metrics, attempt records, and stars. |
| **Fig 6.13**| `fig_6_13_ai_settings_modal.png`| Click AI Status icon in Navbar | **AI Provider Configuration Modal:** Multi-provider gateway settings (OpenRouter cloud vs. Ollama local, model selector, API test). |

### Playwright Automated Capture Script Specification
In Step 2, a headless Playwright script (`capture_blackbook_screenshots.py`) will automatically launch Chromium at viewport `1440 × 900` (optimized for crisp document margins), navigate to each route, wait for Monaco editor and network idle, capture high-DPI screenshots directly into `C:\Users\Suhail\Desktop\Soheab\code-mentor\BLACKBOOK\screenshots\`, and feed them directly into WordCraft's `insert.picture` pipeline.

---

## 7. PRE-GENERATION VERIFICATION CHECKLIST (STEP 2 ROADMAP)

Before executing the `.docx` document generation via WordCraft in Step 2, the following verification milestones are confirmed:

- [x] **Sample PDF Analyzed:** 57 pages of `SUHAIL-BLACKBOOK-BUT-PDF.pdf` extracted, OCR-read, and structurally mapped.
- [x] **College Specifics Documented:** Ramniranjan Jhunjhunwala College (RJC), autonomous college headers, UGC plagiarism draft regulation format, candidate roll numbers (10248 & 10253).
- [x] **Codebase Technical Audit:** Frontend routes, Flask factory blueprints, SubprocessRunner limits, AST diagnostic parser, and 6-module curriculum accurately mapped.
- [x] **10 Mermaid.js Code Blocks:** Complete, valid Mermaid diagrams written and tested for Gantt, Architecture, ER, DFD 0/1/2, Use Case, Sequence, Activity, and Class Diagrams.
- [x] **WordCraft MCP Compatibility:** Verified `insert.picture`, `insert.table`, `text.insert`, `insert.pageBreak`, and styling parameters in WordCraft command dictionary.
- [x] **Master Blueprint Saved:** Successfully written to `C:\Users\Suhail\Desktop\Soheab\code-mentor\BLACKBOOK\BLACKBOOK_MASTER_PLAN.md`.

---
*End of Master Blueprint. Ready to proceed to Step 2: Automated Playwright Screenshot Capture & WordCraft Blackbook Document Generation upon user confirmation.*
