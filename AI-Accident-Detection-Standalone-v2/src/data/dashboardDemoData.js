// Demo data for the dashboard. This is SAMPLE data, not AI output.
//
// Integration note: the dashboard reads data only through src/hooks/useDashboardData.js.
// To connect a backend or AI pipeline later, return an object with this same shape from
// that hook (and set `source` to 'live'). No dashboard component needs to change.
//
// Shape reference
//   source:    'demo' | 'live'
//   camera:    { id, name, source }
//   detection: { vehicles: { car, truck, bus, twoWheeler }, confidence (0-1) }
//   accident:  { status: 'none' | 'suspected' | 'confirmed', accidentsToday,
//                severity: 'low' | 'medium' | 'high' | 'critical', severityScore (0-100) }
//   situation: { fire, smoke, roadBlockage, person }   (booleans)
//   response:  { medical, fireRescue, traffic }         ('standby' | 'normal' | 'recommended')
//   ai:        { model, tracking }  each { name, status: 'planned' | 'connected' | 'offline' }

export const dashboardDemoData = {
  source: 'demo',
  camera: { id: 'CAM-01', name: 'Highway Camera - CAM 01', source: 'Browser Webcam' },
  detection: {
    vehicles: { car: 2, truck: 1, bus: 1, twoWheeler: 0 },
    confidence: 0.942,
  },
  accident: { status: 'none', accidentsToday: 0, severity: 'low', severityScore: 8 },
  situation: { fire: false, smoke: false, roadBlockage: false, person: false },
  response: { medical: 'standby', fireRescue: 'standby', traffic: 'normal' },
  ai: {
    model: { name: 'YOLO', status: 'planned' },
    tracking: { name: 'ByteTrack', status: 'planned' },
  },
};
