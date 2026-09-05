/**
 * Navbar.jsx
 *
 * Top navigation bar for CodeMentor AI.
 * Phase A2: Editor link added.
 * Future phases will add active-route highlighting and more links.
 */

import { useState } from 'react';
import AISettingsModal from './AISettingsModal';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Editor', href: '/editor' },
];

export default function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner container">
        {/* Brand */}
        <a href="/" className="navbar__brand" aria-label="CodeMentor AI home">
          <span className="navbar__logo" aria-hidden="true">⌨️</span>
          <span className="navbar__name">
            CodeMentor <span className="navbar__name--highlight">AI</span>
          </span>
        </a>

        {/* Navigation links */}
        <nav className="navbar__links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions: Settings button & Phase badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setIsSettingsOpen(true)}
            id="btn-open-ai-settings"
            title="Configure AI Provider (Local Ollama / Cloud API / Mock)"
          >
            <span aria-hidden="true">⚙️</span> AI Settings
          </button>

          {/* Phase indicator pill */}
          <span className="navbar__phase-badge" title="Current development phase">
            Phase A8
          </span>
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}
