/**
 * DiagnosticCard.jsx — Educational Code Diagnostic Component (Phase A4).
 *
 * Displays deterministic, beginner-friendly explanations and actionable hints
 * when code encounters syntax errors, runtime exceptions, or timeouts.
 */

import './DiagnosticCard.css';

export default function DiagnosticCard({ diagnostic, onClose }) {
  if (!diagnostic || !diagnostic.has_diagnostic) {
    return null;
  }

  const {
    title,
    friendly_explanation,
    hint,
    line_number,
    code_snippet,
    category,
    error_type
  } = diagnostic;

  // Category visual badge configuration
  const getCategoryBadge = () => {
    switch (category) {
      case 'syntax':
        return { label: 'Syntax Diagnostic', icon: '🔍', className: 'diagnostic-badge--syntax' };
      case 'indentation':
        return { label: 'Indentation Error', icon: '📐', className: 'diagnostic-badge--indentation' };
      case 'timeout':
        return { label: 'Timeout Alert', icon: '⏱', className: 'diagnostic-badge--timeout' };
      case 'runtime':
      default:
        return { label: 'Runtime Diagnostic', icon: '💡', className: 'diagnostic-badge--runtime' };
    }
  };

  const categoryBadge = getCategoryBadge();

  return (
    <aside
      className={`diagnostic-card diagnostic-card--${category || 'runtime'}`}
      aria-label="Code diagnostic guidance"
      role="region"
    >
      {/* Header bar */}
      <div className="diagnostic-card__header">
        <div className="diagnostic-card__header-left">
          <span className={`diagnostic-badge ${categoryBadge.className}`}>
            <span aria-hidden="true">{categoryBadge.icon}</span>
            {categoryBadge.label}
          </span>
          {error_type && (
            <span className="diagnostic-card__error-type">
              {error_type}
            </span>
          )}
        </div>

        <div className="diagnostic-card__header-right">
          {line_number && (
            <span className="diagnostic-card__line-pill">
              Line {line_number}
            </span>
          )}
          {onClose && (
            <button
              type="button"
              className="diagnostic-card__btn-close"
              onClick={onClose}
              aria-label="Dismiss diagnostic"
              title="Dismiss diagnostic"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="diagnostic-card__body">
        <h3 className="diagnostic-card__title">
          {title}
        </h3>

        <p className="diagnostic-card__explanation">
          {friendly_explanation}
        </p>

        {/* Culprit code snippet */}
        {code_snippet && (
          <div className="diagnostic-card__snippet-wrapper">
            <div className="diagnostic-card__snippet-header">
              <span>{line_number ? `Line ${line_number}` : 'Problematic Line'}</span>
            </div>
            <pre className="diagnostic-card__snippet">
              <code>{code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Actionable Hint / Pro-tip box */}
        {hint && (
          <div className="diagnostic-card__hint">
            <span className="diagnostic-card__hint-icon" aria-hidden="true">💡</span>
            <div className="diagnostic-card__hint-content">
              <strong className="diagnostic-card__hint-label">How to fix:</strong>
              <span className="diagnostic-card__hint-text">{hint}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
