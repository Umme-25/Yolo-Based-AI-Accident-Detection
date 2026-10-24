import { AlertCircle, CheckCircle2, OctagonAlert, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';

// Presentation metadata (labels, tones, icons) kept apart from the data.
// tone -> CSS class `tone-<tone>` in dashboard.css

export const SEVERITY_META = {
  low: { label: 'LOW', risk: 'Low Risk', tone: 'safe', Icon: CheckCircle2 },
  medium: { label: 'MEDIUM', risk: 'Medium Risk', tone: 'warn', Icon: AlertCircle },
  high: { label: 'HIGH', risk: 'High Risk', tone: 'high', Icon: TriangleAlert },
  critical: { label: 'CRITICAL', risk: 'Critical Risk', tone: 'critical', Icon: OctagonAlert },
};

export const ACCIDENT_STATUS_META = {
  none: { label: 'NO ACCIDENT', tone: 'safe', Icon: ShieldCheck, detection: 'Normal', note: 'No accident detected' },
  suspected: { label: 'POSSIBLE ACCIDENT', tone: 'warn', Icon: ShieldAlert, detection: 'Needs review', note: 'Awaiting review' },
  confirmed: { label: 'ACCIDENT CONFIRMED', tone: 'critical', Icon: OctagonAlert, detection: 'Accident', note: 'Confirmed incident' },
};

export const RESPONSE_STATE_META = {
  standby: { label: 'Standby', tone: 'safe' },
  normal: { label: 'Normal', tone: 'safe' },
  recommended: { label: 'Recommended', tone: 'critical' },
};

export const MODULE_STATUS_LABEL = { planned: 'Planned', connected: 'Connected', offline: 'Offline' };

export const pad2 = (n) => String(n).padStart(2, '0');
export const formatPercent = (ratio) => `${(ratio * 100).toFixed(1)}%`;
export const totalVehicles = (v) => v.car + v.truck + v.bus + v.twoWheeler;
