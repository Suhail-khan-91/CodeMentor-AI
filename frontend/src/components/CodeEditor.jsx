/**
 * CodeEditor.jsx — Reusable Monaco-based Python Code Editor (Upgraded)
 *
 * Configured with:
 * - Custom 'codementor-dark' theme matching the application's obsidian palette
 * - JetBrains Mono typography with font ligatures
 * - IDE file tabs, language badge, and live status bar (cursor Ln/Col, Spaces, Encoding)
 *
 * Props:
 *   value      {string}   — Current code content (controlled).
 *   onChange   {Function} — Called with new code string on every edit.
 *   height     {string}   — CSS height for the editor (default: '100%').
 *   readOnly   {boolean}  — If true, editor is read-only (default: false).
 *   filename   {string}   — Active file tab name (default: 'main.py').
 */

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

export const DEFAULT_PYTHON_CODE = `# Welcome to CodeMentor AI — Python Editor
# Write your Python code below and press Run Code when ready.

def explore():
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    return total

print(f"Calculated sum: {explore()}")
`;

const EDITOR_OPTIONS = {
  fontSize: 13.5,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  autoIndent: 'full',
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    alwaysConsumeMouseWheel: false,
  },
  padding: { top: 14, bottom: 14 },
  renderLineHighlight: 'gutter',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  bracketPairColorization: { enabled: true },
};

export default function CodeEditor({
  value = DEFAULT_PYTHON_CODE,
  onChange,
  height = '100%',
  readOnly = false,
  filename = 'main.py',
}) {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define sleek custom dark theme to blend with the obsidian canvas
    monaco.editor.defineTheme('codementor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '38efbd' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'identifier.function', foreground: '60a5fa' },
        { token: 'type', foreground: '38efbd' },
      ],
      colors: {
        'editor.background': '#0b0f17',
        'editor.foreground': '#f1f5f9',
        'editorGutter.background': '#0b0f17',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38efbd',
        'editor.lineHighlightBackground': '#131822',
        'editor.selectionBackground': '#1e293b',
        'editorCursor.foreground': '#38efbd',
        'editorBracketMatch.background': '#1e293b',
        'editorBracketMatch.border': '#38efbd',
      },
    });

    monaco.editor.setTheme('codementor-dark');

    // Track cursor movement for status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  const lineCount = typeof value === 'string' ? value.split('\n').length : 1;
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="code-editor-shell" style={{ height }}>
      {/* Chrome Header: File tab, language pill, shortcuts */}
      <div className="code-editor__chrome-header">
        <div className="code-editor__tabs-group">
          <div className="editor-file-tab">
            <span className="file-py-dot" aria-hidden="true" />
            <span className="file-name">{filename}</span>
          </div>
        </div>

        <div className="code-editor__header-meta">
          <span className="editor-meta-pill">
            {charCount} chars • {lineCount} lines
          </span>
          <span className="editor-lang-badge">Python 3.14</span>
          <span className="editor-shortcut-chip">⌘⏎ Run</span>
        </div>
      </div>

      {/* Monaco Container */}
      <div className="code-editor__body">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          options={{ ...EDITOR_OPTIONS, readOnly }}
          onChange={(newValue) => onChange?.(newValue ?? '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="code-editor__loading">
              <span className="code-editor__loading-spinner" aria-hidden="true" />
              Initializing Monaco IDE…
            </div>
          }
        />
      </div>

      {/* Chrome Footer: Status Bar */}
      <div className="code-editor__status-bar">
        <div className="status-bar__left">
          <span className="status-indicator">
            <span className="status-indicator__dot" aria-hidden="true" />
            Ready
          </span>
          <span className="status-bar__item">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="status-bar__item">Spaces: 4</span>
        </div>
        <div className="status-bar__right">
          <span className="status-bar__item">UTF-8</span>
          <span className="status-bar__item">Python</span>
        </div>
      </div>
    </div>
  );
}
