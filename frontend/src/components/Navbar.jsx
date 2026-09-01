/**
 * Navbar.jsx
 *
 * Top navigation bar for CodeMentor AI.
 * Phase A2: Editor link added.
 * Future phases will add active-route highlighting and more links.
 */

import './Navbar.css';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Editor', href: '/editor' },
  // Future phases will add: Progress, Settings, etc.
];

export default function Navbar() {
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

        {/* Phase indicator pill */}
        <span className="navbar__phase-badge" title="Current development phase">
          Phase A3
        </span>
      </div>
    </header>
  );
}
