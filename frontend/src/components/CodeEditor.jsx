/**
 * CodeEditor.jsx — Reusable Monaco-based Python code editor.
 *
 * Phase A2 responsibility:
 *   - Render the Monaco editor configured for Python.
 *   - Expose the current code value via the `onChange` prop.
 *   - Accept an external `value` prop so parent pages control state.
 *
 * Phase A3 will connect the Run button to the Flask /api/run endpoint.
 * This component intentionally has NO execution logic.
 *
 * Props:
 *   value      {string}   — Current code content (controlled).
 *   onChange   {Function} — Called with new code string on every edit.
 *   height     {string}   — CSS height for the editor (default: '420px').
 *   readOnly   {boolean}  — If true, editor is read-only (default: false).
 */

import Editor from '@monaco-editor/react';
import './CodeEditor.css';

// Default Python starter code shown when no value is provided
export const DEFAULT_PYTHON_CODE = `# Welcome to CodeMentor AI — Python Editor
# Write your Python code below and press Run Code when ready.

print("Hello, World!")
`;

// Monaco editor options — configured once here so future phases
// only need to adjust this object.
const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,       // re-flows when container resizes
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  autoIndent: 'full',
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: 'gutter',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  bracketPairColorization: { enabled: true },
};

export default function CodeEditor({
  value = DEFAULT_PYTHON_CODE,
  onChange,
  height = '420px',
  readOnly = false,
}) {
  return (
    <div className="code-editor" style={{ height }}>
      <div className="code-editor__header">
        <span className="code-editor__lang-badge">
          <span className="code-editor__lang-dot" aria-hidden="true" />
          Python
        </span>
        <span className="code-editor__hint">
          Monaco Editor
        </span>
      </div>

      <div className="code-editor__body">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          options={{ ...EDITOR_OPTIONS, readOnly }}
          onChange={(newValue) => onChange?.(newValue ?? '')}
          loading={
            <div className="code-editor__loading">
              <span className="code-editor__loading-spinner" aria-hidden="true" />
              Loading editor…
            </div>
          }
        />
      </div>
    </div>
  );
}
