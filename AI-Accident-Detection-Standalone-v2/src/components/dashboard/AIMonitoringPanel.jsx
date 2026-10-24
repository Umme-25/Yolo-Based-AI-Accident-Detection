import Panel from './Panel.jsx';
import { MODULE_STATUS_LABEL } from './statusMeta.js';

export default function AIMonitoringPanel({ ai, camera }) {
  const items = [
    { label: 'Detection Model', value: `${ai.model.name} (${MODULE_STATUS_LABEL[ai.model.status]})` },
    { label: 'Tracking', value: `${ai.tracking.name} (${MODULE_STATUS_LABEL[ai.tracking.status]})` },
    { label: 'Camera', value: camera.source },
  ];
  return (
    <Panel
      title="AI Monitoring System"
      subtitle="YOLO-based real-time vehicle monitoring"
      aside={<span className="d-running tone-safe"><span className="d-dot" /> Frontend Running</span>}
    >
      <div className="d-ai-grid">
        {items.map(({ label, value }) => (
          <div className="d-ai-item" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
    </Panel>
  );
}
