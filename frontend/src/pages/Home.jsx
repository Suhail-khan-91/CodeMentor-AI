/**
 * Home.jsx — Clean Developer Landing & Showcase Page
 *
 * Single-screen landing experience for CodeMentor AI featuring:
 * - Dynamic hero with interactive syntax-highlighted terminal demo (sum_two_numbers.py)
 * - Live backend connectivity health probe
 * - Direct access to Python Course and Custom Practice
 */

import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import './Home.css';

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
              <span>AI-Powered Python Mentorship • Interactive Learning</span>
            </div>

            <h1 className="hero-headline">
              Master Python with an AI mentor that helps you{' '}
              <span className="hero-headline--gradient">think</span>, not cheat.
            </h1>

            <p className="hero-lead">
              CodeMentor AI pairs a production Monaco editor with deterministic diagnostics,
              progressive multi-tiered hints, Socratic tutoring, and structured Python challenges.
              Build real understanding, one reasoning step at a time.
            </p>

            <div className="hero-cta-group">
              <a href="/courses" className="btn btn--accent hero-btn-main" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <span>🐍 Start Python Course</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/editor?mode=custom" className="btn btn--ghost hero-btn-sub">
                <span>✏️ Custom Practice</span>
              </a>
            </div>

            <div className="hero-status-pill">
              <StatusBadge status={backendStatus} message={backendMessage} />
            </div>
          </div>

          {/* Right Column: Interactive Code Terminal Card (Unchanged) */}
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
    </main>
  );
}

