# CodeMentor AI --- Project Blueprint / PRD

**Project:** CodeMentor AI\
**Type:** Interactive Python Learning Platform with AI-assisted
tutoring\
**Development Strategy:** Part A (Core Platform Engine) → Part B
(Educational Course)\
**Current Focus:** Part A only

------------------------------------------------------------------------

# 1. Project Vision

CodeMentor AI is a Python learning platform where students learn by
writing and running code inside the application.

The platform should not simply give students answers. It should help
them understand errors, receive hints, debug code, and progressively
solve programming problems themselves.

The project is divided into two major parts:

-   **Part A --- Core Platform Engine:** Build and test all technical
    features and reusable backend/frontend systems.
-   **Part B --- Educational Course:** Add the actual Python curriculum,
    lessons, practice questions, and exams using the engine built in
    Part A.

------------------------------------------------------------------------

# 2. Development Strategy

## Part A --- Core Platform

Build the complete technical foundation without creating the full Python
curriculum.

The main testing environment will be **Custom Question Mode**, because
it can exercise most of the core systems:

``` text
Student creates a question
        ↓
Student writes Python code
        ↓
Code Runner
        ↓
Output / Error
        ↓
Diagnostic / Evaluation
        ↓
Hints / AI Tutor
        ↓
Help Counter
        ↓
Score / Progress
```

Part A should end with a working platform engine that can later support
the full course.

## Part B --- Educational Content

After Part A is stable, build:

``` text
Python Course
    ↓
Lessons
    ↓
Practice
    ↓
Chapter Exams
    ↓
Progress + Scores
```

These educational features will reuse the engines created in Part A.

------------------------------------------------------------------------

# 3. PART A --- CORE PLATFORM ENGINE

Part A is divided into phases. Each phase should be completed and tested
before moving to the next phase.

## Phase A1 --- Project Foundation

Build the basic application structure.

### Includes

-   Frontend application
-   Backend application
-   Communication between frontend and backend
-   Basic project configuration
-   Environment/configuration management
-   Basic navigation
-   Development scripts
-   Error handling foundation

### Goal

A clean application skeleton that can be extended safely.

------------------------------------------------------------------------

## Phase A2 --- Code Editor

Build the coding interface.

### Includes

-   Python code editor
-   Write/edit code
-   Run button
-   Clear/reset functionality
-   Code input/output area
-   Basic editor features
-   Error display area

### Goal

Student can write Python code inside CodeMentor AI and submit it to the
backend.

------------------------------------------------------------------------

## Phase A3 --- Code Runner Engine

Build the backend service that executes student Python code.

### Includes

-   Receive code from frontend
-   Execute Python
-   Capture standard output
-   Capture errors/tracebacks
-   Return execution status
-   Execution timeout
-   Resource/safety restrictions
-   Prevent dangerous system-level operations as far as practical for
    the chosen local architecture

### Goal

Student can safely run Python code and receive output or errors.

**Important:** Code Runner is a core engine, not a separate student
learning mode. Practice, exams, custom mode, and debug mode can all use
it.

------------------------------------------------------------------------

## Phase A4 --- Code Diagnostic Engine

Build the system that makes Python errors understandable.

### Includes

-   Capture Python syntax/runtime errors
-   Identify error type
-   Identify useful location information such as line number
-   Convert technical errors into beginner-friendly explanations
-   Detect selected simple/common code issues where reliable
    deterministic logic is possible

### Example

``` text
Raw:
SyntaxError: unterminated string literal

CodeMentor explanation:
Your string starts with a quotation mark but does not have a matching
closing quotation mark.
```

### Goal

Students can understand common Python errors without immediately needing
AI.

------------------------------------------------------------------------

## Phase A5 --- Task Evaluation Engine

Build the system that determines whether code solves a defined task.

### Includes

-   Expected result / expected behavior
-   Compare student result with expected result
-   Pass / Fail
-   Test cases where appropriate
-   Basic scoring result
-   Feedback data for later hint/AI systems

### Important distinction

A program can run successfully but still be logically wrong.

Example:

``` python
print(5 * 5)
```

when the question expects addition.

The Code Runner says the code ran successfully.

The Evaluation Engine says the answer is incorrect.

### Goal

Separate **"code ran"** from **"solution is correct."**

------------------------------------------------------------------------

## Phase A6 --- Known Mistake / Hint System

Build a limited library of intentionally selected, known educational
mistakes.

### This is NOT:

-   A database of every possible Python mistake.
-   A system that tries to predict every student mistake.

### It IS:

-   A collection of useful, known patterns.
-   Mainly task/concept-specific logical mistakes.
-   Each pattern can have a predefined educational hint.

### Example

``` text
Question:
Print numbers from 1 to 10.

Known mistake:
range(1, 10)

Hint:
Remember that the ending value of range() is not included.
```

### Goal

Provide fast, deterministic hints for mistakes that we already know how
to identify reliably.

------------------------------------------------------------------------

## Phase A7 --- AI Tutor Engine

Build the AI-powered tutoring layer.

### Responsibilities

-   Analyze student question/context
-   Analyze student code
-   Analyze output/error
-   Understand mistakes that deterministic systems cannot confidently
    handle
-   Give contextual guidance
-   Prefer hints and guidance instead of directly giving the complete
    solution

### AI sources

Support two possible sources:

1.  **Local LLM**
    -   Ollama/local model
2.  **Cloud LLM**
    -   Configurable API provider
    -   API key
    -   Model name
    -   Provider/base URL where required

### Goal

AI acts as the intelligent fallback/tutor, not as the only
error-handling mechanism.

------------------------------------------------------------------------

## Phase A8 --- AI Connection & Configuration

Create an easy way for the user to configure and test AI.

### Cloud AI

User should be able to provide:

-   Provider
-   API key
-   Model name
-   Required endpoint/base URL information

Then:

**Test AI Connection**

The application sends a simple test request and confirms whether the
configured model is responding.

### Local AI

Support connecting to an Ollama/local model.

The long-term goal is to make local setup as easy as possible,
potentially including application-assisted startup/checking rather than
requiring the student to manually manage everything.

### Goal

A student can determine whether their selected AI provider is working
before using AI features.

------------------------------------------------------------------------

## Phase A9 --- AI Error Explanation

Add a dedicated AI-assisted error explanation capability.

### Flow

``` text
Student code
    +
Python error
    ↓
AI
    ↓
Beginner-friendly explanation
```

### Important distinction

-   **Code Diagnostic Engine:** deterministic/basic explanation.
-   **AI Error Explanation:** deeper explanation when useful.

Both can exist together.

------------------------------------------------------------------------

## Phase A10 --- Custom Question Mode

This is the primary testing playground for Part A.

### Student workflow

``` text
Write own question
        ↓
Write Python solution
        ↓
Run code
        ↓
See output/error
        ↓
Evaluate / diagnose
        ↓
Use hint or AI
        ↓
Try again
```

### Example

Student writes:

> Write a Python program to create this star pattern.

Then writes and runs the solution.

### Features used here

Custom Question Mode should reuse:

-   Code Editor
-   Code Runner
-   Code Diagnostic Engine
-   Task Evaluation where applicable
-   Known Mistake / Hint System where applicable
-   AI Tutor
-   AI Error Explanation
-   AI connection system
-   Help counter

### Goal

Prove that the core platform works before adding the full course.

------------------------------------------------------------------------

## Phase A11 --- Help / AI Usage Counter

Track assistance usage during a session.

### Track

-   Number of AI hint requests
-   Number of error explanations
-   Potentially separate types of assistance

### Goal

Create the foundation for later teacher/admin monitoring and scoring.

For Part A, this can remain local/session-based.

------------------------------------------------------------------------

## Phase A12 --- Progress & Score Engine

Build the reusable infrastructure for tracking learning activity.

### Potential data

-   Completed tasks
-   Attempts
-   Pass/Fail
-   Scores
-   AI help usage
-   Debug challenge results
-   Exam results later

### Part A scope

Build the engine and basic tracking structure.

### Part B

Connect it to the actual course, lessons, practice, and exams.

------------------------------------------------------------------------

## Phase A13 --- Debug Mode

Build an additional practice mode using the existing engines.

### Flow

``` text
Broken code provided
        ↓
Student runs it
        ↓
Error / incorrect output
        ↓
Student diagnoses and fixes it
        ↓
Run again
        ↓
Success
```

### Goal

Use the same Code Runner, Diagnostic, Hint, and AI systems in another
learning scenario.

------------------------------------------------------------------------

## Phase A14 --- Part A Integration & Testing

Connect everything and test the complete engine.

### Main test flow

``` text
Custom Question
      ↓
Code Editor
      ↓
Code Runner
      ↓
Error / Output
      ↓
Diagnostic / Evaluation
      ↓
Known Hint OR AI Tutor
      ↓
Help Counter
      ↓
Score / Progress
```

### Goal

Part A should be a functional technical platform even without the full
Python curriculum.

------------------------------------------------------------------------

# 4. PART B --- EDUCATIONAL COURSE

Part B begins only after the core platform is stable.

## B1 --- Course Structure

Create the Python learning roadmap.

Example structure:

``` text
1. Basic Python
2. Intermediate Python
3. Advanced Python
4. NumPy
5. Pandas
6. Matplotlib
...
```

The exact curriculum will be decided from the selected learning
material.

------------------------------------------------------------------------

## B2 --- Lessons

Each lesson combines:

``` text
Theory
  ↓
Examples
  ↓
Interactive code example
  ↓
Practice
```

The student should learn the concept and immediately try it.

------------------------------------------------------------------------

## B3 --- Practice

Each topic contains multiple programming questions.

Students:

-   Read the question
-   Write code
-   Run it
-   Receive diagnostics/evaluation
-   Get hints when needed
-   Use AI when needed
-   Continue until they solve it

------------------------------------------------------------------------

## B4 --- Chapter Exams

After related topics are completed, students take an exam.

Example:

``` text
Input
+
Data Types
+
Operators
↓
Chapter Exam
```

Questions should test combined understanding rather than only isolated
concepts.

------------------------------------------------------------------------

## B5 --- Course Progress

Connect the course to the Part A progress/score engine.

Track:

-   Lesson completion
-   Practice attempts
-   Practice scores
-   Exam scores
-   AI help usage
-   Chapter progress

------------------------------------------------------------------------

# 5. Overall Architecture

The high-level relationship should remain:

``` text
                 CODEMENTOR AI
                       │
        ┌──────────────┴──────────────┐
        │                             │
   PART A ENGINE                 PART B COURSE
        │                             │
        │                    Course → Lessons
        │                             ↓
        │                         Practice
        │                             ↓
        │                           Exams
        │                             │
        └──────────────┬──────────────┘
                       ↓
                 Shared Engines
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
  Code Editor      Code Runner      Evaluation
       │               │                │
       └───────────────┼────────────────┘
                       ↓
              Diagnostic / Hints
                       ↓
                   AI Tutor
                 ↙          ↘
             Ollama       Cloud API
                       ↓
                Progress / Score
```

------------------------------------------------------------------------

# 6. Core Design Principle

The system should follow this general priority:

``` text
1. Python / deterministic systems
             ↓
2. Known reliable rules/patterns
             ↓
3. AI Tutor when deeper understanding is required
```

Do not use an LLM for something that can be handled reliably by normal
programming logic.

Do not attempt to create deterministic rules for every possible student
mistake.

------------------------------------------------------------------------

# 7. What Is NOT Being Built in Part A

Part A should NOT focus on:

-   Full Python curriculum
-   Hundreds of lessons
-   Complete practice question bank
-   Complete chapter exams
-   Teacher/admin dashboard
-   Multi-user deployment
-   Central institutional database
-   Mobile application
-   Gamification beyond what is needed for core testing

These can come later.

------------------------------------------------------------------------

# 8. Final Definition of the Two Parts

## PART A --- ENGINE

**Build the technology that makes CodeMentor AI work.**

``` text
Editor
→ Runner
→ Diagnostics
→ Evaluation
→ Hints
→ AI
→ Local/Cloud AI
→ Help Counter
→ Progress/Score
→ Custom Mode
→ Debug Mode
```

## PART B --- COURSE

**Build the educational content that uses the engine.**

``` text
Python Curriculum
→ Lessons
→ Interactive Examples
→ Practice
→ Chapter Exams
→ Progress & Scores
```

------------------------------------------------------------------------

# 9. Development Rule for Future AI Chats

This document is the project source of truth.

When starting a new AI coding/planning conversation:

1.  Provide this blueprint to the AI.
2.  Tell the AI which **Part and Phase** is currently being built.
3.  Do not ask it to redesign unrelated phases unless explicitly
    requested.
4.  Keep completed phases unchanged unless a dependency/problem requires
    modification.
5.  Before coding a phase, define its requirements and acceptance
    criteria.
6.  After coding, test the phase before moving to the next phase.
7.  Do not start Part B until Part A's core engine is stable.

------------------------------------------------------------------------

# 10. Current Starting Point

**Current status: Planning complete.**

**Next step:**

> Start **Part A → Phase A1: Project Foundation**.

Do not build the full Python course yet.
