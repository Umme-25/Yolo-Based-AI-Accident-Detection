import { MapPin, TriangleAlert, Video, VideoOff } from 'lucide-react';
import { pad2 } from '../dashboard/statusMeta.js';

function Stat({ label, value, detail, Icon, iconClass }) {
  return (
    <article className="d-summary">
      <div className="d-summary-top"><span>{label}</span><Icon size={19} className={iconClass} /></div>
      <strong className="d-summary-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function LocationStats({ stats }) {
  return (
    <div className="d-summary-grid">
      <Stat label="Configured Locations" value={pad2(stats.total)} detail="Monitoring sites" Icon={MapPin} iconClass="ic-cyan" />
      <Stat label="Online Cameras" value={pad2(stats.online)} detail="Marked online (manual status)" Icon={Video} iconClass="ic-green" />
      <Stat label="Offline Cameras" value={pad2(stats.offline)} detail="Marked offline (manual status)" Icon={VideoOff} iconClass="ic-muted" />
      <Stat label="Active Incidents (Demo)" value={pad2(stats.withActiveIncidents)} detail="Locations with an unresolved demo incident" Icon={TriangleAlert} iconClass="ic-amber" />
    </div>
  );
}
