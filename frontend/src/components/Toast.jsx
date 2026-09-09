/**
 * Toast.jsx — Toast Notification System
 *
 * Provides transient, non-blocking toast notifications.
 * Can be triggered via window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
 * or using export function showToast(message, type).
 */

import { useState, useEffect } from 'react';
import './Toast.css';

export function showToast(message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent('show-toast', {
      detail: { id: Date.now() + Math.random(), message, type }
    })
  );
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { id, message, type = 'info' } = e.detail;
      const newToast = { id: id || Date.now(), message, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 2800);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-item--${t.type}`} role="status">
          <span className="toast-icon" aria-hidden="true">{getIcon(t.type)}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
