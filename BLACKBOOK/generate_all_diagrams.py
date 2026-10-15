"""
Generate all 10 Mermaid diagrams in high-definition PNG format
using the official Mermaid API service (mermaid.ink) with white background.
Saves to C:\\Users\\Suhail\\Desktop\\Soheab\\code-mentor\\BLACKBOOK\\diagrams\\
"""

import os
import base64
import json
import urllib.request
import time

DIAGRAMS_DIR = r"C:\Users\Suhail\Desktop\Soheab\code-mentor\BLACKBOOK\diagrams"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

DIAGRAMS = [
    {
        "filename": "fig_3_1_gantt.png",
        "title": "Figure 3.1: Project Development & Research Gantt Schedule",
        "code": """gantt
    title CodeMentor AI Development & Research Schedule (2025 - 2026)
    dateFormat  YYYY-MM-DD
    section Phase 1: Research & PRD
    Pedagogy & Problem Analysis       :done, p1, 2025-07-01, 2025-07-20
    Architecture & Blueprint PRD      :done, p2, 2025-07-21, 2025-08-10
    section Phase 2: Core Engine (Part A)
    Foundation & Monaco IDE           :done, p3, 2025-08-11, 2025-08-31
    Subprocess Runner & Sandbox       :done, p4, 2025-09-01, 2025-09-20
    AST Diagnostic Engine             :done, p5, 2025-09-21, 2025-10-10
    Task Evaluator & Hints            :done, p6, 2025-10-11, 2025-11-05
    Socratic Tutor & AI Config        :done, p7, 2025-11-06, 2025-11-30
    Help Counter & Progress           :done, p8, 2025-12-01, 2025-12-25
    section Phase 3: Curriculum (Part B)
    Curriculum Architecture           :done, p9, 2026-01-02, 2026-01-20
    Modules 1-6 Ingestion             :done, p10, 2026-01-21, 2026-02-20
    Academic UI/UX Polish             :done, p11, 2026-02-21, 2026-03-10
    section Phase 4: Testing & Blackbook
    Pytest Suite & Benchmarking       :done, p12, 2026-03-11, 2026-03-25
    Blackbook Documentation           :active, p13, 2026-03-26, 2026-04-15"""
    },
    {
        "filename": "fig_4_1_architecture.png",
        "title": "Figure 4.1: Multi-Tier System Architecture Diagram",
        "code": """graph TD
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
    CurriculumJSON --> UI_Nav"""
    },
    {
        "filename": "fig_4_2_er_diagram.png",
        "title": "Figure 4.2: Entity-Relationship (ER) Diagram",
        "code": """erDiagram
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
        string student_id PK
        string username
        datetime created_at
        int total_stars
    }

    MODULE {
        string module_id PK
        string title
        string description
        int order_index
    }

    SESSION {
        string session_id PK
        string module_id FK
        string title
        string difficulty
    }

    TASK_DEFINITION {
        string task_id PK
        string session_id FK
        string title
        string category
        text starter_code
        text instructions
    }

    TEST_CASE {
        string test_id PK
        string task_id FK
        text input_stdin
        text expected_output
        string match_mode
        boolean is_hidden
    }

    PROGRESSIVE_HINTS {
        string hint_id PK
        string task_id FK
        text level_1_nudge
        text level_2_strategy
        text level_3_clue
    }

    TASK_ATTEMPT {
        string attempt_id PK
        string student_id FK
        string task_id FK
        float score_percentage
        boolean passed_all
        int passed_tests
        int total_tests
        datetime timestamp
    }

    HELP_USAGE {
        string usage_id PK
        string attempt_id FK
        int hints_unlocked
        int ai_queries_count
        boolean solution_viewed
        float penalty_score
    }

    CURRICULUM_PROGRESS {
        string progress_id PK
        string student_id FK
        string module_id FK
        float completion_percentage
        int completed_sessions
        float exam_score
        datetime updated_at
    }

    CHAPTER_EXAM {
        string exam_id PK
        string session_id FK
        int passing_threshold
        int total_questions
    }"""
    },
    {
        "filename": "fig_4_3_dfd_level_0.png",
        "title": "Figure 4.3: Data Flow Diagram Level 0 (Context Level)",
        "code": """flowchart TD
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
    AI_Provider -->|"Returns Socratic guidance stream"| CodeMentor"""
    },
    {
        "filename": "fig_4_4_dfd_level_1.png",
        "title": "Figure 4.4: Data Flow Diagram Level 1 (Subsystem Deconstruction)",
        "code": """flowchart TD
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
    D2 -->|"Renders progress dashboard"| P1"""
    },
    {
        "filename": "fig_4_5_dfd_level_2.png",
        "title": "Figure 4.5: Data Flow Diagram Level 2 (Execution, Diagnostics & Socratic Pipeline)",
        "code": """flowchart TD
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
    P5_4 -->|"Socratic Chat Message"| Output"""
    },
    {
        "filename": "fig_4_6_use_case.png",
        "title": "Figure 4.6: System Use Case Diagram",
        "code": """flowchart LR
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
    UC6 -.->|triggers| UC11"""
    },
    {
        "filename": "fig_4_7_sequence.png",
        "title": "Figure 4.7: Code Evaluation & Socratic Assistance Sequence Diagram",
        "code": """sequenceDiagram
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
    end"""
    },
    {
        "filename": "fig_4_8_activity.png",
        "title": "Figure 4.8: Student Learning & Mastery Activity Diagram",
        "code": """stateDiagram-v2
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
    ModuleMastered --> [*]"""
    },
    {
        "filename": "fig_4_9_class.png",
        "title": "Figure 4.9: Backend Services & Evaluator Class Diagram",
        "code": """classDiagram
    class BaseRunner {
        <<interface>>
        +execute(code, stdin, timeout) ExecutionResult
        #_clean_environment() dict
    }

    class SubprocessRunner {
        -float timeout_seconds
        -int max_output_bytes
        +execute(code, stdin, timeout) ExecutionResult
        -_spawn_process(code, stdin) Popen
        -_monitor_timeout(process) bool
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
        +analyze(code, stderr) CodeDiagnostic
        -_detect_syntax_error(code, stderr) CodeDiagnostic
        -_detect_runtime_error(code, stderr) CodeDiagnostic
        -_check_missing_colons(code) DiagnosticRule
        -_check_casing_typos(code) DiagnosticRule
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
        +evaluate_task(code, task) EvaluationResult
    }

    class Comparer {
        +compare(actual, expected, mode) bool
        -_match_trimmed(actual, expected) bool
        -_match_float(actual, expected, tol) bool
        -_match_exact(actual, expected) bool
    }

    class EvaluationResult {
        +str task_id
        +float score_percentage
        +bool passed_all
        +List test_results
        +to_dict() dict
    }

    class AITutorService {
        -str active_provider
        -str model_name
        -float temperature
        +ask_tutor(code, error, query) str
        +explain_error(code, error) str
        -_build_socratic_prompt(context) list
        -_dispatch_openrouter(messages) str
        -_dispatch_ollama(messages) str
    }

    class HelpCounterService {
        -dict session_counters
        +record_hint_unlock(task_id, tier) void
        +record_ai_query(task_id) void
        +get_assistance_summary(task_id) dict
        +calculate_penalty(task_id) float
    }

    BaseRunner <|-- SubprocessRunner
    BaseRunner ..> ExecutionResult : creates
    Evaluator o-- BaseRunner : uses
    Evaluator o-- Comparer : uses
    Evaluator ..> EvaluationResult : generates
    DiagnosticEngine ..> CodeDiagnostic : generates
    Evaluator ..> DiagnosticEngine : calls on failure
    AITutorService o-- HelpCounterService : notifies"""
    }
]

def fetch_and_save():
    for idx, d in enumerate(DIAGRAMS):
        fname = d["filename"]
        out_path = os.path.join(DIAGRAMS_DIR, fname)
        print(f"[{idx+1}/{len(DIAGRAMS)}] Generating {fname} via mermaid.ink...")
        
        state = {
            "code": d["code"],
            "mermaid": {
                "theme": "neutral",
                "themeVariables": {
                    "fontFamily": "Times New Roman",
                    "fontSize": "13px"
                }
            }
        }
        json_str = json.dumps(state)
        encoded = base64.urlsafe_b64encode(json_str.encode("utf-8")).decode("ascii")
        url = f"https://mermaid.ink/img/{encoded}?bgColor=FFFFFF"
        
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                with open(out_path, "wb") as f:
                    f.write(data)
                print(f"  --> Saved {fname} ({len(data)} bytes)")
        except Exception as e:
            print(f"  --> Error fetching {fname}: {e}")
        time.sleep(0.5)

    print("Finished generating all 10 diagrams!")

if __name__ == "__main__":
    fetch_and_save()
