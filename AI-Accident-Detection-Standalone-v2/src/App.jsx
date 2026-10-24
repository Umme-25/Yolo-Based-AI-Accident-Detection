import { Route, Router, Switch } from 'wouter';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/layout/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TrafficAnalysis from './pages/TrafficAnalysis.jsx';
import Incidents from './pages/Incidents.jsx';
import Settings from './pages/Settings.jsx';
import Locations from './pages/Locations.jsx';
import History from './pages/History.jsx';

function AppLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onNavigate={closeNav} />
      {navOpen && <div className="sb-backdrop" onClick={closeNav} aria-hidden="true" />}
      <div className="app-body">
        <div className="mobile-bar">
          <span className="mobile-bar-title">YOLO Accident AI</span>
          <button className="mobile-menu-button" type="button" onClick={() => setNavOpen((v) => !v)} aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen} aria-controls="app-sidebar">
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <main className="main-content">{children}</main>
        <footer className="app-footer">
          <span>YOLO-Based Real-Time Vehicle Accident Detection System · Frontend Demo</span>
          <span>No live AI detection or emergency dispatch is active</span>
        </footer>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <section className="page-wrap">
      <div className="empty-page">
        <span className="eyebrow">404 · Not found</span>
        <h1>This page isn't available.</h1>
        <p>Use the main navigation to return to the application.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/traffic-analysis" component={TrafficAnalysis} />
          <Route path="/reports/:id?" component={Incidents} />
          <Route path="/settings" component={Settings} />
          <Route path="/history/:id?" component={History} />
          <Route path="/locations/:id?" component={Locations} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </Router>
  );
}