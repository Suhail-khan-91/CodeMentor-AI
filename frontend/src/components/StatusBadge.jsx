/**
 * StatusBadge.jsx
 *
 * Displays the current backend connection status.
 * Used on the dashboard so the developer/student can immediately see
 * whether the Flask backend is reachable.
 *
 * Props:
 *   status — 'loading' | 'connected' | 'error'
 *   message — optional descriptive text
 */

import './StatusBadge.css';

export default function StatusBadge({ status, message }) {
  const labels = {
    loading:   'Connecting…',
    connected: 'Connected',
    error:     'Unreachable',
  };

  return (
    <div className={`status-badge status-badge--${status}`} role="status" aria-live="polite">
      <span className="status-badge__dot" aria-hidden="true" />
      <span className="status-badge__label">
        Backend Status: <strong>{labels[status] ?? status}</strong>
      </span>
      {message && (
        <span className="status-badge__message">{message}</span>
      )}
    </div>
  );
}
