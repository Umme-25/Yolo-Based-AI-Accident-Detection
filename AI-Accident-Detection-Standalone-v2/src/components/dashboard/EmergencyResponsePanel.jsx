import { Ambulance, Flame, TrafficCone } from 'lucide-react';
import Panel, { SampleTag } from './Panel.jsx';
import { RESPONSE_STATE_META } from './statusMeta.js';

export default function EmergencyResponsePanel({ response, isDemo }) {
  const items = [
    { key: 'medical', title: 'Medical Response', Icon: Ambulance, state: response.medical, text: { standby: 'No medical response required', normal: 'No medical response required', recommended: 'Medical assistance may be needed' } },
    { key: 'fireRescue', title: 'Fire & Rescue', Icon: Flame, state: response.fireRescue, text: { standby: 'No fire emergency detected', normal: 'No fire emergency detected', recommended: 'Fire or rescue support may be needed' } },
    { key: 'traffic', title: 'Traffic Control', Icon: TrafficCone, state: response.traffic, text: { standby: 'Traffic flow is normal', normal: 'Traffic flow is normal', recommended: 'Traffic management may be needed' } },
  ];
  return (
    <Panel title="Emergency Response" subtitle="Response recommendations · no dispatch connected" aside={isDemo ? <SampleTag>Demo standby</SampleTag> : null}>
      <div className="d-response-list">
        {items.map(({ key, title, Icon, state, text }) => {
          const meta = RESPONSE_STATE_META[state];
          return (
            <div className="d-response" key={key}>
              <span className="d-situation-icon"><Icon size={19} /></span>
              <div><strong>{title}</strong><small>{text[state]}</small></div>
              <span className={`d-response-state tone-${meta.tone}`}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
