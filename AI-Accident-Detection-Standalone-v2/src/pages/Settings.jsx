import { useState } from 'react';
import { Bell, Camera, Check, Monitor, RotateCcw, ShieldCheck, SlidersHorizontal } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({ desktopAlerts: true, soundAlerts: false, compactMode: false, autoPreview: true });
  const [saved, setSaved] = useState(false);
  const toggle = key => { setSettings(old => ({ ...old, [key]: !old[key] })); setSaved(false); };
  const reset = () => { setSettings({ desktopAlerts: true, soundAlerts: false, compactMode: false, autoPreview: true }); setSaved(false); };
  const rows = [
    { key: 'desktopAlerts', title: 'Desktop notifications', text: 'UI preference for future incident notifications.', icon: Bell },
    { key: 'soundAlerts', title: 'Sound alerts', text: 'UI preference for audible alert cues.', icon: ShieldCheck },
    { key: 'autoPreview', title: 'Camera preview on open', text: 'Allow camera preview controls to be available in the traffic workspace.', icon: Camera },
    { key: 'compactMode', title: 'Compact dashboard layout', text: 'Reduce spacing in dashboard panels when implemented.', icon: Monitor },
  ];
  return (
    <section className="page-wrap app-page settings-page">
      <div className="page-heading"><div><span className="eyebrow">APPLICATION PREFERENCES</span><h1>Settings</h1><p>Adjust local interface preferences for the frontend demo.</p></div><span className="settings-mark"><SlidersHorizontal size={19} /></span></div>
      <div className="demo-notice"><span className="notice-icon"><ShieldCheck size={18} /></span><div><strong>Local preferences only</strong><p>These settings affect this page's demo state only. Persistent accounts, permissions, and alert delivery will require backend integration.</p></div><span className="demo-pill">UI SETTINGS</span></div>
      <section className="panel settings-panel"><div className="panel-heading"><div><h2>Interface preferences</h2><p>Toggle options to preview the settings workflow.</p></div></div>
        <div className="settings-list">{rows.map(({ key, title, text, icon: Icon }) => <div className="setting-row" key={key}><span className="setting-icon"><Icon size={18} /></span><div className="setting-copy"><strong>{title}</strong><p>{text}</p></div><button type="button" role="switch" aria-checked={settings[key]} className={`switch ${settings[key] ? 'on' : ''}`} onClick={() => toggle(key)} aria-label={title}><span /></button></div>)}</div>
        <div className="settings-actions"><button className="button button-secondary" type="button" onClick={reset}><RotateCcw size={15} /> Reset defaults</button><button className="button button-primary" type="button" onClick={() => setSaved(true)}><Check size={16} /> Save preferences</button></div>
        {saved && <div className="success-message settings-saved" role="status"><Check size={16} /> Preferences updated for this session.</div>}
      </section>
    </section>
  );
}