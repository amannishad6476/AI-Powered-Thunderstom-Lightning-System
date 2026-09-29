import React, { useState } from 'react';
import { Header } from './components/Dashboard/Header';
import { SidePanel } from './components/Dashboard/SidePanel';
import { MapView } from './components/Map/MapView';
import { useLiveWeatherSocket } from './hooks/useLiveWeatherSocket';

export function App() {
  // Use production real-time WebSocket hook connected to FastAPI /ws/live-feed
  const {
    forecastData,
    connectionStatus,
    isConnected,
    lastUpdated,
    latestStrikes,
    reconnect,
  } = useLiveWeatherSocket('ws://localhost:8000/ws/live-feed');

  const [selectedCell, setSelectedCell] = useState(null);

  // Delhi NCR Map Center
  const mapCenter = [28.7041, 77.1025];

  const activeStormCells = forecastData?.active_storm_cells || [];
  const multiRadarInputs = forecastData?.multi_radar_inputs || null;
  const satelliteInputs = forecastData?.satellite_inputs || null;
  const regionName = forecastData?.region_name || 'National Capital Region (Delhi NCR)';

  // Determine user-facing system status string
  const systemStatus = isConnected
    ? 'LIVE WEBSOCKET STREAM'
    : connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'
    ? 'CONNECTING TO RADAR FEED'
    : 'STANDALONE / FALLBACK';

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top Header with Live Real-Time Feed Indicators */}
      <Header
        onRefresh={reconnect}
        isRefreshing={connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'}
        systemStatus={systemStatus}
        regionName={regionName}
        lastUpdated={lastUpdated}
        activeAlertCount={forecastData?.nowcast_summary?.severe_hazard_warnings?.length || 0}
      />

      {/* 2. Main Dashboard Layout (Interactive Map + Real-Time Telemetry Side Panel) */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Left / Center Interactive Leaflet Map Area */}
        <section className="flex-1 flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden shadow-2xl relative">
          <MapView
            center={mapCenter}
            zoom={10}
            stormCells={activeStormCells}
            multiRadarInputs={multiRadarInputs}
            satelliteInputs={satelliteInputs}
            latestStrikes={latestStrikes}
            regionName={regionName}
          />
        </section>

        {/* Right Side Panel / Live Convective Telemetry */}
        <SidePanel
          forecastData={forecastData}
          onSelectCell={setSelectedCell}
        />
      </main>
    </div>
  );
}

export default App;
