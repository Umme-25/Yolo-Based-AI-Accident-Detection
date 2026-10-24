# YOLO Accident AI — Standalone Frontend

A clean, standalone React + Vite UI for the AI Accident Detection project. The interface uses a persistent sidebar with these sections:

1. Home (landing page, via the sidebar logo)
2. Dashboard
3. Live Monitoring (`/traffic-analysis`: camera preview and local video upload)
4. Incidents (`/reports`, detail at `/reports/:id`)
5. Locations & Monitoring Zones (`/locations`)
6. History (`/history`, detail at `/history/:id`)
6. Settings

The previous public, government-official, and hospital UI flows are no longer routed or shown in this version. Replit-specific configuration and the previous Tailwind/Replit Vite plugin setup have been removed.

## Run locally
Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, normally `http://127.0.0.1:5173`.

## Build check
```bash
npm run build
```

## Current scope
- The landing page, navigation, dashboard, camera preview, reports form/search, and settings toggles are frontend UI.
- Traffic Analysis can request browser camera access or preview a locally selected video. Browser camera permission is required.
- Dashboard statistics and listed incidents are sample data.
- New reports and settings are local in-memory demo state; refreshing resets them.
- There is no AI inference, backend API, real-time CCTV connection, persistent database, authentication, or emergency dispatch connected yet.
- For safety, the UI does not claim that any sample incident is a real detection.

## Dashboard data
The dashboard reads from `src/hooks/useDashboardData.js`, which currently returns the sample data in `src/data/dashboardDemoData.js` (shape documented at the top of that file). Replace that hook's body to connect a backend or AI output; the dashboard components do not need to change. Values labelled "Sample" or "Demo" are not AI predictions.

## Locations module (Phase 2)
- Page: `src/pages/Locations.jsx`; components in `src/components/locations/`; map uses Leaflet with OpenStreetMap tiles (needs internet for tiles).
- Data access is isolated in `src/services/locationsService.js` (localStorage today, demo persistence only, private to one browser). Replace its function bodies with API calls later; `src/hooks/useLocations.js` and the page stay unchanged.
- Sample locations live in `src/data/locationsDemoData.js` and are labelled demo. Incident links are kept separate from locations (a location is a site; an incident is an event).
- Validation and filtering helpers: `src/utils/locationUtils.js`. Logic tests: `npm run test:locations` (no browser needed).
- GPS is never requested automatically; the form's "Use my current position" button asks the browser only when clicked.

## Incidents, severity and history (Phase 3)
- Pages: `src/pages/Incidents.jsx` (route `/reports`, kept from the original app) and `src/pages/History.jsx` (resolved incidents only). Components are in `src/components/incidents/`.
- Data: `src/data/incidentsDemoData.js` (documented record shape in `src/utils/incidentUtils.js`). All seeded incidents are DEMO DATA, not AI detections. Probability, confidence and severity are separate fields.
- Access: `src/services/incidentsService.js` is the only file that knows about storage (localStorage, demo only). Swap its function bodies for API calls later; `useIncidents` and all components stay unchanged.
- Review workflow: Pending Review → Acknowledged / Under Review → Resolved; Resolved can be reopened (a reason is required). Status changes and notes are recorded in the activity timeline. Actions change the local demo record only; no one is notified.
- Locations' "active incident" markers are derived from unresolved incidents linked by `locationId`.
- Logic tests: `npm test` (no browser needed).
