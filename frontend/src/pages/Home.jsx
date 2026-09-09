/**
 * Home.jsx — Modern Developer Landing & Showcase Page
 *
 * Professional landing experience for CodeMentor AI featuring:
 * - Dynamic hero with interactive syntax-highlighted terminal demo
 * - Live backend connectivity health probe
 * - 4-Mode deep dive section (Free Play, Task Evaluation, Custom Question, Debug Challenge)
 * - 12 Feature cards with mode-themed accent lighting
 */

import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import './Home.css';

const FEATURE_CARDS = [
  {
    id: 'editor',
    mode: 'free',
    icon: '💻',
    title: 'Monaco Python IDE',
    description: 'Full-featured VS Code editor in your browser with syntax highlighting, soft tabs, bracket matching, and line numbers.',
    phase: 'Phase A2',
    href: '/editor?mode=editor',
  },
  {
    id: 'runner',
    mode: 'free',
    icon: '⚡',
    title: 'Sandboxed Code Runner',
    description: 'Executes Python source code safely in isolated environments with stdout/stderr capture, stdin support, and 5s timeout.',
    phase: 'Phase A3',
    href: '/editor?mode=editor',
  },
  {
    id: 'diagnostics',
    mode: 'error',
    icon: '🔍',
    title: 'Deterministic Diagnostics',
    description: 'Instant pinpoint detection for syntax, indentation, and runtime exceptions with exact line numbers and beginner fixes.',
    phase: 'Phase A4',
    href: '/editor?mode=editor',
  },
  {
    id: 'evaluator',
    mode: 'task',
    icon: '🎯',
    title: 'Task Evaluation Engine',
    description: 'Automated test suite grading across visible and hidden test cases with diff analysis and multi-mode comparison.',
    phase: 'Phase A5',
    href: '/editor?mode=task',
  },
  {
    id: 'hints',
    mode: 'task',
    icon: '💡',
    title: 'Progressive 3-Tier Hints',
    description: 'Sequential scaffolding (Level 1: Nudge → Level 2: Strategy → Level 3: Structural Clue) that guides without spoiling answers.',
    phase: 'Phase A6',
    href: '/editor?mode=task',
  },
  {
    id: 'ai-tutor',
    mode: 'ai',
    icon: '🤖',
    title: 'Socratic AI Tutor',
    description: 'Conversational assistant using reflective questions and conceptual cues to develop student problem-solving intuition.',
    phase: 'Phase A7',
    href: '/editor?mode=editor',
  },
  {
    id: 'ai-config',
    mode: 'ai',
    icon: '⚙️',
    title: 'AI Connection Hub',
    description: 'Zero-cost offline mock, local Ollama, or cloud OpenAI models with live latency probes and masked credentials.',
    phase: 'Phase A8',
    href: '/editor',
  },
  {
    id: 'error-explain',
    mode: 'error',
    icon: '✨',
    title: 'AI Error Deconstructions',
    description: 'On-demand deep-dive explanations translating cryptic Python tracebacks into intuitive, plain-English mental models.',
    phase: 'Phase A9',
    href: '/editor?mode=editor',
  },
  {
    id: 'custom-questions',
    mode: 'custom',
    icon: '✏️',
    title: 'Custom Question Authoring',
    description: 'Design custom challenges with starter templates, custom test cases, float tolerances, and automated grading.',
    phase: 'Phase A10',
    href: '/editor?mode=custom',
  },
  {
    id: 'help-counter',
    mode: 'free',
    icon: '📊',
    title: 'Assistance Counter',
    description: 'Real-time session monitoring of hints and AI queries with zero score penalties or punitive deductions.',
    phase: 'Phase A11',
    href: '/editor',
  },
  {
    id: 'progress-scores',
    mode: 'custom',
    icon: '📈',
    title: 'Progress & Score Engine',
    description: 'Cumulative completion rate tracking, best scores, evaluation attempt counts, and session metrics.',
    phase: 'Phase A12',
    href: '/editor',
  },
  {
    id: 'debug-mode',
    mode: 'debug',
    icon: '🐛',
    title: 'Debug Challenge Lab',
    description: 'Curated library of realistic buggy Python code across syntax, type errors, and logic traps to diagnose and repair.',
    phase: 'Phase A13',
    href: '/editor?mode=debug',
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
          setBackendMessage('Backend unreachable. Ensure Flask dev server is running on port 5000.');
        }
      }
    }

    pingBackend();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="home-view" id="main-content">
      {/* ─── Hero Section ─── */}
      <section className="hero-section">
        <div className="container hero-grid">
          {/* Left Column: Copy & CTAs */}
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span>Phase A1–A14 Live • Interactive Python Mentorship</span>
            </div>

            <h1 className="hero-headline">
              Master Python with an AI mentor that helps you{' '}
              <span className="hero-headline--gradient">think</span>, not cheat.
            </h1>

            <p className="hero-lead">
              CodeMentor AI pairs a production Monaco editor with deterministic diagnostics,
              progressive multi-tiered hints, Socratic tutoring, and 4 dedicated practice modes.
              Build real understanding, one reasoning step at a time.
            </p>

            <div className="hero-cta-group">
              <a href="/editor" className="btn btn--accent hero-btn-main">
                <span>Launch Workspace</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="#modes" className="btn btn--ghost hero-btn-sub">
                <span>Explore Modes</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="hero-status-pill">
              <StatusBadge status={backendStatus} message={backendMessage} />
            </div>

            {/* Quick Metrics Ticker */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <span className="hero-stat-val">4</span>
                <span className="hero-stat-lbl">Workspace Modes</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <span className="hero-stat-val">3</span>
                <span className="hero-stat-lbl">Hint Tiers</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <span className="hero-stat-val">11</span>
                <span className="hero-stat-lbl">Core Subsystems</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <span className="hero-stat-val">0</span>
                <span className="hero-stat-lbl">Score Penalties</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Terminal Card */}
          <div className="hero-visual" aria-hidden="true">
            <div className="demo-terminal-card">
              <div className="demo-terminal-header">
                <div className="demo-win-dots">
                  <span className="dot-red" />
                  <span className="dot-yellow" />
                  <span className="dot-green" />
                </div>
                <div className="demo-file-tab">
                  <span className="demo-py-icon">🐍</span>
                  <span>sum_two_numbers.py</span>
                </div>
                <span className="demo-badge">Python 3.14</span>
              </div>

              <div className="demo-code-area">
                <div className="demo-line"><span className="tok-com"># Task: Return the sum of two integers</span></div>
                <div className="demo-line"><span className="tok-kw">def</span> <span className="tok-fn">sum_two_numbers</span>(a: <span className="tok-type">int</span>, b: <span className="tok-type">int</span>) -&gt; <span className="tok-type">int</span>:</div>
                <div className="demo-line">&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-kw">return</span> a + b<span className="demo-cursor" /></div>
                <div className="demo-line">&nbsp;</div>
                <div className="demo-line"><span className="tok-com"># Test execution</span></div>
                <div className="demo-line">print(<span className="tok-fn">sum_two_numbers</span>(<span className="tok-num">4</span>, <span className="tok-num">5</span>))</div>
              </div>

              <div className="demo-terminal-output">
                <div className="demo-out-prompt">
                  <span className="prompt-arrow">$</span> python -m test_evaluator.py
                </div>
                <div className="demo-out-result">
                  <span className="demo-out-stdout">Output: 9</span>
                  <span className="demo-out-pass">✓ 3 / 3 test cases passed (18.4 ms)</span>
                </div>
                <div className="demo-out-footer">
                  <span className="demo-score-pill">Score: 100%</span>
                  <span className="demo-help-note">Assists Used: 0 • Zero Penalty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Practice Modes Section ─── */}
      <section className="modes-section" id="modes">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Workspaces</span>
            <h2 className="section-title">Four Specialized Ways to Learn</h2>
            <p className="section-subtitle">
              Designed around deliberate practice — whether you want an open scratchpad, structured algorithmic challenges,
              student-authored problem solving, or realistic debugging labs.
            </p>
          </div>

          <div className="modes-grid">
            <div className="mode-card mode-card--free">
              <div className="mode-card__top">
                <span className="mode-card__tag">Mode 01</span>
                <span className="mode-card__badge mode-card__badge--free">Mint Accent</span>
              </div>
              <h3 className="mode-card__title">💻 Free Play Mode</h3>
              <p className="mode-card__desc">
                An unconstrained scratchpad. Write and run any Python script with instant stdout/stderr rendering,
                deterministic diagnostic explanations, and on-demand AI error deep dives.
              </p>
              <a href="/editor?mode=editor" className="mode-card__cta">Launch Free Play →</a>
            </div>

            <div className="mode-card mode-card--task">
              <div className="mode-card__top">
                <span className="mode-card__tag">Mode 02</span>
                <span className="mode-card__badge mode-card__badge--task">Amber Accent</span>
              </div>
              <h3 className="mode-card__title">📋 Task Evaluation</h3>
              <p className="mode-card__desc">
                Curated challenges with requirements, visible test cases, and hidden validation tests.
                Evaluates code against multiple inputs with diff outputs and progressive hints.
              </p>
              <a href="/editor?mode=task" className="mode-card__cta">Start Practice Challenges →</a>
            </div>

            <div className="mode-card mode-card--custom">
              <div className="mode-card__top">
                <span className="mode-card__tag">Mode 03</span>
                <span className="mode-card__badge mode-card__badge--custom">Blue Accent</span>
              </div>
              <h3 className="mode-card__title">✏️ Custom Questions</h3>
              <p className="mode-card__desc">
                Create and solve your own problems. Define problem statements, starter templates, and test cases with
                flexible matching rules (Trimmed, Exact, Case-insensitive, Float tolerance).
              </p>
              <a href="/editor?mode=custom" className="mode-card__cta">Author Questions →</a>
            </div>

            <div className="mode-card mode-card--debug">
              <div className="mode-card__top">
                <span className="mode-card__tag">Mode 04</span>
                <span className="mode-card__badge mode-card__badge--debug">Violet Accent</span>
              </div>
              <h3 className="mode-card__title">🐛 Debug Mode</h3>
              <p className="mode-card__desc">
                Real bugs planted in broken code. Identify syntax bugs, type errors, and logic traps using
                diagnostics, test case diffs, and tiered hints. Verify fixes against automated suites.
              </p>
              <a href="/editor?mode=debug" className="mode-card__cta">Enter Debug Lab →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Features Grid ─── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Complete Architecture</span>
            <h2 className="section-title">Everything Built for Deep Understanding</h2>
            <p className="section-subtitle">
              All 14 phases of Part A integrated into one cohesive, high-performance developer workspace.
            </p>
          </div>

          <div className="features-grid">
            {FEATURE_CARDS.map((feat) => (
              <article key={feat.id} className={`feature-item feature-item--${feat.mode}`}>
                <div className="feature-item__header">
                  <span className="feature-item__icon" aria-hidden="true">{feat.icon}</span>
                  <span className="feature-item__phase">{feat.phase}</span>
                </div>
                <h3 className="feature-item__title">{feat.title}</h3>
                <p className="feature-item__desc">{feat.description}</p>
                <a href={feat.href} className="feature-item__link">
                  <span>Explore Feature</span>
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="home-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <div className="footer-brand">
              <span className="brand-mark brand-mark--small">C</span>
              <span className="footer-brand-text">CodeMentor AI</span>
            </div>
            <p className="footer-copy">
              Deliberate Python learning with pedagogical AI guidance. Phase A1–A14 Core Engine.
            </p>
          </div>
          <div className="footer-right">
            <a href="/editor" className="btn btn--accent btn-sm">Open Workspace →</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
