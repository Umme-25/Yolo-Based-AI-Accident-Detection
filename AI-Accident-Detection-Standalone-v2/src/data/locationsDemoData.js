// Demo data for the Locations module. These are SAMPLE monitoring locations:
// no cameras are installed or connected at these coordinates, which are illustrative only.
//
// A location is a configured monitoring site. Incidents are separate records (see
// incidentsDemoData.js) that point to a location by locationId.

export const DEMO_LOCATIONS = [
  { id: 'LOC-001', name: 'Demo Highway Zone 1', type: 'Highway', latitude: 26.7606, longitude: 83.3732, cameraId: 'CAM-01', cameraStatus: 'online', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
  { id: 'LOC-002', name: 'Demo Junction Zone A', type: 'Junction', latitude: 26.7425, longitude: 83.3946, cameraId: 'CAM-02', cameraStatus: 'online', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
  { id: 'LOC-003', name: 'Demo Bridge Zone', type: 'Bridge', latitude: 26.7893, longitude: 83.4217, cameraId: 'CAM-03', cameraStatus: 'online', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
  { id: 'LOC-004', name: 'Demo Urban Road Zone', type: 'Urban Road', latitude: 26.7549, longitude: 83.3501, cameraId: 'CAM-04', cameraStatus: 'offline', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
  { id: 'LOC-005', name: 'Demo Toll Plaza Zone', type: 'Toll Plaza', latitude: 26.8102, longitude: 83.3318, cameraId: 'CAM-05', cameraStatus: 'online', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
  { id: 'LOC-006', name: 'Demo Highway Zone 2', type: 'Highway', latitude: 26.7211, longitude: 83.4408, cameraId: 'CAM-06', cameraStatus: 'offline', description: 'Demo monitoring location. No camera is installed here.', isDemo: true },
];
