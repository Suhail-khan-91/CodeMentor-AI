/**
 * Home.jsx — Dashboard/Home page
 *
 * The landing page of CodeMentor AI.
 * Shows:
 *  - Platform branding / welcome message
 *  - Live backend connection status (calls /api/health)
 *  - Feature cards (editor card is now live in Phase A2)
 *
 * Phase A2: Code Editor is now accessible via /editor.
 */

import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import './Home.css';

// Feature cards shown on the dashboard.
// Each card represents a future phase so students can see what's coming.
const FEATURE_CARDS = [
  {
    id: 'editor',
    icon: '📝',
    title: 'Code Editor',
    description: 'Write Python directly in the browser with syntax highlighting and intelligent assistance.',
    phase: 'Phase A2',
    href: '/editor',
    live: true,
  },
  {
    id: 'runner',
    icon: '▶️',
    title: 'Code Runner',
    description: 'Execute your Python code safely and see output or errors instantly.',
    phase: 'Phase A3',
    href: '/editor',
    live: true,
  },
  {
    id: 'diagnostics',
    icon: '🔍',
    title: 'Diagnostics',
    description: 'Understand Python errors in plain English, not cryptic tracebacks.',
    phase: 'Phase A4',
    href: '/editor',
    live: true,
  },
  {
    id: 'evaluator',
    icon: '🎯',
    title: 'Task Evaluator',
    description: 'Solve programming challenges and evaluate solutions against multiple test cases.',
    phase: 'Phase A5',
    href: '/editor',
    live: true,
  },
  {
    id: 'hint-system',
    icon: '💡',
    title: 'Progressive Hints',
    description: '3-tier deterministic guidance (Nudge → Strategy → Structure) without spoiling solutions.',
    phase: 'Phase A6',
    href: '/editor',
    live: true,
  },
  {
    id: 'ai-tutor',
    icon: '🤖',
    title: 'AI Tutor',
    description: 'Get contextual Socratic hints and guidance without being handed the complete answer.',
    phase: 'Phase A7',
    href: '/editor',
    live: true,
  },
  {
    id: 'custom-mode',
    icon: '✏️',
    title: 'Custom Question Mode',
    description: 'Write your own questions and practice solving them with full platform support.',
    phase: 'Phase A10',
  },
  {
    id: 'progress',
    icon: '📊',
    title: 'Progress & Scores',
    description: 'Track your learning journey, scores, and AI help usage over time.',
    phase: 'Phase A12',
  },
];

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('loading');
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function pingBackend() {
      try {
        await checkHealth();
        if (!cancelled) setBackendStatus('connected');
      } catch (err) {
        if (!cancelled) {
          setBackendStatus('error');
          setBackendMessage('Cannot reach server — is Flask running on port 5000?');
        }
      }
    }

    pingBackend();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="home" id="main-content">
      {/* Hero */}
      <section className="home__hero container" aria-labelledby="hero-heading">
        <div className="home__hero-text">
          <h1 id="hero-heading" className="home__title">
            Learn Python the{' '}
            <span className="home__title--gradient">right way</span>
          </h1>
          <p className="home__subtitle">
            CodeMentor AI helps you understand errors, receive hints, and
            progressively solve programming problems — with AI assistance when
            you need it most.
          </p>

          <div className="home__status-row">
            <StatusBadge status={backendStatus} message={backendMessage} />
          </div>
        </div>

        <div className="home__hero-decoration" aria-hidden="true">
          <div className="home__code-preview">
            <div className="home__code-preview-bar">
              <span /><span /><span />
            </div>
            <pre className="home__code-preview-content"><code>{`# Your Python journey starts here
def greet(name):
    return f"Hello, {name}!"

print(greet("CodeMentor AI"))`}</code></pre>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="home__features container" aria-labelledby="features-heading">
        <h2 id="features-heading" className="home__section-title">
          Platform Features
          <span className="home__section-subtitle">
            Phase A7 ✅ live &mdash; A8–A14 coming soon
          </span>
        </h2>

        <div className="home__cards" role="list">
          {FEATURE_CARDS.map((card) => (
            <article
              key={card.id}
              id={`feature-${card.id}`}
              className={`feature-card${card.live ? ' feature-card--live' : ''}`}
              role="listitem"
            >
              <span className="feature-card__icon" aria-hidden="true">{card.icon}</span>
              <h3 className="feature-card__title">{card.title}</h3>
              <p className="feature-card__desc">{card.description}</p>
              <div className="feature-card__footer">
                <span className="feature-card__phase">{card.phase}</span>
                {card.live && card.href && (
                  <a href={card.href} className="feature-card__link">Try it →</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
