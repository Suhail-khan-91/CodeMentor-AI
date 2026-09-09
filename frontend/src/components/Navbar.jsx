/**
 * Navbar.jsx — Global & Workspace Navigation Bar
 *
 * Provides responsive, context-aware navigation:
 * - On Landing (/): Product links, Progress modal trigger, AI Settings modal trigger, and Open Workspace CTA.
 * - On Editor (/editor): Breadcrumb navigation with mode indicator, session Help pill, Progress, and Settings.
 */

import { useState, useEffect } from 'react';
import AISettingsModal from './AISettingsModal';
import ProgressModal from './ProgressModal';
import './Navbar.css';

export default function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [helpCount, setHelpCount] = useState(0);

  // Sync route
  useEffect(() => {
    const handleLocation = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocation);
    // Also listen to internal pushState navigation
    const origPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const res = origPushState.apply(this, args);
      handleLocation();
      return res;
    };
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.history.pushState = origPushState;
    };
  }, []);

  // Listen to help counter updates for badge
  useEffect(() => {
    const fetchHelp = () => {
      import('../services/api').then(({ getHelpSummary }) => {
        getHelpSummary()
          .then((res) => {
            if (res?.summary?.total_assists !== undefined) {
              setHelpCount(res.summary.total_assists);
            }
          })
          .catch(() => {});
      });
    };

    fetchHelp();
    window.addEventListener('help-counter-updated', fetchHelp);
    return () => window.removeEventListener('help-counter-updated', fetchHelp);
  }, []);

  const isEditor = currentPath.startsWith('/editor');

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        {/* Left Section: Brand & Breadcrumbs */}
        <div className="navbar__left">
          <a href="/" className="navbar__brand" aria-label="CodeMentor AI Home">
            <div className="brand-mark" aria-hidden="true">
              <span>C</span>
            </div>
            <span className="brand-name">
              CodeMentor <span className="brand-ai">AI</span>
            </span>
          </a>

          {isEditor ? (
            <div className="ws-crumb" aria-label="Breadcrumb">
              <span className="ws-crumb__slash">/</span>
              <span className="ws-crumb__section">Workspace</span>
            </div>
          ) : (
            <nav className="navbar__nav-links" aria-label="Main Navigation">
              <a href="#features" className="navbar__nav-link">Features</a>
              <a href="#architecture" className="navbar__nav-link">How it Works</a>
              <a href="/editor" className="navbar__nav-link">IDE Workspace</a>
            </nav>
          )}
        </div>

        {/* Right Section: Actions, Modals & Triggers */}
        <div className="navbar__right">
          {isEditor && (
            <div
              className={`help-pill-trigger ${helpCount > 0 ? 'help-pill-trigger--active' : ''}`}
              onClick={() => {
                // Focus or trigger help widget in toolbar
                const btn = document.getElementById('btn-help-usage-widget');
                if (btn) btn.click();
              }}
              title="Session Assistance Usage"
              role="button"
              tabIndex={0}
            >
              <span className="help-pill__dot" aria-hidden="true" />
              <span className="help-pill__label">Assists:</span>
              <span className="help-pill__count">{helpCount}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn--ghost navbar__action-btn"
            onClick={() => setIsProgressOpen(true)}
            id="btn-open-progress"
            title="View learning journey and score metrics"
          >
            <span className="nav-icon" aria-hidden="true">📊</span>
            <span>Progress</span>
          </button>

          <button
            type="button"
            className="btn btn--ghost navbar__action-btn"
            onClick={() => setIsSettingsOpen(true)}
            id="btn-open-ai-settings"
            title="Configure AI Provider & Settings"
          >
            <span className="nav-icon" aria-hidden="true">⚙️</span>
            <span>AI Settings</span>
          </button>

          {!isEditor ? (
            <a href="/editor" className="btn btn--accent navbar__cta-btn">
              <span>Open Workspace</span>
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <span className="navbar__phase-badge" title="Platform Build Phase">
              Phase A14
            </span>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Progress & Scores Modal */}
      <ProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
      />
    </header>
  );
}
