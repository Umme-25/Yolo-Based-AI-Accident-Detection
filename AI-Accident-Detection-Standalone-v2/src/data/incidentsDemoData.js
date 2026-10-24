import { ACTOR } from '../utils/incidentUtils.js';

// DEMO incident data. These records are invented samples for interface testing. They are NOT AI
// detections, and the probabilities, confidences and severities are illustrative, not validated
// model output. Probability, confidence and severity are deliberately independent (several
// samples have a high probability with a lower severity, and vice versa).
//
// Timestamps are generated relative to `now` when the demo set is created, so the sample always
// looks recent on first load. After that the records are saved and keep their timestamps.

const HOUR = 3600e3;
const DEMO_NOTE = 'Demo record for interface testing.';

// [id, locationId, cameraId, eventType, severity, probability, confidence, status, hoursAgo, extras]
// extras: { lat, lng, desc, steps: [[hoursAfterCreation, type, to, note]] }
const SEEDS = [
  ['INC-0001', 'LOC-003', 'CAM-03', 'possible_collision', 'critical', 0.96, 0.91, 'pending_review', 0.5, { lat: 26.7894, lng: 83.4219, desc: 'Demo incident: sample record with coordinates, awaiting review.' }],
  ['INC-0002', 'LOC-001', 'CAM-01', 'possible_collision', 'high', 0.91, 0.87, 'pending_review', 2, { desc: 'Demo incident requiring review.' }],
  ['INC-0003', 'LOC-002', 'CAM-02', 'road_blockage', 'medium', 0.58, 0.82, 'acknowledged', 5, { desc: 'Demo incident: high detection confidence but only a moderate probability and severity.', steps: [[0.3, 'status_change', 'acknowledged', null]] }],
  ['INC-0004', 'LOC-004', 'CAM-04', 'vehicle_stopped', 'low', 0.31, 0.77, 'under_review', 9, { desc: 'Demo incident: stopped vehicle sample.', steps: [[0.5, 'status_change', 'under_review', null], [1, 'note', null, 'Checking whether this is routine roadside parking (demo note).']] }],
  ['INC-0005', 'LOC-005', 'CAM-05', 'fire_or_smoke', 'high', 0.64, 0.71, 'under_review', 20, { desc: 'Demo incident: fire/smoke sample.', steps: [[1, 'status_change', 'acknowledged', null], [2, 'status_change', 'under_review', null]] }],
  ['INC-0006', 'LOC-001', 'CAM-01', 'pedestrian_on_road', 'medium', 0.42, 0.69, 'pending_review', 30, { desc: 'Demo incident: person on carriageway sample.' }],
  ['INC-0007', 'LOC-006', 'CAM-06', 'possible_collision', 'critical', 0.88, 0.93, 'resolved', 52, { desc: 'Demo incident: resolved sample.', steps: [[0.5, 'status_change', 'acknowledged', null], [1, 'status_change', 'under_review', null], [3, 'note', null, 'Reviewed sample footage placeholder (demo note).'], [4, 'status_change', 'resolved', 'Closed after review (demo).']] }],
  ['INC-0008', 'LOC-002', 'CAM-02', 'vehicle_stopped', 'low', 0.22, 0.88, 'resolved', 75, { desc: 'Demo incident: resolved sample.', steps: [[1, 'status_change', 'resolved', 'Vehicle moved on (demo).']] }],
  ['INC-0009', 'LOC-003', 'CAM-03', 'road_blockage', 'high', 0.73, 0.8, 'resolved', 120, { desc: 'Demo incident: resolved sample.', steps: [[1, 'status_change', 'under_review', null], [6, 'status_change', 'resolved', 'Blockage cleared (demo).']] }],
  ['INC-0010', 'LOC-005', 'CAM-05', 'possible_collision', 'medium', 0.67, 0.62, 'resolved', 200, { desc: 'Demo incident: resolved sample.', steps: [[2, 'status_change', 'acknowledged', null], [5, 'status_change', 'resolved', 'No further action in this demo.']] }],
  ['INC-0011', 'LOC-001', 'CAM-01', 'fire_or_smoke', 'critical', 0.55, 0.66, 'resolved', 340, { desc: 'Demo incident: resolved sample.', steps: [[1, 'status_change', 'under_review', null], [8, 'status_change', 'resolved', 'Marked false alarm (demo).']] }],
  ['INC-0012', 'LOC-004', 'CAM-04', 'pedestrian_on_road', 'low', 0.18, 0.74, 'resolved', 600, { desc: 'Demo incident: resolved sample.', steps: [[2, 'status_change', 'resolved', 'Closed (demo).']] }],
];

export function createDemoIncidents(now = Date.now()) {
  return SEEDS.map(([id, locationId, cameraId, eventType, severity, accidentProbability, detectionConfidence, status, hoursAgo, extras = {}]) => {
    const created = now - hoursAgo * HOUR;
    const activity = [{ id: `${id}-a1`, type: 'created', at: new Date(created).toISOString(), note: DEMO_NOTE, author: 'Demo data' }];
    let prev = 'pending_review';
    (extras.steps ?? []).forEach(([after, type, to, note], n) => {
      const entry = { id: `${id}-a${n + 2}`, type, at: new Date(created + after * HOUR).toISOString(), note, author: ACTOR };
      if (type === 'status_change') { entry.from = prev; entry.to = to; prev = to; }
      activity.push(entry);
    });
    return {
      id, locationId, cameraId, eventType, severity, accidentProbability, detectionConfidence, status,
      timestamp: new Date(created).toISOString(),
      latitude: extras.lat ?? null, longitude: extras.lng ?? null,
      evidenceImageUrl: null, evidenceVideoUrl: null,
      description: extras.desc ?? DEMO_NOTE,
      isDemo: true,
      activity,
    };
  });
}
