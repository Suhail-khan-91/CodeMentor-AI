/**
 * App.jsx — Application root
 *
 * Simple pathname-based routing using the browser's built-in
 * window.location. No router library needed at this scale.
 *
 * Route table:
 *   /          → Home (Dashboard)
 *   /editor    → EditorPage
 *
 * Phase A3+ will add more routes here as new pages are introduced.
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import Toast from './components/Toast';
import './App.css';

/** Derive which page to render from the current URL path. */
function getPage(pathname) {
  if (pathname.startsWith('/editor')) return 'editor';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState(() => getPage(window.location.pathname));

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onPopState = () => setPage(getPage(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Intercept <a> clicks on internal links so the page doesn't reload
  useEffect(() => {
    const onLinkClick = (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      e.preventDefault();
      window.history.pushState({}, '', href);
      setPage(getPage(href));
    };
    document.addEventListener('click', onLinkClick);
    return () => document.removeEventListener('click', onLinkClick);
  }, []);

  return (
    <div className="app">
      <Navbar />
      {page === 'editor' ? <EditorPage /> : <Home />}
      <Toast />
    </div>
  );
}
