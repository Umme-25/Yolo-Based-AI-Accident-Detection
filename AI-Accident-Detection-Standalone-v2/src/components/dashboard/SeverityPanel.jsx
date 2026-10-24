import { Activity, ShieldAlert } from 'lucide-react';
import Panel, { SampleTag } from './Panel.jsx';
import { SEVERITY_META, pad2 } from './statusMeta.js';

export default function SeverityPanel({ accident, isDemo }) {
  const meta = SEVERITY_META[accident.severity];
  return (
    <Panel title="Accident Severity" subtitle="AI-based severity assessment" aside={isDemo ? <SampleTag /> : null}>
      <div className={`d-hero d-hero-sev tone-${meta.tone}`}>
        <span className="d-hero-disc"><meta.Icon size={30} /></span>
        <small className="d-hero-kicker">Current Severity</small>
        <strong>{meta.label}</strong>
        <small>{accident.status === 'none' ? 'No accident currently confirmed' : 'Based on the current assessment'}</small>
      </div>
      <dl className="d-rows d-rows-icons">
        <div><dt><Activity size={16} className="ic-cyan" /> AI Score</dt><dd>{pad2(accident.severityScore)} / 100</dd></div>
        <div><dt><ShieldAlert size={16} className="ic-amber" /> Risk Level</dt><dd className={`tone-${meta.tone}`}>{meta.risk}</dd></div>
      </dl>
    </Panel>
  );
}
