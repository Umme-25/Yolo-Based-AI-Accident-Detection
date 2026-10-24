import { Ban, Car, Flame, User, Wind } from 'lucide-react';
import Panel, { SampleTag } from './Panel.jsx';
import { pad2, totalVehicles } from './statusMeta.js';

function Row({ Icon, title, sub, value, alert }) {
  return (
    <div className={`d-situation-row ${alert ? 'is-alert' : ''}`}>
      <span className="d-situation-icon"><Icon size={19} /></span>
      <div><strong>{title}</strong><small>{sub}</small></div>
      <b>{value}</b>
    </div>
  );
}

export default function SituationAnalysisPanel({ situation, vehicles, isDemo }) {
  const yn = (v) => (v ? 'YES' : 'NO');
  return (
    <Panel title="Situation Analysis" subtitle="Real-time scene analysis" aside={isDemo ? <SampleTag /> : null}>
      <div className="d-situation">
        <Row Icon={Car} title="Vehicles Detected" sub="Normal" value={pad2(totalVehicles(vehicles))} />
        <Row Icon={Flame} title="Fire Detected" sub={situation.fire ? 'Alert' : 'Safe'} value={yn(situation.fire)} alert={situation.fire} />
        <Row Icon={Wind} title="Smoke Detected" sub={situation.smoke ? 'Alert' : 'Safe'} value={yn(situation.smoke)} alert={situation.smoke} />
        <Row Icon={Ban} title="Road Blockage" sub={situation.roadBlockage ? 'Blocked' : 'Clear'} value={yn(situation.roadBlockage)} alert={situation.roadBlockage} />
        <Row Icon={User} title="Person Detected" sub={situation.person ? 'On road' : 'Clear'} value={yn(situation.person)} alert={situation.person} />
      </div>
    </Panel>
  );
}
