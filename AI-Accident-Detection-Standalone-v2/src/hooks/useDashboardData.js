import { dashboardDemoData } from '../data/dashboardDemoData.js';

// Single integration point for dashboard data.
// Today it returns static demo data. Replace the body with a real data source
// (API polling, WebSocket, context, etc.) that returns the same shape.
export default function useDashboardData() {
  const data = dashboardDemoData;
  return { data, isDemo: data.source !== 'live' };
}
