import { CheckCircle2 } from 'lucide-react';
import { SEVERITY_META } from '../dashboard/statusMeta.js';
import { SEVERITY_LABEL, STATUS_LABEL } from '../../utils/incidentUtils.js';

// Severity colours come from the shared tones: Low green, Medium yellow, High orange, Critical red.
export function SeverityBadge({ severity }) {
  const tone = SEVERITY_META[severity]?.tone ?? 'warn';
  return <span className={`inc-sev tone-${tone}`}>{SEVERITY_LABEL[severity] ?? severity}</span>;
}

export function StatusBadge({ status }) {
  return (
    <span className={`inc-status inc-status--${status}`}>
      {status === 'resolved' ? <CheckCircle2 size={12} aria-hidden="true" /> : <span className="inc-status-dot" aria-hidden="true" />}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function DemoTag({ children = 'DEMO DATA' }) {
  return <span className="inc-demo-tag">{children}</span>;
}
