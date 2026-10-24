import useDashboardData from '../hooks/useDashboardData.js';
import useCameraStream from '../hooks/useCameraStream.js';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import LiveFeedPanel from '../components/dashboard/LiveFeedPanel.jsx';
import AccidentStatusPanel from '../components/dashboard/AccidentStatusPanel.jsx';
import VehicleDetectionPanel from '../components/dashboard/VehicleDetectionPanel.jsx';
import SituationAnalysisPanel from '../components/dashboard/SituationAnalysisPanel.jsx';
import SeverityPanel from '../components/dashboard/SeverityPanel.jsx';
import LocationPanel from '../components/dashboard/LocationPanel.jsx';
import EmergencyResponsePanel from '../components/dashboard/EmergencyResponsePanel.jsx';
import AIMonitoringPanel from '../components/dashboard/AIMonitoringPanel.jsx';

export default function Dashboard() {
  const { data, isDemo } = useDashboardData();
  const stream = useCameraStream();

  return (
    <div className="dash">
      <DashboardHeader isDemo={isDemo} />
      <div className="dash-body">
        <SummaryCards data={data} cameraState={stream.state} isDemo={isDemo} />
        <div className="d-grid d-grid-main">
          <LiveFeedPanel camera={data.camera} stream={stream} />
          <AccidentStatusPanel accident={data.accident} confidence={data.detection.confidence} isDemo={isDemo} />
        </div>
        <VehicleDetectionPanel vehicles={data.detection.vehicles} isDemo={isDemo} />
        <div className="d-grid d-grid-two">
          <SituationAnalysisPanel situation={data.situation} vehicles={data.detection.vehicles} isDemo={isDemo} />
          <SeverityPanel accident={data.accident} isDemo={isDemo} />
        </div>
        <div className="d-grid d-grid-two">
          <LocationPanel />
          <EmergencyResponsePanel response={data.response} isDemo={isDemo} />
        </div>
        <AIMonitoringPanel ai={data.ai} camera={data.camera} />
      </div>
    </div>
  );
}
