/**
 * App.jsx — Application root
 *
 * Assembles the page layout: Navbar + current page.
 *
 * Phase A1: single page (Home).
 * Future phases will introduce a router (React Router) and
 * additional pages (Editor, Progress, Settings, etc.) here.
 */

import Navbar from './components/Navbar';
import Home from './pages/Home';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Home />
    </div>
  );
}
