import Panel from './Panel.jsx';
import { ACCIDENT_STATUS_META, SEVERITY_META, formatPercent } from './statusMeta.js';

export default function AccidentStatusPanel({ accident, confidence, isDemo }) {
  const meta = ACCIDENT_STATUS_META[accident.status];
  const assessed = accident.status !== 'none';
  const severity = SEVERITY_META[accident.severity];

  return (
    <Panel title="Accident Status" className="d-status-panel">
      <div className={`d-hero tone-${meta.tone}`}>
        <meta.Icon size={46} strokeWidth={1.7} />
        <strong>{meta.label}</strong>
        <small>{isDemo ? 'Demo status — AI confirmation pending' : meta.note}</small>
      </div>
      <dl className="d-rows">
        <div><dt>Detection</dt><dd className={`tone-${meta.tone}`}>{isDemo ? `Demo / ${meta.detection}` : meta.detection}</dd></div>
        <div><dt>Confidence</dt><dd>{formatPercent(confidence)}{isDemo ? ' (Demo)' : ''}</dd></div>
        <div><dt>Severity</dt><dd className={assessed ? `tone-${severity.tone}` : 'muted'}>{assessed ? severity.label : 'Not assessed'}</dd></div>
      </dl>
    </Panel>
  );
}
