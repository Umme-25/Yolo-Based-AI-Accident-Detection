import { Hourglass, ListChecks, OctagonAlert, TriangleAlert } from 'lucide-react';
import { pad2 } from '../dashboard/statusMeta.js';

function Stat({ label, value, detail, Icon, iconClass }) {
  return (
    <article className="d-summary">
      <div className="d-summary-top"><span>{label}</span><Icon size={19} className={iconClass} /></div>
      <strong className="d-summary-value">{pad2(value)}</strong>
      <small>{detail}</small>
    </article>
  );
}

// `stats` comes from computeIncidentStats(): every number is derived from the incident data.
export default function IncidentStats({ stats }) {
  return (
    <div className="d-summary-grid">
      <Stat label="Total Incidents" value={stats.total} detail={`${stats.unresolved} unresolved · ${stats.resolved} resolved`} Icon={ListChecks} iconClass="ic-cyan" />
      <Stat label="Critical" value={stats.critical} detail={`${stats.criticalOpen} unresolved`} Icon={OctagonAlert} iconClass="ic-red" />
      <Stat label="High" value={stats.high} detail={`${stats.highOpen} unresolved`} Icon={TriangleAlert} iconClass="ic-orange" />
      <Stat label="Pending Review" value={stats.pendingReview} detail="Awaiting first review" Icon={Hourglass} iconClass="ic-violet" />
    </div>
  );
}
