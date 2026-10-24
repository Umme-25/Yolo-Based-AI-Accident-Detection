import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

export default function DashboardHeader({ isDemo }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className="d-header">
      <div className="d-header-copy">
        <h1>Accident Detection Dashboard</h1>
        <p>YOLO-Based Real-Time Vehicle Accident Detection System</p>
      </div>
      <div className="d-header-actions" ref={wrapRef}>
        <span className="d-status-pill"><span className="d-dot" /> {isDemo ? 'DEMO MODE' : 'LIVE'}</span>
        <button type="button" className="d-icon-btn" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <Bell size={19} />
        </button>
        {open && (
          <div className="d-popover" role="status">
            <strong>No notifications</strong>
            <p>Incident alerts will appear here once AI detection is connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
