import { Activity, TriangleAlert, Car, Video } from 'lucide-react';
import { formatPercent, pad2, totalVehicles } from './statusMeta.js';

function SummaryCard({ label, value, detail, Icon, iconClass, valueClass = '' }) {
  return (
    <article className="d-summary">
      <div className="d-summary-top"><span>{label}</span><Icon size={19} className={iconClass} /></div>
      <strong className={`d-summary-value ${valueClass}`}>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

// cameraState: 'idle' | 'starting' | 'live' (from useCameraStream)
export default function SummaryCards({ data, cameraState, isDemo }) {
  const sample = isDemo ? 'Sample ' : '';
  const cam = {
    live: { value: 'Active', detail: 'Browser preview running', cls: 'text-safe' },
    starting: { value: 'Starting', detail: 'Waiting for camera permission', cls: '' },
    idle: { value: 'Offline', detail: 'Camera not started', cls: '' },
  }[cameraState];

  return (
    <div className="d-summary-grid">
      <SummaryCard label="Camera Status" value={cam.value} detail={cam.detail} Icon={Video} iconClass="ic-cyan" valueClass={cam.cls} />
      <SummaryCard label="Vehicles Detected" value={pad2(totalVehicles(data.detection.vehicles))} detail={`${sample}vehicle count`} Icon={Car} iconClass="ic-cyan" />
      <SummaryCard label="Accidents Today" value={pad2(data.accident.accidentsToday)} detail={data.accident.accidentsToday === 0 ? 'No confirmed incidents' : 'Confirmed incidents'} Icon={TriangleAlert} iconClass="ic-amber" />
      <SummaryCard label="AI Confidence" value={formatPercent(data.detection.confidence)} detail={`${sample}confidence value`} Icon={Activity} iconClass="ic-violet" />
    </div>
  );
}
