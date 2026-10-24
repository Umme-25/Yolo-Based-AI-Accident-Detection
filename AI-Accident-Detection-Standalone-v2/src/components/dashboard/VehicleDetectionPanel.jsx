import { Activity, Bike, Bus, Car, Truck } from 'lucide-react';
import Panel, { SampleTag } from './Panel.jsx';
import { pad2, totalVehicles } from './statusMeta.js';

const TYPES = [
  { key: 'car', label: 'Car', Icon: Car },
  { key: 'truck', label: 'Truck', Icon: Truck },
  { key: 'bus', label: 'Bus', Icon: Bus },
  { key: 'twoWheeler', label: 'Two-Wheeler', Icon: Bike },
];

export default function VehicleDetectionPanel({ vehicles, isDemo }) {
  return (
    <Panel
      title="Vehicle Detection"
      subtitle="YOLO real-time object detection"
      aside={isDemo ? <SampleTag /> : <span className="d-tag d-tag-cyan"><Activity size={14} /> AI ACTIVE</span>}
    >
      <div className="d-vehicle-grid">
        {TYPES.map(({ key, label, Icon }) => (
          <div className="d-vehicle" key={key}>
            <Icon size={22} className="ic-cyan" />
            <strong>{vehicles[key]}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="d-panel-foot"><span>Total Vehicles Detected</span><strong className="ic-cyan">{pad2(totalVehicles(vehicles))}</strong></div>
    </Panel>
  );
}
