import { Link, useLocation } from 'wouter';
import { Clock, LayoutDashboard, MapPin, Settings as SettingsIcon, ShieldCheck, TriangleAlert, Video } from 'lucide-react';

// Routes: Live Monitoring -> /traffic-analysis, Incidents -> /reports (kept from the original app),
// History -> /history, Locations -> /locations. Detail pages use /reports/:id, /history/:id, /locations/:id.
const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/traffic-analysis', label: 'Live Monitoring', icon: Video },
  { href: '/reports', label: 'Incidents', icon: TriangleAlert },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onNavigate }) {
  const [path] = useLocation();
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} id="app-sidebar">
      <Link href="/" className="sb-brand" onClick={onNavigate} aria-label="YOLO Accident AI home">
        <span className="sb-logo"><ShieldCheck size={24} /></span>
        <span><strong>YOLO Accident AI</strong><small>Detection System</small></span>
      </Link>
      <nav className="sb-nav" aria-label="Main navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} onClick={onNavigate} className={`sb-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sb-status">
        <strong><span className="d-dot" /> Frontend Online</strong>
        <small>Dashboard interface is running</small>
      </div>
    </aside>
  );
}
