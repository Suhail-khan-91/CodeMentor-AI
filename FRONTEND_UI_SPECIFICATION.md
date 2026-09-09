# CodeMentor AI — Complete Frontend UI Specification
**Document Version:** 1.0 (Phase A1–A14 Complete)  
**Target Audience:** UI/UX Designers, Design Systems Engineers, Claude Design, Frontend Developers  
**Scope:** Full descriptive specification of the CURRENT implementation. Preserves existing behavior without modifications or premature redesigns.

---

## 1. PROJECT FRONTEND OVERVIEW

### 1.1 Purpose of the Application
CodeMentor AI is an interactive, browser-based Python learning and coding platform designed to provide a pedagogical alternative to passive code-generation tools. Instead of feeding students copy-paste solutions, the platform employs deterministic diagnostics, progressive multi-tiered hint hierarchies, and Socratic AI guidance to scaffold learning, cultivate problem-solving intuition, and prevent cognitive offloading.

### 1.2 What the Frontend Does
The frontend delivers a unified developer workspace where students write, execute, test, and debug Python code directly in their browser. It supports four distinct operational modes:
1. **Free Play Mode:** An open scratchpad for running arbitrary Python code, visualizing standard output/error, inspecting deterministic diagnostics, and triggering AI deep-dive explanations.
2. **Task Evaluation Mode:** A structured challenge runner where code is evaluated against predefined test cases (including hidden validation tests) with diff views, progressive hints, and performance scoring.
3. **Custom Question Mode:** A challenge authoring and solving environment enabling students to construct their own problem statements, define test cases with varied matching rules (trimmed, exact, case-insensitive, float tolerance), and grade solutions.
4. **Debug Mode:** A targeted debugging lab presenting realistic broken Python programs across distinct error types (syntax, runtime, logic, type errors) where students diagnose bugs and verify repairs against test suites.

Across all modes, the frontend provides session-level assistance metering (Help Counter) and performance analytics (Progress & Score Engine) without applying punitive score deductions.

### 1.3 Current Frontend Technology Stack
- **Framework:** React 19 (`react` 19.2.0, `react-dom` 19.2.0)
- **Build Tool / Bundler:** Vite 8.2.2 with `@vitejs/plugin-react`
- **Code Editor Component:** `@monaco-editor/react` 4.7.0 wrapping Microsoft Monaco Editor (VS Code core editor)
- **Styling Architecture:** Vanilla CSS with CSS Custom Properties (CSS variables) in `index.css`. No CSS frameworks (no Tailwind CSS, Bootstrap, Material UI, or component libraries).
- **Icons:** Native UTF-8 Unicode emojis and typographic glyphs (e.g., `⚡`, `🤖`, `💡`, `📊`, `✓`, `✗`, `▲`, `▼`).
- **Routing:** Custom lightweight browser history router using `window.location.pathname`, `history.pushState`, and `popstate` event listeners (zero external routing dependencies).
- **Backend Communication:** Standard `fetch()` API centralized in `frontend/src/services/api.js`. In development, requests to `/api/*` are proxied by the Vite dev server to the Flask backend running on `http://localhost:5000`.

### 1.4 Application Structure & Main Routes
- `/` — **Home Page (`Home.jsx`):** Product hero, platform architecture overview, live backend connectivity status badge, and a responsive 12-feature showcase grid linking to platform capabilities.
- `/editor` — **Editor Workspace (`EditorPage.jsx`):** Primary dual-column coding environment supporting query-parameter mode switching:
  - `/editor` or `/editor?mode=editor` $\rightarrow$ Free Play Mode
  - `/editor?mode=task` $\rightarrow$ Task Evaluation Mode
  - `/editor?mode=custom` $\rightarrow$ Custom Question Mode
  - `/editor?mode=debug` $\rightarrow$ Debug Challenge Mode

---

## 2. GLOBAL UI & SHARED DESIGN PATTERNS

### 2.1 Navigation Bar (`Navbar.jsx`)
The Navbar is fixed to the top of the viewport across all views (`position: sticky; top: 0; z-index: 100`).
- **Visual Presentation:** Glassmorphism style with dark translucent surface (`background: rgba(15, 17, 23, 0.85)`), `backdrop-filter: blur(12px)`, and bottom border (`1px solid var(--color-border)`).
- **Brand / Logo:**
  - Icon: `⚡` with gradient-highlighted logo container.
  - Title: "CodeMentor **AI**" (the "AI" is rendered inside a gradient text span).
  - Subtitle badge: "Interactive Learning" in small muted font (`0.7rem`).
  - Action: Clicking navigates to `/` (Home).
- **Navigation Links:**
  - `Dashboard` $\rightarrow$ navigates to `/`.
  - `Editor` $\rightarrow$ navigates to `/editor`.
  - Active links receive a subtle background pill (`background: var(--color-surface-2)`) and brighter text color.
- **Top Bar Actions:**
  - **Progress Button (`#btn-open-progress`):** Displays icon `📊` and text "Progress". Clicking opens the cumulative `ProgressModal`.
  - **AI Settings Button (`#btn-open-ai-settings`):** Displays icon `⚙️` and text "AI Settings". Clicking opens the `AISettingsModal`.
  - **Phase Badge:** Pill indicator rendering "Phase A14" in primary accent purple with a subtle glow border.

### 2.2 Shared UI Elements & Controls
- **Buttons (`.btn`):**
  - Base: Flexbox container, `border-radius: var(--radius-md)` (8px), font-weight 500, transition `all 0.15s ease`.
  - `.btn--primary`: Accent purple background (`--color-primary: #6c63ff`), white text, subtle box-shadow. Hover turns to `#8179ff` with slight upward translation (`translateY(-1px)`).
  - `.btn--ghost`: Transparent background, subtle border (`1px solid var(--color-border)`), muted text. Hover brightens text and adds background `var(--color-surface-2)`.
  - `.btn--danger`: Crimson background (`--color-error: #ef4444`), white text for destructive operations like resetting session data.
- **Badges & Status Pills:**
  - Rounded pill geometry (`border-radius: 9999px`), small uppercase or semi-bold text (`0.72rem – 0.8rem`), flex aligned with icons.
  - Variants: Success (`--color-success: #22c55e`), Error (`--color-error: #ef4444`), Warning/Timeout (`--color-warning: #f59e0b`), Info/Neutral (`--color-primary: #6c63ff` or surface tokens).
- **Cards & Surface Containers:**
  - Elevated surfaces use `background: var(--color-surface)` (`#1a1d27`) or `var(--color-surface-2)` (`#232635`).
  - Borders: 1px solid `var(--color-border)` (`#2e3247`).
  - Corners: `border-radius: var(--radius-lg)` (12px) for cards, `var(--radius-xl)` (16px) for modals.
- **Modals:**
  - Fixed full-screen backdrop overlay (`rgba(0, 0, 0, 0.75)` with `backdrop-filter: blur(4px)`).
  - Centered floating modal window with max-width (580px–740px), max-height 90vh, scrollable body (`overflow-y: auto`), explicit close button (`×` or `✕`), and escape key binding.
- **Loading Indicators:**
  - `.output-spinner` / `.eval-spinner`: 24px circular spinning border with accent top-border.
  - Pulsing dots: 8px circular indicator pulsing between opacity 0.4 and 1.0.
- **Error States:**
  - Alert banners with subtle red background tint (`rgba(239, 68, 68, 0.1)`), red border (`rgba(239, 68, 68, 0.3)`), and warning icon (`⚠️`).

---

## 3. HOME PAGE SPECIFICATION (`Home.jsx`)

The Home Page functions as an overview and feature directory for CodeMentor AI.

### 3.1 Hero Section
- **Status Indicator:** Houses `<StatusBadge />` at the top:
  - "Checking backend…" with yellow pulsing dot during initial API health probe (`GET /api/health`).
  - "Backend Status: Connected (Phase A14)" with green dot when successful.
  - "Backend Offline — Check Flask Server" with red dot upon failure.
- **Headline:**
  - Text: "Master Python with **Intelligent Mentorship**".
  - The words "Intelligent Mentorship" feature a vibrant linear text gradient: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`.
- **Subtitle:**
  - "A modern coding platform featuring Monaco Editor, Python code runner, deterministic diagnostics, progressive hints, Socratic AI tutoring, and challenge modes."
- **Primary Call to Action:**
  - Big button: "Open Code Editor →".
  - Clicking transitions route directly to `/editor`.
- **Decorative Code Preview Widget:**
  - Styled as a dark macOS-style terminal card with three window control dots (red, yellow, green).
  - Displays a static code block demonstrating Python syntax and the platform's execution model.

### 3.2 Feature Showcase Grid
A 12-card responsive grid (`repeat(auto-fill, minmax(280px, 1fr))`) documenting the capabilities implemented across Phases A1 through A14:
1. **Monaco Python Editor:** Syntax highlighting, ligatures, bracket matching (`/editor`).
2. **Subprocess Code Runner:** Sandboxed execution, standard input support, execution metrics (`/editor`).
3. **Deterministic Diagnostics:** Automated syntax and runtime error detection with line numbers (`/editor`).
4. **Task Evaluation Engine:** Multi-case testing, hidden test suites, diff output views (`/editor?mode=task`).
5. **Progressive Hint Engine:** 3-tier progressive hint system (Conceptual $\rightarrow$ Strategy $\rightarrow$ Clue) (`/editor?mode=task`).
6. **Socratic AI Tutor:** Non-spoiler reflective guidance with provider flexibility (`/editor`).
7. **AI Connection Hub:** Offline mock, local Ollama, and cloud OpenAI configuration.
8. **AI Error Explanations:** Plain-English breakdown of complex Python tracebacks (`/editor`).
9. **Custom Question Mode:** Author custom questions, configure matching rules, solve & grade (`/editor?mode=custom`).
10. **Help & Assistance Counter:** Real-time session monitoring of hints and AI inquiries.
11. **Progress & Score Engine:** Cumulative score analytics, completion rates, and attempt counts.
12. **Debug Mode:** Curated broken programs across syntax, runtime, and logic errors (`/editor?mode=debug`).

Each card displays:
- Feature icon badge.
- Feature title and descriptive body text.
- Footer containing Phase Tag (e.g. `Phase A10`, `Phase A13`) and an interactive "Try it →" link if live.

---

## 4. EDITOR WORKSPACE ARCHITECTURE (`EditorPage.jsx`)

The Editor Workspace is the primary interactive hub. It implements a two-column responsive split layout.

```
+-----------------------------------------------------------------------------------------------+
| NAVBAR: Brand | Dashboard | Editor | [📊 Progress] [⚙️ AI Settings]               [Phase A14]  |
+-----------------------------------------------------------------------------------------------+
| WORKSPACE TOOLBAR                                                                             |
| Mode Selector: [Free Play] [Task Eval] [Custom Q] [Debug]  |  [▶ Run Code] [↺ Reset]  [Assists: 2]|
+----------------------------------------------------+------------------------------------------+
| LEFT PANE: CODE EDITOR (Monaco)                    | RIGHT PANE: OUTPUT & CONTEXTUAL PANELS   |
|                                                    |                                          |
| - Language: Python                                 | [In Free Play Mode]:                     |
| - Dark theme (vs-dark)                             |   - Execution status badge & time (ms)   |
| - Line numbers & gutter highlights                 |   - DiagnosticCard (if error detected)   |
| - Code character & line counters                   |   - Standard Output (stdout terminal)    |
| - Keyboard shortcut: Ctrl+Enter / Cmd+Enter        |   - Standard Error (stderr terminal)     |
|                                                    |   - Standalone AITutorPanel              |
|                                                    |                                          |
|                                                    | [In Task Mode]: TaskEvaluationPanel      |
|                                                    | [In Custom Mode]: CustomQuestionPanel    |
|                                                    | [In Debug Mode]: DebugChallengePanel     |
+----------------------------------------------------+------------------------------------------+
```

### 4.1 Workspace Toolbar
- **Mode Navigation Segmented Control:**
  - Four buttons switching active mode:
    1. `💻 Free Play` (`mode === 'editor'`)
    2. `📋 Task Evaluation` (`mode === 'task'`)
    3. `✏️ Custom Question` (`mode === 'custom'`)
    4. `🐛 Debug Mode` (`mode === 'debug'`)
  - Active button has bright text, background `var(--color-surface-2)`, and bottom accent border.
- **Action Control Buttons:**
  - **Run Code (`#btn-run-code`):**
    - Always visible in Free Play mode.
    - Text: `▶ Run Code` (or `⏳ Running…` when busy).
    - Shortcut: `Ctrl+Enter` or `Cmd+Enter`.
  - **Evaluate Task (`#btn-evaluate-task`):**
    - Rendered in Task Evaluation Mode.
    - Text: `🎯 Evaluate Task` (or `⏳ Evaluating…` when busy).
  - **Evaluate Fix (`#btn-evaluate-debug`):**
    - Rendered in Debug Mode.
    - Text: `🎯 Evaluate Fix` (or `⏳ Evaluating…` when busy).
  - **Clear / Reset Code (`#btn-clear-code`):**
    - Text: `↺ Reset`.
    - Resets current editor content back to mode-specific starter code (or prompts verification).
- **Assistance Counter Widget:**
  - Renders `<HelpUsageWidget />` pinned to the right of the toolbar for live tracking.

### 4.2 Left Pane: Monaco Code Editor (`CodeEditor.jsx`)
- Built using `@monaco-editor/react`.
- Height: 100% of workspace height (min-height 500px).
- Editor configuration:
  - Language: `python`
  - Theme: `vs-dark`
  - Font: `'Fira Code', 'Cascadia Code', 'Consolas', monospace`, 14px size, ligatures enabled.
  - Line numbers: `on`, minimap disabled for clean UI.
  - Automatic layout: true (resizes dynamically on window resize).
  - Indentation: 4 spaces (soft tabs), auto-indent full.
- Editor Header Sub-bar:
  - File indicator: `main.py` with Python icon `🐍`.
  - Live character and line counter: e.g., `245 chars • 14 lines`.

### 4.3 Right Pane: Dynamic Output & Contextual Panels
The right pane dynamically swaps its contents based on the selected mode:
- **Free Play Mode:** Displays the execution results header, `<DiagnosticCard />` (if errors exist), raw stdout/stderr streams, and `<AITutorPanel />`.
- **Task Evaluation Mode:** Displays `<TaskEvaluationPanel />`.
- **Custom Question Mode:** Displays `<CustomQuestionPanel />`.
- **Debug Mode:** Displays `<DebugChallengePanel />`.

---

## 5. FREE PLAY MODE

### 5.1 Purpose & Layout
An open playground allowing students to experiment with arbitrary Python code, test algorithms, observe outputs, and receive guided troubleshooting when programs fail.

### 5.2 User Flow & Controls
1. Student enters code in Monaco editor.
2. Clicks `Run Code` or presses `Ctrl+Enter`.
3. Button enters disabled state displaying `⏳ Running…`.
4. Execution request sent to `POST /api/run`.
5. When complete, right pane displays:
   - **Status Pill:**
     - `✓ Success` (green) if exit code 0 and no exceptions.
     - `✕ Runtime Error` (red) on uncaught exceptions.
     - `✕ Syntax Error` (red) on parsing failures.
     - `⏱ Timed Out` (amber) if execution exceeded 5.0 seconds.
   - **Execution Time:** Rendered in milliseconds (e.g., `38.4 ms`).
   - **Diagnostic Card:** Rendered immediately below the status bar if an error occurred.
   - **Standard Output Terminal (`.output-stream--stdout`):**
     - Dark terminal box (`#0a0b0e`).
     - Green label: `Standard Output:`.
     - Code block containing captured stdout text.
     - Empty state: `(No output produced)` if stdout was empty.
   - **Standard Error Terminal (`.output-stream--stderr`):**
     - Dark terminal box with subtle red border.
     - Red label: `Standard Error / Traceback:`.
     - Raw Python traceback string.
   - **AI Tutor Guidance Panel:** Always accessible at the bottom of the right pane for reflective help.

---

## 6. TASK EVALUATION MODE

### 6.1 Purpose & Layout
Provides structured practice using curated algorithmic challenges. Code is evaluated against multiple test cases with hidden validation tests.

### 6.2 Practice Task Selector
- Dropdown selector (`#task-select`) listing starter challenges:
  1. Hello World
  2. Personalized Greeting
  3. Even or Odd
  4. Temperature Converter
  5. Sum of Two Numbers
- Selecting a challenge:
  - Updates the active task definition.
  - Automatically populates the Monaco editor with the challenge's `starter_code`.
  - Resets previous test evaluation results.

### 6.3 Task Description Card
- Title: Challenge name with test case count badge (e.g. `2 Test Cases`).
- Description: Detailed prompt explaining input expectations and output formatting.

### 6.4 Evaluation Results & Scoring
When the student clicks `🎯 Evaluate Task`:
1. Request sent to `POST /api/evaluate`.
2. **Score Summary Card:**
   - Score percentage pill: `100%` (green) or `< 100%` (amber/red).
   - Pass ratio badge: e.g., `2 / 2 Passed` or `1 / 2 Passed`.
   - Visual progress bar fill matching score percentage.
   - Summary message from engine (e.g., "All test cases passed! Outstanding work.").
3. **Test Case Breakdown Accordion (`.eval-tc-list`):**
   - Each test case rendered as an accordion card with status icon:
     - `✓ Passed` (green border)
     - `✗ Failed` (red border)
     - `⏱ Timed Out` (amber border)
     - `⚠ Error` (red border)
   - Header shows test case title, execution time, and `Hidden` tag if applicable.
   - Clicking toggles the accordion body:
     - If runtime crash occurred: renders embedded `<DiagnosticCard />`.
     - For public tests: displays Diff Grid comparing **Standard Input**, **Expected Output**, and **Your Actual Output** (color-coded green/red).
     - For hidden tests: displays lock banner: `🔒 This is a hidden test case. Input and expected values are protected to prevent hardcoded solutions.`
4. **Progress & Hints Integration:**
   - If tests fail, automatically renders `<ProgressiveHintPanel />` and `<AITutorPanel />`.
   - Automatically records the evaluation attempt into the `ProgressTracker` via `POST /api/progress/record-attempt`.

---

## 7. CUSTOM QUESTION MODE

### 7.1 Purpose & Workflow
Allows students to author custom problems, configure automated test cases, and solve them with full grading and AI tutor support.

### 7.2 Two-State Workspace
Controlled by the `Edit Question` / `View Challenge` toggle button (`#btn-toggle-edit-custom-q`):

#### State 1: Question Authoring Form (`isEditing === true`)
- **Starter Template Selector:** Dropdown to load pre-configured examples (e.g., "Right-Angled Star Triangle").
- **Question Title Field (`#custom-q-title`):** Required text input.
- **Problem Description Field (`#custom-q-desc`):** Required multi-line textarea.
- **Starter Code Template (`#custom-q-starter`):** Optional code snippet to initialize the editor.
- **Test Cases Manager:**
  - List of test case cards.
  - Top bar with test case label input, comparison mode dropdown, and delete button (`🗑️`).
  - **Comparison Modes:**
    - `Trimmed`: Strips leading/trailing whitespace and newlines.
    - `Exact`: Exact character-for-character match.
    - `Ignore Case`: Case-insensitive comparison.
    - `Float Tolerance`: Parses numbers and allows $\pm 10^{-4}$ tolerance.
  - Dual textarea grid: Input (`stdin`) and Expected Output (`stdout`).
  - `+ Add Test Case` button (`#btn-add-test-case`).
- **Save Action (`#btn-save-custom-q`):**
  - Sends payload to `POST /api/custom-questions/validate`.
  - On success, switches to Solve Mode.

#### State 2: Solve & Evaluation View (`isEditing === false`)
- **Challenge Description Card:** Shows title, description, test case count, and `🎯 Grade Against Custom Tests` button (`#btn-evaluate-custom-q`).
- **Grading Results Breakdown:**
  - Score badge (e.g. `✓ 100% Passed` or `1/2 Passed`).
  - Execution duration pill (e.g. `45 ms`).
  - Test case accordion with actual vs. expected diff boxes.
  - Embedded `<DiagnosticCard />` if exceptions occur.
  - Embedded `<AITutorPanel />` customized to the custom question context.
- **Progress Tracking:** Automatically records evaluation attempts under category `'custom'`.

---

## 8. DEBUG MODE

### 8.1 Purpose & Workflow
Presents realistic buggy Python code snippets where students inspect symptoms, analyze root causes, repair the code in Monaco editor, and verify fixes.

### 8.2 Challenge Selector & Bug Taxonomy
Dropdown selector (`#debug-select`) populated from `GET /api/debug/challenges`:
1. **Broken Average Calculator** $\rightarrow$ `Type Error` (`debug-type-badge--type`)
2. **Missing Colon in Loop** $\rightarrow$ `Syntax Bug` (`debug-type-badge--syntax`)
3. **Off-By-One Range Counter** $\rightarrow$ `Logic Bug` (`debug-type-badge--logic`)
4. **Dictionary Key Lookup** $\rightarrow$ `Runtime Bug` (`debug-type-badge--runtime`)
5. **Unclosed Parentheses & Syntax** $\rightarrow$ `Syntax Bug` (`debug-type-badge--syntax`)

### 8.3 Challenge Scenario Card
- Header with challenge title and bug type tag.
- Description explaining expected behavior vs. broken behavior.
- **Revert Action (`#btn-revert-buggy-code`):** "↺ Revert to Buggy Code" resets editor to original broken code snippet.
- Test case count indicator.

### 8.4 Evaluation & Fix Verification
- Toolbar button: `🎯 Evaluate Fix` (`#btn-evaluate-debug`).
- Calls `POST /api/debug/evaluate`.
- **Success Banner:** On 100% pass, displays celebratory banner: `🎉 Bug Successfully Fixed!`.
- **Failure Breakdown:** Displays score bar, failing test case accordions, input/expected/actual diffs, embedded `<DiagnosticCard />`, `<ProgressiveHintPanel />`, and `<AITutorPanel />`.
- **Progress Integration:** Recorded under category `'debug'`.

---

## 9. PROGRESS & SCORE ENGINE UI (`ProgressModal.jsx`)

Cumulative performance tracking across all practice modes, accessible via the `📊 Progress` button in the navbar.

### 9.1 Session & Storage Architecture
- **In-Memory Session Storage:** Resets on backend restart. No external database or authentication required.
- **Zero Penalty Guarantee:** Displays educational performance metrics without penalizing hints or AI usage.

### 9.2 Modal Components
- **Header:** Title, subtitle ("Session Learning Journey & Performance Metrics"), and close button (`×`).
- **Hero Completion Banner:**
  - Metric: "Starter Challenges Solved: X / 5 Completed".
  - Large percentage display (e.g. `60%`).
  - Progress bar with gradient fill.
- **Quick Metrics Grid (4 Cards):**
  1. `📈 Average Best Score`: Percentage average across attempted tasks.
  2. `🧪 Evaluation Attempts`: Cumulative count of all evaluation runs.
  3. `💡 Assists Linked`: Total assistance events (hints, AI) logged during attempts.
  4. `🎯 Tasks Attempted`: Count of unique tasks attempted.
- **Task Breakdown Section:**
  - Filter Tabs: `All`, `Starter`, `Custom`.
  - Task Cards Grid:
    - Task title and category pill (`Starter Challenge` / `Custom Challenge`).
    - Status Badge: `✓ Completed` (green), `⚡ In Progress` (amber), or `○ Not Attempted` (muted).
    - Best Score metric and mini score bar.
    - Attempt counter and latest attempt score.
- **Footer Actions:**
  - Notice: `🔒 In-Memory Session Storage (Phase A12). No score penalties applied.`
  - Reset Button (`#btn-reset-progress`): Two-stage confirmation (`↺ Reset Progress` $\rightarrow$ `⚠️ Confirm Reset?`) calling `POST /api/progress/reset`.
  - Close Button (`#btn-close-progress-modal`).

---

## 10. HELP COUNTER UI (`HelpUsageWidget.jsx`)

Located in the workspace toolbar, tracking learning assistance utilized during the session.

### 10.1 Trigger Pill Button (`#btn-help-usage-widget`)
- Icon: `💡`.
- Label: `Assists:`.
- Count Badge: Total assistance count (e.g. `3`).
- Visual state: Highlights with accent border and colored badge when count > 0.

### 10.2 Popover Dropdown Card
Clicking the trigger toggles an elevated popover dialog:
- **Header:** "📊 Assistance Tracker" with "Session Only" tag and close button (`×`).
- **Total Tally Box:** Large highlighted number showing total assists used.
- **Breakdown Rows:**
  1. **Rule-Based Hints (A6):** Shows total and tier sub-breakdown (`L1: X | L2: Y | L3: Z`).
  2. **AI Tutor Inquiries (A7):** Count of questions submitted to AI Tutor.
  3. **AI Error Explanations (A9):** Count of deep-dive explanations requested.
- **Educational Disclaimer:** "💡 Tracked for learning self-awareness. No scoring penalty is applied."
- **Reset Button (`#btn-reset-help-counter`):** "↺ Reset Session Counter" calling `POST /api/help-counter/reset`. Dispatches global event `'help-counter-updated'`.

---

## 11. AI SETTINGS & CONFIGURATION (`AISettingsModal.jsx`)

Accessible via the `⚙️ AI Settings` navbar button and the tutor panel settings shortcut (`#btn-tutor-config`).

### 11.1 Provider Tab Navigation
Three selectable provider tabs:
1. `🛡️ Offline Mock`: Zero-cost, local deterministic simulation.
2. `🦙 Local AI (Ollama)`: Self-hosted open-source models via local Ollama daemon.
3. `☁️ Cloud AI (OpenAI/API)`: Remote OpenAI or OpenAI-compatible endpoints.

### 11.2 Tab Forms & Fields
- **Offline Mock Tab:**
  - Informational card explaining zero-cost, zero-latency, offline operation. Requires no API keys.
- **Local Ollama Tab:**
  - Ollama Base URL input (default: `http://localhost:11434`).
  - Model Name input (e.g. `llama3`, `mistral`, `qwen`).
  - Helper tip on `ollama serve` and `ollama pull`.
- **Cloud AI Tab:**
  - Provider Preset dropdown: `OpenAI (Official)` or `Custom / OpenAI-Compatible Endpoint`.
  - Base URL / Endpoint input (default: `https://api.openai.com/v1`).
  - API Key field with eye toggle (`👁️` / `👁️‍🗨️`) for password masking/unmasking.
  - Model Identifier input (default: `gpt-4o-mini`).

### 11.3 Connection Probing & Saving
- **Test Connection Button (`#btn-test-ai-connection`):**
  - Sends probe to `POST /api/ai/test`.
  - Shows spinner and "Testing…" state.
  - Result Banner: Displays `✓ Connection Verified` with latency in ms (e.g. `42 ms`), or `✕ Connection Test Failed` with error explanation.
- **Save & Activate Button (`#btn-save-ai-settings`):**
  - Posts configuration to `POST /api/ai/config`.
  - Displays green save confirmation toast and closes modal after 1200ms.

---

## 12. DIAGNOSTICS & ERROR UI (`DiagnosticCard.jsx`)

Renders deterministic, beginner-friendly error cards when Python code fails during execution or evaluation.

### 12.1 Visual Anatomy of DiagnosticCard
- **Header:**
  - Category Badge:
    - Syntax Error: Blue badge (`category-badge--syntax`).
    - Runtime Error: Amber badge (`category-badge--runtime`).
    - Indentation Error: Emerald badge (`category-badge--indentation`).
    - Timeout: Orange badge (`category-badge--timeout`).
  - Line Number Tag: e.g. `Line 4` (or `Line unknown`).
  - Error Title: Clear, plain-English summary (e.g., "Missing Colon After 'if' Statement").
- **Plain-English Explanation:** Friendly description of what the error means in beginner terms.
- **Culprit Code Snippet:** Formatted code block showing the exact failing line.
- **Actionable Pro-Tip / Fix:** Highlighted tip box (`💡 How to fix: ...`).

### 12.2 Phase A9 AI Deep Dive Explanation
At the bottom of the card, students can click:
`✨ Explain Error with AI` (`#btn-explain-error-ai`)
- On click, dispatches request to `POST /api/ai/explain-error`.
- Button shows `Thinking…` spinner.
- Dispatches assistance event incrementing the Help Counter.
- Expands an AI Error Explanation Drawer:
  - **Headline & Provider Badge:** e.g., "mock Socratic".
  - **What It Means:** Plain-English conceptual definition.
  - **Why It Happened:** Contextual explanation of the student's code.
  - **How to Think About It:** Mental model and debugging strategy.
  - **Concepts to Review:** Tag pills (e.g., `["Variables", "Scope", "Name Binding"]`).

---

## 13. HINT SYSTEM UI (`ProgressiveHintPanel.jsx`)

The Rule-Based Progressive Hint Engine (Phase A6) provides a 3-tier scaffolding hierarchy that unlocks sequentially.

### 13.1 Tier Hierarchy
- **Level 0 (Default): Locked:**
  - All hints hidden. Displays lock icon and explanation.
- **Level 1: Conceptual Nudge (`🌱 Level 1`):**
  - Mental model orientation. Identifies what concept applies without giving code or syntax.
- **Level 2: Strategy & Approach (`🧭 Level 2`):**
  - Algorithmic direction. Step-by-step logic and strategy.
- **Level 3: Structural Clue (`🧩 Level 3`):**
  - Code skeleton pattern. Provides an illustrative code template to adapt without giving the exact copy-paste solution.

### 13.2 Interactive Controls & Meter
- **Progress Meter:** 3 pill segments filling up as levels unlock (`0/3`, `1/3`, `2/3`, `3/3`).
- **Reveal Button (`#btn-reveal-hint`):**
  - Level 0 $\rightarrow$ `💡 Reveal Hint 1: Conceptual Nudge`
  - Level 1 $\rightarrow$ `🔓 Unlock Hint 2: Strategy & Approach`
  - Level 2 $\rightarrow$ `🔓 Unlock Hint 3: Structural Clue`
  - Level 3 $\rightarrow$ Button replaced with `✓ All 3 hint levels unlocked`
- **Reset Button (`#btn-reset-hints`):** "↺ Lock / Reset Hints" returns panel to Level 0.
- **Collapse Toggle:** `Collapse ▴` / `Expand ▾`.
- **Known Mistake Banner:** If a student triggered a recognized mistake pattern (e.g. string concatenation), displays a targeted detection banner (`🎯 Pattern Detected: ...`).
- **Help Counter Hook:** Each unlock triggers `recordHelpEvent('hint_reveal')` updating the Help Counter.

---

## 14. AI TUTOR UI (`AITutorPanel.jsx`)

Provides conversational, Socratic guidance adhering strictly to pedagogical safeguards.

### 14.1 Panel Layout & Header
- Title: `🤖 AI Tutor`.
- Provider Badge: Indicates active AI provider (e.g., `mock Socratic`, `ollama Socratic`, `openai Socratic`).
- Controls:
  - Settings shortcut button (`⚙️`, `#btn-tutor-config`).
  - Toggle button: `Ask AI Tutor ▾` / `Close AI Tutor ▴`.

### 14.2 Question Bar & Input Form
- Input field: `placeholder="Ask a question about your code or why a test case failed…"`.
- Submit button (`#btn-ask-ai-tutor`): `Ask Tutor` (or `Thinking…` when busy).
- Automatically passes current code, active task, diagnostic, and evaluation diffs to the backend.

### 14.3 Socratic Guidance Display
- **Reflective Guidance Box:** Prose narrative guiding the student through questions rather than answers.
- **Sub-tier Hint Cards:**
  - `🌱 Conceptual Nudge` card.
  - `🧭 Strategy` card.
- **Structural Clue Box:** Formatted code skeleton pattern illustrating the approach.
- **Suggested Next Steps:** Chip tags with actionable ideas (e.g., `["Check loop boundaries", "Add print statement"]`).
- **Anti-Spoiler Footer:** "🛡️ Anti-Spoiler Guarantee: We guide your reasoning without writing complete solutions."
- **Help Counter Hook:** Submitting an inquiry logs an `ai_tutor_ask` event to the Help Counter.

---

## 15. USER FLOWS

### Flow A: Free Play Mode
```
Home Page ("Open Code Editor →")
   │
   ▼
Editor Workspace (Mode: Free Play)
   │
   ▼
Student writes Python code in Monaco Editor
   │
   ▼
Student clicks [▶ Run Code] or presses Ctrl+Enter
   │
   ▼
Backend executes code via POST /api/run
   │
   ├── If Success:
   │     └─ Output Terminal displays stdout, exit code 0, execution time (ms)
   │
   └── If Error (Syntax / Runtime / Timeout):
         ├─ Status badge displays error type and execution time
         ├─ DiagnosticCard displays friendly explanation, line number, culprit snippet, and fix hint
         ├─ Standard Error stream displays raw traceback
         ├─ Student can click [✨ Explain Error with AI] for deep-dive conceptual breakdown
         └─ Student can consult [🤖 AI Tutor] for Socratic troubleshooting
```

### Flow B: Task Evaluation Mode
```
Editor Workspace (Select "📋 Task Evaluation" tab)
   │
   ▼
Student selects challenge from Practice Challenge dropdown
   │
   ▼
Task description card updates; starter code populates Monaco editor
   │
   ▼
Student modifies code and clicks [🎯 Evaluate Task]
   │
   ▼
Backend evaluates code against test cases via POST /api/evaluate
   │
   ├── If All Passed (100%):
   │     ├─ Score summary shows green 100% bar and congratulatory message
   │     ├─ Test case accordion shows all tests ✓ Passed with execution timings
   │     └─ Progress recorded in ProgressTracker
   │
   └── If Any Failed:
         ├─ Score summary shows pass ratio (e.g. 1/2) and amber/red progress bar
         ├─ Test case accordion highlights failing tests with input/expected/actual diffs
         ├─ Embedded DiagnosticCard rendered if Python exception occurred
         ├─ ProgressiveHintPanel becomes available (Level 0 -> 1 -> 2 -> 3)
         ├─ Socratic AI Tutor panel becomes available
         └─ Progress attempt recorded in ProgressTracker
```

### Flow C: Custom Question Mode
```
Editor Workspace (Select "✏️ Custom Question" tab)
   │
   ├── Option 1: Load Starter Template (e.g. Star Triangle)
   └── Option 2: Click [✏️ Edit Question] to author new challenge
         ├─ Fill Title, Description, optional Starter Code
         ├─ Add/Edit Test Cases (stdin, expected_output, match_mode)
         └─ Click [✓ Save & Start Solving] (validates via API)
   │
   ▼
Solve View: Student writes code in Monaco editor
   │
   ▼
Student clicks [🎯 Grade Against Custom Tests]
   │
   ▼
Backend grades code via POST /api/custom-questions/evaluate
   │
   ▼
Test results accordion shows diffs and pass/fail indicators
   │
   ▼
Student can consult integrated AI Tutor grounded in the custom question
   │
   ▼
Attempt recorded in ProgressTracker under category 'custom'
```

### Flow D: Debug Challenge Mode
```
Editor Workspace (Select "🐛 Debug Mode" tab)
   │
   ▼
Student selects challenge from Buggy Challenge dropdown (e.g. Broken Average Calculator)
   │
   ▼
Editor loads buggy code; challenge card shows bug type badge and scenario description
   │
   ▼
Student inspects code and clicks [🎯 Evaluate Fix] (or runs in scratchpad)
   │
   ▼
Backend evaluates repaired code via POST /api/debug/evaluate
   │
   ├── If Bug Resolved:
   │     └─ Celebratory banner: "🎉 Bug Successfully Fixed!" (100% score)
   │
   └── If Bug Persists:
         ├─ Test breakdown shows failing assertion diffs
         ├─ Embedded DiagnosticCard rendered if syntax/runtime crash occurs
         ├─ Progressive hints unlockable tier-by-tier
         └─ Student can click [↺ Revert to Buggy Code] if they need to start over
   │
   ▼
Attempt recorded in ProgressTracker under category 'debug'
```

### Flow E: Assistance & Help Tracking Flow
```
Student in any mode encounters difficulty
   │
   ├── Action A: Unlocks Progressive Hint (Level 1, 2, or 3)
   ├── Action B: Requests AI Error Explanation on DiagnosticCard
   └── Action C: Submits question to Socratic AI Tutor
   │
   ▼
Frontend calls POST /api/help-counter/record with event type and details
   │
   ▼
Window dispatches 'help-counter-updated' custom event
   │
   ▼
HelpUsageWidget pill badge updates in real time (e.g., Assists: 4)
   │
   ▼
Student can open HelpUsageWidget popover to review breakdown or reset session counter
```

---

## 16. COMPONENT INVENTORY TABLE

| Component Name | File Path | Purpose | Where Used | Main Props / State | Important Interactions |
|---|---|---|---|---|---|
| `App` | `frontend/src/App.jsx` | Root application component; lightweight pathname router | Application root (`main.jsx`) | `path` state (`'/'` vs `'/editor'`) | Listens to `popstate` and intercepts internal link clicks |
| `Navbar` | `frontend/src/components/Navbar.jsx` | Global fixed header with navigation, progress, and settings triggers | `App.jsx` (all pages) | `isProgressOpen`, `isSettingsOpen` | Opens `ProgressModal` (`#btn-open-progress`), opens `AISettingsModal` (`#btn-open-ai-settings`) |
| `StatusBadge` | `frontend/src/components/StatusBadge.jsx` | Displays live backend connectivity state | `Navbar.jsx`, `Home.jsx` | `status` (`'loading'`, `'connected'`, `'error'`), `phase` | Calls `GET /api/health` on mount; animated pulsing indicator |
| `Home` | `frontend/src/pages/Home.jsx` | Landing page, platform hero, feature showcase grid | `App.jsx` (`/` route) | `FEATURE_CARDS` constant | Navigates to `/editor` with query params |
| `EditorPage` | `frontend/src/pages/EditorPage.jsx` | Primary coding workspace managing all 4 modes | `App.jsx` (`/editor` route) | `code`, `mode`, `isRunning`, `executionResult`, `activeTask`, `activeDebugChallenge` | Handles `Ctrl+Enter`, mode switching, code reset, calls `POST /api/run` and evaluators |
| `CodeEditor` | `frontend/src/components/CodeEditor.jsx` | Controlled Monaco editor wrapper with Python config | `EditorPage.jsx` | Props: `value`, `onChange`, `height`, `readOnly` | Monaco editor mounting, code change event emission |
| `DiagnosticCard` | `frontend/src/components/DiagnosticCard.jsx` | Displays deterministic error diagnoses with AI deep dive | `EditorPage.jsx`, `TaskEvaluationPanel`, `CustomQuestionPanel`, `DebugChallengePanel` | Props: `diagnostic`, `code`, `executionResult`; State: `aiExplanation`, `isLoadingAi` | Triggers Phase A9 AI error explanation (`#btn-explain-error-ai`) |
| `TaskEvaluationPanel` | `frontend/src/components/TaskEvaluationPanel.jsx` | Practice challenge manager, test runner, and scoring view | `EditorPage.jsx` (Task mode) | Props: `code`, `tasks`, `activeTask`, `evaluationResult`, `isEvaluating`, `hintsData` | Task selection dropdown, test case accordion toggles, embeds hints and AI tutor |
| `ProgressiveHintPanel` | `frontend/src/components/ProgressiveHintPanel.jsx` | 3-tier sequential progressive hint revealer | `TaskEvaluationPanel`, `DebugChallengePanel` | Props: `hintsData`, `taskTitle`; State: `unlockedLevel` (0–3), `isCollapsed` | Progressive unlock button (`#btn-reveal-hint`), reset button (`#btn-reset-hints`), collapse toggle |
| `AITutorPanel` | `frontend/src/components/AITutorPanel.jsx` | Conversational Socratic tutoring panel | `EditorPage.jsx`, `TaskEvaluationPanel`, `CustomQuestionPanel`, `DebugChallengePanel` | Props: `code`, `activeTask`, `evaluationResult`, `diagnostic`; State: `isOpen`, `question`, `tutorData`, `isLoading` | Query submission form, toggle open/close, opens AI settings modal |
| `CustomQuestionPanel` | `frontend/src/components/CustomQuestionPanel.jsx` | Authoring, editing, solving, and grading custom challenges | `EditorPage.jsx` (Custom mode) | Props: `code`, `onApplyStarterCode`; State: `question`, `isEditing`, `templates`, `evaluationResult` | Add/remove/update test cases, template loader, toggle edit view, grade button |
| `DebugChallengePanel` | `frontend/src/components/DebugChallengePanel.jsx` | Curated buggy program debugging workspace | `EditorPage.jsx` (Debug mode) | Props: `code`, `challenges`, `activeChallenge`, `evaluationResult`, `hintsData` | Challenge selector, revert to buggy code (`#btn-revert-buggy-code`), test case accordions |
| `HelpUsageWidget` | `frontend/src/components/HelpUsageWidget.jsx` | Session assistance metric counter pill and dropdown popover | `EditorPage.jsx` toolbar | State: `isOpen`, `summary`, `isResetting` | Popover toggle, reset session counter (`#btn-reset-help-counter`), listens to `'help-counter-updated'` |
| `ProgressModal` | `frontend/src/components/ProgressModal.jsx` | Full-screen modal presenting cumulative scores and progress | `Navbar.jsx` | Props: `isOpen`, `onClose`; State: `summary`, `filter` (`'all'`, `'starter'`, `'custom'`), `confirmReset` | Category filter tabs, two-stage reset confirmation (`#btn-reset-progress`), Escape key listener |
| `AISettingsModal` | `frontend/src/components/AISettingsModal.jsx` | AI provider configuration and connection test modal | `Navbar.jsx`, `AITutorPanel.jsx` | Props: `isOpen`, `onClose`, `onConfigSaved`; State: `activeTab` (`'mock'`, `'ollama'`, `'cloud'`), form fields, `testResult` | Tab navigation, API key visibility toggle, connection test probe (`#btn-test-ai-connection`), save settings |

---

## 17. FRONTEND FILE STRUCTURE

```
code-mentor/frontend/
├── index.html                      # HTML shell: meta tags, Google Fonts (Inter), #root container
├── package.json                    # Dependencies: React 19, @monaco-editor/react, Vite
├── vite.config.js                  # Vite configuration: React plugin, /api/* dev proxy to :5000
├── public/                         # Static assets (favicons, robots.txt)
└── src/
    ├── main.jsx                    # React DOM entry point rendering <App />
    ├── index.css                   # Global design system: CSS variables, reset, typography, utilities
    ├── App.jsx                     # Root component managing page routing (/ and /editor)
    ├── App.css                     # Root layout container styles (.app flex column)
    ├── components/                 # Reusable UI components & modals
    │   ├── Navbar.jsx / .css       # Sticky top navigation bar
    │   ├── StatusBadge.jsx / .css  # Backend connectivity pill indicator
    │   ├── CodeEditor.jsx / .css   # Monaco editor controlled wrapper
    │   ├── DiagnosticCard.jsx / .css# Deterministic diagnostic card & Phase A9 AI drawer
    │   ├── TaskEvaluationPanel.jsx / .css # Practice task selector, scoring & test accordions
    │   ├── ProgressiveHintPanel.jsx / .css # 3-tier progressive hint engine panel
    │   ├── AITutorPanel.jsx / .css # Socratic AI tutor drawer & question form
    │   ├── CustomQuestionPanel.jsx / .css # Custom question authoring & solving panel
    │   ├── DebugChallengePanel.jsx / .css # Buggy challenge selector & fix evaluator panel
    │   ├── HelpUsageWidget.jsx / .css # Session assistance tracker pill & popover
    │   ├── ProgressModal.jsx / .css # Cumulative score analytics & task breakdown modal
    │   └── AISettingsModal.jsx / .css # AI connection manager & endpoint tester modal
    ├── pages/                      # Top-level page views
    │   ├── Home.jsx / .css         # Landing dashboard with hero & feature showcase grid
    │   └── EditorPage.jsx / .css   # Dual-column workspace coordinating all 4 modes
    └── services/
        └── api.js                  # Centralized HTTP client wrapping fetch() for all endpoints
```

---

## 18. CURRENT DESIGN SYSTEM SPECIFICATION

This section documents the **existing design tokens and CSS patterns** currently implemented across `index.css` and component stylesheets.

### 18.1 Color Palette & Design Tokens (`:root`)
```css
/* Core Surfaces & Backgrounds */
--color-bg: #0f1117;          /* Primary dark canvas background */
--color-surface: #1a1d27;     /* Elevated panel/card surface */
--color-surface-2: #232635;   /* Secondary elevated hover/active surface */
--color-border: #2e3247;      /* Subtle border boundary */

/* Brand & Accents */
--color-primary: #6c63ff;       /* Purple brand primary */
--color-primary-hover: #8179ff; /* Bright purple hover */
--color-accent: #00d4aa;        /* Teal/mint bright accent */

/* Typography Colors */
--color-text: #e2e8f0;          /* High-contrast slate text */
--color-text-muted: #8892b0;    /* Muted secondary body text */

/* Semantic Status Colors */
--color-success: #22c55e;       /* Vibrant green for pass/connected */
--color-error: #ef4444;         /* Vibrant crimson red for failure/errors */
--color-warning: #f59e0b;       /* Amber/orange for timeouts and warnings */
```

### 18.2 Typography
- **UI Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Code Font Family:** `'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace`
- **Hierarchy:**
  - Hero Heading: `2.6rem – 3.2rem`, font-weight 800, line-height 1.15.
  - Section / Page Title (`h2`): `1.2rem – 1.6rem`, font-weight 700.
  - Card Title (`h3`): `1.0rem – 1.15rem`, font-weight 600.
  - Body Text: `0.9rem – 0.95rem`, line-height 1.5.
  - Small / Badges: `0.72rem – 0.8rem`, font-weight 500.

### 18.3 Border Radii & Elevation Shadows
- **Border Radii:**
  - `--radius-sm`: `4px` (tags, small badges)
  - `--radius-md`: `8px` (buttons, inputs, status pills)
  - `--radius-lg`: `12px` (cards, containers, terminal window)
  - `--radius-xl`: `16px` (modal dialogs)
  - Full Pill: `9999px` (status badges, step indicators)
- **Shadows:**
  - Card / Panel Shadow: `0 4px 16px rgba(0, 0, 0, 0.3)`
  - Modal Elevation: `0 20px 48px rgba(0, 0, 0, 0.6)`
  - Brand Glow: `0 0 16px rgba(108, 99, 255, 0.35)`

### 18.4 Input & Form Control Styles
- Inputs & Textareas: `background: #12141d; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text); padding: 8px 12px`. Focus state introduces accent border (`var(--color-primary)`) and outline glow.
- Dropdown Selects: Styled with custom dark background and border, matching the input styling.

### 18.5 Terminal & Code Containers
- Terminal Body: `background: #0a0b0e; border: 1px solid #1e2235; border-radius: 8px; padding: 12px 14px; font-family: monospace; font-size: 0.84rem; white-space: pre-wrap`.

### 18.6 Responsive Breakpoints
- **Mobile / Small Screens (`< 768px`):** Navbar stacks links or shortens brand subtitle; Hero padding reduces; feature cards collapse to single column.
- **Medium Screens (`< 960px`):** The two-column editor workspace (`grid-template-columns: 1fr 1fr`) stacks into a single vertical column (`grid-template-columns: 1fr`).

---

## 19. INTERACTION BEHAVIOR SPECIFICATION

1. **Mode Switching:**
   - Switching modes in the EditorPage updates URL query parameters (`?mode=...`) without page reload using `history.pushState`.
   - Pre-populates the editor with the selected mode's starter or buggy code.
2. **Keyboard Shortcuts:**
   - `Ctrl + Enter` (Windows/Linux) or `Cmd + Enter` (macOS) triggers the primary action of the active mode (Run Code in Free Play, Evaluate Task in Task Mode, Grade in Custom Mode, Evaluate Fix in Debug Mode).
   - `Escape` key immediately closes `ProgressModal` and `AISettingsModal`.
3. **Outside Click Handling:**
   - Clicking the modal overlay backdrop outside the modal card closes the modal.
   - Clicking outside the `HelpUsageWidget` popover closes the dropdown.
4. **Accordion Toggling:**
   - Test case cards in Task, Custom, and Debug modes can be toggled by clicking the test header button (`aria-expanded="true/false"`).
   - Failing test cases automatically expand by default after an evaluation completes.
5. **Progressive Hint Reveal:**
   - Sequential unlock mechanism prevents skipping tiers. Level 1 must be unlocked before Level 2 becomes available, etc.
   - Resetting locks all hints and resets the step meter back to `0/3`.
6. **Cross-Component Custom Events:**
   - `'progress-updated'` event is dispatched after any evaluation attempt, prompting `ProgressModal` to re-fetch metrics.
   - `'help-counter-updated'` event is dispatched whenever hints, AI tutor, or AI error explanations are requested, instantly updating `HelpUsageWidget`.

---

## 20. DESIGN REQUIREMENTS FOR FUTURE REDESIGN

When redesigning the user interface with Claude Design, the following functional and informational requirements **MUST BE PRESERVED**:

### 20.1 Functional Requirements That Must Remain
- **All 4 Operational Modes Must Exist:** Free Play, Task Evaluation, Custom Question, and Debug Mode.
- **Monaco Code Editor Must Remain the Core Code Editor:** Must preserve Python language mode, line numbers, automatic layout, syntax highlighting, and `Ctrl+Enter` shortcut.
- **Two-Column / Workspace Layout:** Code editing on one pane and execution results/guidance/test breakdowns on the other pane.
- **Deterministic Diagnostic Card:** Plain-English error title, line number, culprit snippet, and fix hint must remain visible immediately upon execution errors.
- **3-Tier Progressive Hint Structure:** Must strictly enforce Level 0 $\rightarrow$ Level 1 (Nudge) $\rightarrow$ Level 2 (Strategy) $\rightarrow$ Level 3 (Clue) progressive reveal with lock/reset functionality.
- **Socratic AI Tutor Panel:** Must support open-ended student queries, reflective guidance display, structural clue display, and settings shortcut without outputting copy-paste solutions.
- **AI Settings Configuration:** Must support switching between Offline Mock, Local Ollama, and Cloud AI, with connection test probing and key masking.
- **Help Assistance Counter:** Must remain prominently accessible in the workspace, displaying real-time session assist tallies and breakdown without score penalties.
- **Progress & Score Engine:** Must display task completion rates, average scores, attempt counts, and task-by-task breakdown with reset capability.

### 20.2 Essential Information That Must Remain Visible
- Execution status (`Success`, `Runtime Error`, `Syntax Error`, `Timed Out`) and execution time in milliseconds.
- Standard output (`stdout`) and standard error (`stderr`) streams.
- Test case evaluation metrics: percentage score, passed/total ratio, individual test execution timings, and hidden test indicator tags.
- Expected vs. Actual output diff comparisons.
- Active AI provider status indicator (e.g. `mock Socratic`, `ollama Socratic`, `openai Socratic`).

---

## 21. IMPORTANT IMPLEMENTATION CONSTRAINTS

1. **Technology Platform:**
   - This is a client-side **React** application built with **Vite**.
   - Monaco Editor (`@monaco-editor/react`) is integrated for code editing.
2. **Backend API Compatibility:**
   - The existing Flask REST API endpoints must continue working without modifications:
     - `GET /api/health`
     - `POST /api/run`
     - `POST /api/diagnose`
     - `GET /api/tasks`, `POST /api/evaluate`
     - `POST /api/hints`
     - `POST /api/tutor/ask`
     - `GET /api/ai/config`, `POST /api/ai/config`, `POST /api/ai/test`, `POST /api/ai/explain-error`
     - `GET /api/custom-questions/templates`, `POST /api/custom-questions/validate`, `POST /api/custom-questions/evaluate`
     - `GET /api/help-counter/summary`, `POST /api/help-counter/record`, `POST /api/help-counter/reset`
     - `GET /api/progress/summary`, `POST /api/progress/record-attempt`, `POST /api/progress/reset`
     - `GET /api/debug/challenges`, `POST /api/debug/evaluate`
3. **Preservation of Phase A1–A14 Features:**
   - No feature or subsystem developed in Phases A1–A14 may be deleted, stubbed out, or made inoperable.
   - Any UI redesign must be a presentation-layer enhancement that connects directly to the established state management and API services.
4. **Session Scope:**
   - Progress and assistance tracking are session/in-memory only. Do not introduce database, user login, or authentication requirements.
