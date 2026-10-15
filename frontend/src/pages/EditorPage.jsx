/**
 * EditorPage.jsx — Professional Coding Workspace
 *
 * 3-Zone Modern IDE Architecture:
 * - Zone 1: Monaco Code Editor with syntax highlighting and keyboard shortcuts
 * - Zone 2: Interactive Terminal & Diagnostic Console (stdout/stderr, exit codes, compiler diagnostics)
 * - Zone 3: Contextual Learning Pane:
 *     - Course Track: 32-Session Curriculum, 3-Tier Hints, Socratic Tutor, and Test Suite Evaluation
 *     - Custom Practice: Student-authored questions, custom test cases, and automated grading
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import CodeEditor, { DEFAULT_PYTHON_CODE } from '../components/CodeEditor';
import DiagnosticCard from '../components/DiagnosticCard';
import CustomQuestionPanel from '../components/CustomQuestionPanel';
import CourseChallengePanel from '../components/curriculum/CourseChallengePanel';
import HelpUsageWidget from '../components/HelpUsageWidget';
import { findChallengeById, getModule } from '../services/curriculumService';
import { runCode } from '../services/api';
import './EditorPage.css';

// Starter CSV datasets for pandas / numpy / matplotlib practice
const STARTER_DATASETS = {
  'students.csv': `name,grade,math,science,attendance
Alice,10,95,92,98
Bob,11,82,85,90
Charlie,10,78,74,85
Diana,12,91,96,95
Evan,11,88,89,92`,
  'sales.csv': `date,product,category,units,revenue
2024-01-01,Laptop,Electronics,5,6000.0
2024-01-02,Headphones,Electronics,12,1200.0
2024-01-02,Desk,Furniture,3,750.0
2024-01-03,Chair,Furniture,8,1200.0
2024-01-04,Monitor,Electronics,6,1800.0`,
  'iris.csv': `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica`,
};

export default function EditorPage() {
  const getInitialMode = () => {
    try {
      const urlMode = new URLSearchParams(window.location.search).get('mode');
      if (urlMode === 'custom') {
        return 'custom';
      }
    } catch (e) {}
    return 'course';
  };

  const [mode, setMode] = useState(getInitialMode); // 'course' | 'custom'
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);

  // Terminal active tab: 'output' | 'data' | 'plot' | 'diagnostics'
  const [terminalTab, setTerminalTab] = useState('output');

  // Standard input (stdin) state for unified interactive terminal console
  const [stdin, setStdin] = useState('');
  const [isMultilineInput, setIsMultilineInput] = useState(false);
  const inlineInputRef = useRef(null);

  // Attached data files state for pd.read_csv / file I/O
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Runner & Diagnostics state
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(true);

  // Course & Curriculum Mode state
  const [activeCourseChallenge, setActiveCourseChallenge] = useState(null);
  const [courseChallengeMeta, setCourseChallengeMeta] = useState({});
  const [examQuestionsList, setExamQuestionsList] = useState([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);

  // CSV file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setAttachedFiles((prev) => {
        const filtered = prev.filter((f) => f.name !== file.name);
        return [...filtered, { name: file.name, content, size: file.size }];
      });
      setTerminalTab('data');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Quick starter dataset loader
  const handleLoadStarterDataset = (filename) => {
    const content = STARTER_DATASETS[filename];
    if (!content) return;
    setAttachedFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== filename);
      return [...filtered, { name: filename, content, size: content.length }];
    });
    setTerminalTab('data');
  };

  // Remove attached data file
  const handleRemoveFile = (filename) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== filename));
  };

  // Load course challenge or transferred walkthrough code on mount
  useEffect(() => {
    // 1. Transferred snippet from walkthrough
    const transferred = sessionStorage.getItem('codementor_transfer_code');
    if (transferred) {
      sessionStorage.removeItem('codementor_transfer_code');
      setCode(transferred);
      return;
    }

    // 2. Query param based challenge loading
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challengeId');
    const examId = params.get('examId');

    if (challengeId) {
      const found = findChallengeById(challengeId);
      if (found) {
        setActiveCourseChallenge(found.challenge);
        setCourseChallengeMeta(found);
        if (found.challenge.starter_code) {
          setCode(found.challenge.starter_code);
        }
        if (found.challenge.test_cases?.[0]?.stdin) {
          setStdin(found.challenge.test_cases[0].stdin);
        }
        return;
      }
    }

    if (examId) {
      const mod = getModule('module_1');
      if (mod && mod.chapter_exam && mod.chapter_exam.questions?.length > 0) {
        const questions = mod.chapter_exam.questions;
        setExamQuestionsList(questions);
        setCurrentExamIndex(0);
        setActiveCourseChallenge(questions[0]);
        setCourseChallengeMeta({
          type: 'chapter_exam',
          moduleId: 'module_1',
          examId: mod.chapter_exam.exam_id,
          examTitle: mod.chapter_exam.title,
          examQuestionIndex: 0,
          totalExamQuestions: questions.length,
        });
        if (questions[0].starter_code) {
          setCode(questions[0].starter_code);
        }
        if (questions[0].test_cases?.[0]?.stdin) {
          setStdin(questions[0].test_cases[0].stdin);
        }
        return;
      }
    }

    // Fallback: Default to first challenge in Module 1
    const mod = getModule('module_1');
    const firstChal = mod?.sessions?.[0]?.lessons?.[0]?.practice_challenges?.[0];
    if (firstChal) {
      setActiveCourseChallenge(firstChal);
      setCourseChallengeMeta({
        type: 'lesson_practice',
        moduleId: 'module_1',
        sessionId: 'session_01',
        lessonId: 'lesson_01_01',
        sessionTitle: 'Session 1 - Python Fundamentals',
        lessonTitle: 'Python Output & Print Formatting',
      });
      if (getInitialMode() === 'course' && firstChal.starter_code) {
        setCode(firstChal.starter_code);
      }
      if (firstChal.test_cases?.[0]?.stdin) {
        setStdin(firstChal.test_cases[0].stdin);
      }
    }
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setStdin('');
    try {
      const url = new URL(window.location);
      url.searchParams.set('mode', newMode);
      window.history.replaceState({}, '', url);
    } catch (e) {}

    if (newMode === 'course' && activeCourseChallenge?.starter_code) {
      setCode(activeCourseChallenge.starter_code);
    }
  };

  const handleNextCourseQuestion = useCallback(() => {
    if (examQuestionsList.length > 0 && currentExamIndex < examQuestionsList.length - 1) {
      const nextIdx = currentExamIndex + 1;
      setCurrentExamIndex(nextIdx);
      const q = examQuestionsList[nextIdx];
      setActiveCourseChallenge(q);
      setCourseChallengeMeta((prev) => ({
        ...prev,
        examQuestionIndex: nextIdx,
      }));
      setStdin('');
      if (q.starter_code) setCode(q.starter_code);
    }
  }, [examQuestionsList, currentExamIndex]);

  const handlePrevCourseQuestion = useCallback(() => {
    if (examQuestionsList.length > 0 && currentExamIndex > 0) {
      const prevIdx = currentExamIndex - 1;
      setCurrentExamIndex(prevIdx);
      const q = examQuestionsList[prevIdx];
      setActiveCourseChallenge(q);
      setCourseChallengeMeta((prev) => ({
        ...prev,
        examQuestionIndex: prevIdx,
      }));
      setStdin('');
      if (q.starter_code) setCode(q.starter_code);
    }
  }, [examQuestionsList, currentExamIndex]);

  const handleResetCode = useCallback(() => {
    if (mode === 'course' && activeCourseChallenge?.starter_code) {
      setCode(activeCourseChallenge.starter_code);
    } else {
      setCode(DEFAULT_PYTHON_CODE);
    }
    setStdin('');
    setResult(null);
    setApiError(null);
    setShowDiagnostic(true);
  }, [mode, activeCourseChallenge]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setApiError(null);
    setStdin('');
    setShowDiagnostic(true);
  }, []);

  /**
   * Execute code via backend Code Runner API with stdin and attached data files.
   *
   * @param {string|null} customStdin - Explicit stdin input string (e.g. from prompt).
   * @param {boolean} isFreshRun - If true, execution resets stdin buffer to prompt cleanly.
   */
  const handleRun = useCallback(async (customStdin = null, isFreshRun = false) => {
    if (isRunning) return;

    setIsRunning(true);
    setApiError(null);
    setShowDiagnostic(true);

    let effectiveStdin = '';
    if (isFreshRun) {
      setStdin('');
      effectiveStdin = '';
    } else if (typeof customStdin === 'string') {
      effectiveStdin = customStdin;
    } else {
      effectiveStdin = stdin;
    }

    try {
      const executionResult = await runCode(code, effectiveStdin, attachedFiles);
      setResult(executionResult);

      const isEof = executionResult?.error_type === 'EOFError' || executionResult?.stderr?.includes('EOF when reading a line');

      if (executionResult?.plot_image) {
        setTerminalTab('plot');
      } else if (executionResult?.diagnostic?.has_diagnostic && !isEof) {
        setTerminalTab('diagnostics');
      } else {
        setTerminalTab('output');
        if (isEof) {
          setTimeout(() => {
            inlineInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            inlineInputRef.current?.focus();
          }, 80);
        }
      }

      // Auto-clear standard input once consumed by a non-EOF run so the next run prompts fresh!
      if (!isEof && effectiveStdin) {
        setStdin('');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to connect to backend code runner');
      setTerminalTab('output');
    } finally {
      setIsRunning(false);
    }
  }, [code, stdin, attachedFiles, isRunning]);

  // Keyboard shortcut: Ctrl+Enter executes script fresh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun(null, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  // Helper to render status badge in terminal header
  const renderStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="output-badge output-badge--running" aria-live="polite">
          <span className="output-spinner" aria-hidden="true" />
          Running…
        </span>
      );
    }

    if (apiError) {
      return (
        <span className="output-badge output-badge--error">
          Connection Error
        </span>
      );
    }

    if (!result) {
      return <span className="output-badge output-badge--idle">Ready</span>;
    }

    const isEof = result.error_type === 'EOFError' || result.stderr?.includes('EOF when reading a line');
    if (isEof) {
      return <span className="output-badge output-badge--warning">⏳ Input Required</span>;
    }

    switch (result.status) {
      case 'success':
        return <span className="output-badge output-badge--success">● Success (Exit 0)</span>;
      case 'runtime_error':
        return <span className="output-badge output-badge--error">● Runtime Error</span>;
      case 'syntax_error':
        return <span className="output-badge output-badge--error">● Syntax Error</span>;
      case 'timeout':
        return <span className="output-badge output-badge--warning">⏱ Timed Out</span>;
      default:
        return <span className="output-badge output-badge--error">● {result.status}</span>;
    }
  };

  // Interactive Unified Terminal Input Bar (feeder for input() calls)
  const renderConsoleInput = (isEof = false) => {
    if (!code.includes('input(') && !isEof) return null;

    return (
      <div className={`terminal-console-input-wrap ${isEof ? 'terminal-console-input-wrap--active-eof' : ''}`}>
        <div className="terminal-console-input-header">
          <div className="terminal-console-input-header__left">
            <span className="terminal-console-prompt-symbol">❯_</span>
            <span className="terminal-console-input-title">
              {isEof ? 'Program paused — enter value for input():' : 'Terminal Standard Input:'}
            </span>
            {stdin.trim() && (
              <span className="terminal-console-queued-pill">
                {stdin.split('\n').length} line(s) ready
              </span>
            )}
          </div>
          <div className="terminal-console-actions-right">
            {mode === 'course' && activeCourseChallenge?.test_cases?.[0]?.stdin && (
              <button
                type="button"
                className="btn-console-pill"
                onClick={() => {
                  setStdin(activeCourseChallenge.test_cases[0].stdin);
                  setTimeout(() => inlineInputRef.current?.focus(), 50);
                }}
                title="Fill sample input from challenge test case"
              >
                📋 Sample Input
              </button>
            )}
            {stdin && (
              <button
                type="button"
                className="btn-console-pill btn-console-pill--clear"
                onClick={() => setStdin('')}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="btn-console-pill"
              onClick={() => setIsMultilineInput((prev) => !prev)}
              title="Toggle between single line and multi-line input box"
            >
              {isMultilineInput ? 'Single Line' : 'Multi-line ↕'}
            </button>
          </div>
        </div>

        {isMultilineInput ? (
          <div className="terminal-console-multiline-box">
            <textarea
              ref={inlineInputRef}
              className="terminal-console-textarea"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Type inputs line by line (one per input() call)&#10;e.g.&#10;25&#10;12&#10;2024"
              rows={4}
              spellCheck={false}
            />
            <button
              type="button"
              className="btn-console-run-now"
              onClick={() => handleRun(stdin, false)}
              disabled={isRunning}
            >
              <span>▶</span> Send Input & Run
            </button>
          </div>
        ) : (
          <div className="terminal-console-singleline-box">
            <span className="terminal-console-prompt-chevron">›</span>
            <input
              ref={inlineInputRef}
              type="text"
              className="terminal-console-input"
              placeholder={isEof ? "Type value (e.g. 25) and press Enter ↵" : "Enter input value and press Enter ↵"}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRun(stdin, false);
                }
              }}
            />
            <button
              type="button"
              className="btn-console-run-now"
              onClick={() => handleRun(stdin, false)}
              disabled={isRunning}
            >
              <span>▶</span> Send
            </button>
          </div>
        )}
      </div>
    );
  };

  const getModeBadgeInfo = () => {
    if (mode === 'custom') {
      return {
        tag: 'Custom Practice Track',
        accentClass: 'mode-accent--blue',
        title: 'Custom Question Playground',
        desc: 'Design bespoke Python coding questions with custom input/output test specifications and automated grading.',
      };
    }
    return {
      tag: 'Python Mastery Track',
      accentClass: 'mode-accent--cyan',
      title: 'Interactive Python Curriculum',
      desc: 'Solve real-world Python challenges, read 3-tier hints, consult the AI tutor, and verify test cases.',
    };
  };

  const modeInfo = getModeBadgeInfo();

  return (
    <main className="editor-page" id="main-content" data-mode={mode}>
      {/* Sleek Workspace Top Bar */}
      <div className="workspace-header-bar container">
        <div className="workspace-header-bar__left">
          <div className="workspace-header-bar__title-wrap">
            <h1 className="workspace-header-bar__title">{modeInfo.title}</h1>
            <span className={`workspace-header-bar__tag ${modeInfo.accentClass}`}>
              {modeInfo.tag}
            </span>
          </div>
          <p className="workspace-header-bar__subtitle">{modeInfo.desc}</p>
        </div>

        <div className="workspace-header-bar__right">
          {/* Mode Switcher Tabs */}
          <div className="mode-switcher" role="tablist" aria-label="Editor Modes">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'course'}
              className={`mode-tab mode-tab--course ${mode === 'course' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('course')}
              id="tab-course-mode"
            >
              <span className="mode-tab__dot" />
              <span>Course Track</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'custom'}
              className={`mode-tab mode-tab--custom ${mode === 'custom' ? 'mode-tab--active' : ''}`}
              onClick={() => handleSwitchMode('custom')}
              id="tab-custom-mode"
            >
              <span className="mode-tab__dot" />
              <span>Custom Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main IDE 3-Zone Workspace Grid */}
      <div className="workspace-layout container">
        {/* Left Column: Monaco Code Editor + Integrated Execution Terminal */}
        <div className="workspace-left-column">
          {/* Section 1: Code Editor & Action Toolbar */}
          <section className="editor-panel" aria-label="Code editor">
            {/* Primary Action Toolbar */}
            <div className="editor-panel__toolbar">
              <div className="editor-panel__toolbar-left">
                <button
                  id="btn-run-code"
                  className="btn btn--primary btn--accent-mint"
                  onClick={() => handleRun(null, true)}
                  disabled={isRunning}
                  aria-label={isRunning ? 'Executing code…' : 'Run code (Ctrl+Enter)'}
                  title="Execute Python code in terminal (Ctrl+Enter)"
                >
                  <span aria-hidden="true">{isRunning ? '⏳' : '▶'}</span>
                  {isRunning ? 'Running…' : 'Run Code'}
                </button>

                <button
                  id="btn-clear-code"
                  className="btn btn--ghost"
                  onClick={handleResetCode}
                  disabled={isRunning}
                  aria-label="Reset editor code"
                  title="Reset code to initial template"
                >
                  <span aria-hidden="true">↺</span>
                  Reset
                </button>
              </div>

              <div className="editor-panel__toolbar-right">
                <HelpUsageWidget />

                <span className="editor-panel__shortcut-hint">
                  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run
                </span>

                <span className="editor-panel__char-count" aria-live="polite">
                  {code.length} chars
                </span>
              </div>
            </div>

            {/* Monaco editor */}
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              height="400px"
            />
          </section>

          {/* Section 2: Integrated Execution Terminal & Diagnostic Console */}
          <section className="output-panel" aria-label="Terminal output and diagnostics">
            <div className="output-panel__header">
              <div className="output-panel__header-left">
                <div className="output-panel__tabs" role="tablist">
                  <button
                    type="button"
                    className={`output-panel__tab ${terminalTab === 'output' ? 'output-panel__tab--active' : ''}`}
                    onClick={() => setTerminalTab('output')}
                  >
                    Terminal Output
                    {stdin.trim() && <span className="output-panel__tab-dot output-panel__tab-dot--cyan" title="Standard input queued" />}
                  </button>
                  <button
                    type="button"
                    className={`output-panel__tab ${terminalTab === 'data' ? 'output-panel__tab--active' : ''}`}
                    onClick={() => setTerminalTab('data')}
                    title="Attach CSV data files for pandas/numpy"
                  >
                    <span>📁</span>
                    Data Files {attachedFiles.length > 0 ? `(${attachedFiles.length})` : ''}
                    {attachedFiles.length > 0 && <span className="output-panel__tab-dot output-panel__tab-dot--purple" />}
                  </button>
                  {result?.plot_image && (
                    <button
                      type="button"
                      className={`output-panel__tab output-panel__tab--has-plot ${terminalTab === 'plot' ? 'output-panel__tab--active' : ''}`}
                      onClick={() => setTerminalTab('plot')}
                      title="View generated Matplotlib plot"
                    >
                      <span>📈</span>
                      Plot Chart
                      <span className="output-panel__tab-dot output-panel__tab-dot--green" />
                    </button>
                  )}
                  {result?.diagnostic?.has_diagnostic && !(result.error_type === 'EOFError' || result.stderr?.includes('EOF when reading a line')) && (
                    <button
                      type="button"
                      className={`output-panel__tab output-panel__tab--has-diag ${terminalTab === 'diagnostics' ? 'output-panel__tab--active' : ''}`}
                      onClick={() => setTerminalTab('diagnostics')}
                    >
                      <span className="output-panel__diag-dot" />
                      Compiler Diagnostic
                    </button>
                  )}
                </div>
                {renderStatusBadge()}
              </div>

              <div className="output-panel__header-right">
                {result && result.execution_time_ms !== undefined && (
                  <span className="output-panel__timing" title="Execution duration">
                    {result.execution_time_ms} ms
                  </span>
                )}
                {(result || apiError) && (
                  <button
                    className="output-panel__btn-clear"
                    onClick={handleClearOutput}
                    title="Clear output terminal"
                    aria-label="Clear output"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="output-panel__body">
              {/* TAB 1: Data Files (CSV & Datasets) */}
              {terminalTab === 'data' && (
                <div className="terminal-data-container">
                  <div className="terminal-data-header">
                    <div>
                      <h4 className="terminal-data-title">Attached Data Files (CSV / Datasets)</h4>
                      <p className="terminal-data-sub">
                        Files placed here are available in the current working directory for <code>pd.read_csv('filename')</code> or <code>open('filename')</code>.
                      </p>
                    </div>
                    <label className="btn-upload-file">
                      📁 Upload File (.csv)
                      <input
                        type="file"
                        accept=".csv,.txt,.tsv,.json"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Preset Datasets */}
                  <div className="terminal-data-presets">
                    <span className="terminal-data-presets-label">Quick Starter Datasets:</span>
                    <button
                      type="button"
                      className="btn-preset-dataset"
                      onClick={() => handleLoadStarterDataset('students.csv')}
                    >
                      📊 + students.csv
                    </button>
                    <button
                      type="button"
                      className="btn-preset-dataset"
                      onClick={() => handleLoadStarterDataset('sales.csv')}
                    >
                      📈 + sales.csv
                    </button>
                    <button
                      type="button"
                      className="btn-preset-dataset"
                      onClick={() => handleLoadStarterDataset('iris.csv')}
                    >
                      🌸 + iris.csv
                    </button>
                  </div>

                  {/* Active Files List */}
                  <div className="terminal-data-list">
                    {attachedFiles.length === 0 ? (
                      <div className="terminal-data-empty">
                        <span className="terminal-data-empty-icon">📂</span>
                        <p>No data files attached yet.</p>
                        <p className="terminal-data-empty-sub">
                          Upload your own CSV or click one of the quick starter datasets above to practice data analysis with Pandas.
                        </p>
                      </div>
                    ) : (
                      attachedFiles.map((file) => (
                        <div key={file.name} className="attached-file-card">
                          <div className="attached-file-card__info">
                            <span className="attached-file-card__icon">📄</span>
                            <div>
                              <strong className="attached-file-card__name">{file.name}</strong>
                              <span className="attached-file-card__meta">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Attached'} • {file.content.split('\n').length} lines
                              </span>
                            </div>
                          </div>
                          <div className="attached-file-card__actions">
                            <button
                              type="button"
                              className="btn-copy-code-snippet"
                              onClick={() => {
                                const snippet = `# Load dataset with pandas\nimport pandas as pd\ndf = pd.read_csv('${file.name}')\nprint(df.head())\n`;
                                setCode((prev) => prev.trim() ? prev + '\n\n' + snippet : snippet);
                              }}
                              title="Append loading code to editor"
                            >
                              Insert <code>pd.read_csv</code> Snippet
                            </button>
                            <button
                              type="button"
                              className="btn-remove-file"
                              onClick={() => handleRemoveFile(file.name)}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Plot Output */}
              {terminalTab === 'plot' && (
                <div className="terminal-plot-container">
                  {result?.plot_image ? (
                    <>
                      <div className="terminal-plot-header">
                        <div className="terminal-plot-title-row">
                          <span className="terminal-plot-badge">Matplotlib Rendered</span>
                          <span className="terminal-plot-sub">Figure automatically captured from execution</span>
                        </div>
                        <a
                          href={result.plot_image}
                          download="codementor_plot.png"
                          className="btn-download-plot"
                        >
                          ⬇ Download PNG
                        </a>
                      </div>
                      <div className="terminal-plot-frame">
                        <img
                          src={result.plot_image}
                          alt="Generated Visualization Chart"
                          className="terminal-plot-img"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="output-state output-state--idle">
                      <p className="output-state__text">No plot figures generated in the last run.</p>
                      <p className="output-state__subtext">
                        Use <code>import matplotlib.pyplot as plt</code> and call <code>plt.plot()</code> or <code>plt.show()</code> to view charts here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Compiler Diagnostics */}
              {terminalTab === 'diagnostics' && showDiagnostic && result?.diagnostic?.has_diagnostic && (
                <div className="output-content">
                  <DiagnosticCard
                    diagnostic={result.diagnostic}
                    code={code}
                    executionResult={result}
                    onClose={() => setShowDiagnostic(false)}
                  />
                </div>
              )}

              {/* TAB 5: Terminal Output */}
              {terminalTab === 'output' && (
                <>
                  {/* Loading state */}
                  {isRunning && (
                    <div className="output-state output-state--running">
                      <div className="output-pulse-loader" aria-hidden="true" />
                      <p className="output-state__text">Executing script in isolated Python sandbox…</p>
                    </div>
                  )}

                  {/* API / Connection error */}
                  {!isRunning && apiError && (
                    <div className="output-state output-state--api-error">
                      <span className="output-state__icon" aria-hidden="true">⚠️</span>
                      <p className="output-state__error-title">Backend Connection Failed</p>
                      <p className="output-state__error-msg">{apiError}</p>
                      <p className="output-state__error-hint">
                        Ensure the Flask backend is running on <code>http://localhost:5000</code>.
                      </p>
                    </div>
                  )}

                  {/* Idle state */}
                  {!isRunning && !apiError && !result && (
                    <div className="output-state-wrap">
                      <div className="output-state output-state--idle">
                        <div className="output-state__icon-box">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 17 10 11 4 5" />
                            <line x1="12" y1="19" x2="20" y2="19" />
                          </svg>
                        </div>
                        <p className="output-state__text">
                          Press <strong>Run Code</strong> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to execute.
                        </p>
                        <p className="output-state__subtext">
                          Standard output (<code>stdout</code>), raw tracebacks, and plain-English diagnostics render here.
                        </p>
                      </div>
                      {renderConsoleInput(false)}
                    </div>
                  )}

                  {/* Output content when result exists */}
                  {!isRunning && !apiError && result && (() => {
                    const isEof = result.error_type === 'EOFError' || result.stderr?.includes('EOF when reading a line');

                    return (
                      <div className="output-content">
                        {/* Matplotlib plot notice banner if plot available */}
                        {result.plot_image && (
                          <div className="terminal-plot-quick-banner">
                            <div className="terminal-plot-quick-banner__left">
                              <span className="terminal-plot-quick-banner__icon">📈</span>
                              <span>Matplotlib figure rendered successfully!</span>
                            </div>
                            <button
                              type="button"
                              className="btn-view-chart"
                              onClick={() => setTerminalTab('plot')}
                            >
                              View Chart →
                            </button>
                          </div>
                        )}

                        {/* Diagnostic Banner if there is an error (suppressed for EOFError) */}
                        {showDiagnostic && result.diagnostic && result.diagnostic.has_diagnostic && !isEof && (
                          <div className="terminal-diag-quick-notice">
                            <div className="terminal-diag-quick-notice__left">
                              <span className="terminal-diag-quick-notice__tag">Diagnostic Detected</span>
                              <span className="terminal-diag-quick-notice__type">{result.diagnostic.error_type}</span>
                            </div>
                            <button
                              type="button"
                              className="terminal-diag-quick-notice__btn"
                              onClick={() => setTerminalTab('diagnostics')}
                            >
                              View Diagnostic Analysis →
                            </button>
                          </div>
                        )}

                        {/* Standard Output stream */}
                        {result.stdout && (
                          <div className="output-stream-container">
                            <span className="output-stream-label">Standard Output</span>
                            <pre className="output-stream output-stream--stdout">
                              <code>{result.stdout}</code>
                            </pre>
                          </div>
                        )}

                        {/* Unified Interactive Terminal Input Line directly under stdout */}
                        {renderConsoleInput(isEof)}

                        {/* Raw Python Traceback (only for real code errors, NOT EOFError) */}
                        {result.stderr && !isEof && (
                          <div className="output-stream-container">
                            <span className="output-stream-label output-stream-label--error">Raw Python Traceback</span>
                            <pre className="output-stream output-stream--stderr">
                              <code>{result.stderr}</code>
                            </pre>
                          </div>
                        )}

                        {!result.stdout && !result.stderr && !result.plot_image && !isEof && (
                          <p className="output-empty-note">
                            [Process completed with exit code 0 — no standard output printed]
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Contextual Learning & Mode Experience */}
        <div className="workspace-right-column">
          {mode === 'custom' ? (
            <section className="task-panel" aria-label="Custom Question Panel">
              <CustomQuestionPanel
                code={code}
                executionResult={result}
                onApplyStarterCode={(starter) => setCode(starter)}
              />
            </section>
          ) : (
            <section className="task-panel" aria-label="Course Challenge Panel">
              <CourseChallengePanel
                challenge={activeCourseChallenge}
                challengeMeta={courseChallengeMeta}
                code={code}
                onSetCode={setCode}
                onNextQuestion={handleNextCourseQuestion}
                onPrevQuestion={handlePrevCourseQuestion}
                hasNext={examQuestionsList.length > 0 ? currentExamIndex < examQuestionsList.length - 1 : false}
                hasPrev={examQuestionsList.length > 0 ? currentExamIndex > 0 : false}
                onBackToCourse={() => (window.location.href = '/courses')}
                attachedFiles={attachedFiles}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
