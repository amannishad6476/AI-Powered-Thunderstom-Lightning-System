import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Dashboard/Header';
import { WeatherMap } from './components/Map/WeatherMap';
import { TimelineControls } from './components/Dashboard/TimelineControls';
import { RiskSummaryCard } from './components/Dashboard/RiskSummaryCard';
import { LayerControlPanel } from './components/Dashboard/LayerControlPanel';
import { AlertFeed } from './components/Dashboard/AlertFeed';
import { MetricsPanel } from './components/Dashboard/MetricsPanel';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import {
  fetchNowcastSummary,
  fetchRecentStrikes,
  fetchLightningRiskGrid,
  fetchActiveAlerts,
  fetchAWSStations,
} from './services/api';
import { wsClient } from './services/websocket';

export function App() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);

  // Data states
  const [nowcastData, setNowcastData] = useState(null);
  const [strikes, setStrikes] = useState([]);
  const [riskGrid, setRiskGrid] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stations, setStations] = useState([]);

  // Layer visibility toggles
  const [layerVisibility, setLayerVisibility] = useState({
    radar: true,
    lightning: true,
    stormCells: true,
    stations: true,
    warnings: true,
  });

  const handleToggleLayer = (key) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const loadAllData = useCallback(async (lat = 28.6139, lon = 77.2090) => {
    try {
      setIsRefreshing(true);
      const [nowcast, recentStrikes, lightningRisk, activeAlerts, awsList] = await Promise.all([
        fetchNowcastSummary(lat, lon),
        fetchRecentStrikes(lat, lon),
        fetchLightningRiskGrid(lat, lon),
        fetchActiveAlerts(lat, lon),
        fetchAWSStations(),
      ]);

      setNowcastData(nowcast);
      setStrikes(recentStrikes || nowcast?.recent_lightning_strikes || []);
      setRiskGrid(lightningRisk?.strike_risk_grid || []);
      setAlerts(activeAlerts || []);
      setStations(awsList || []);
    } catch (err) {
      console.error('Failed to load nowcasting data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Connect WebSocket for live hazard updates
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.event === 'NEW_LIGHTNING_STRIKE') {
        setStrikes((prev) => [msg.data, ...prev.slice(0, 50)]);
      }
    });

    // Polling interval every 60 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 60000);

    return () => {
      unsubscribe();
      wsClient.disconnect();
      clearInterval(interval);
    };
  }, [loadAllData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner label="Initializing AI Doppler Radar & Lightning Nowcasting Engine..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onRefresh={() => loadAllData()}
        isRefreshing={isRefreshing}
        activeAlertCount={alerts.length}
      />

      {/* Main Full-Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Interactive Map Viewport */}
        <div className="flex-1 flex flex-col gap-3 min-h-[400px]">
          <div className="flex-1 relative">
            <WeatherMap
              center={[28.6139, 77.2090]}
              zoom={10}
              timeOffset={timeOffset}
              layerVisibility={layerVisibility}
              nowcastData={nowcastData}
              strikes={strikes}
              riskGrid={riskGrid}
              alerts={alerts}
              stations={stations}
            />
          </div>

          {/* Timeline & Playback Controller */}
          <TimelineControls
            currentOffset={timeOffset}
            onOffsetChange={setTimeOffset}
          />
        </div>

        {/* Right Dashboard Telemetry & Alert Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-3.5 overflow-y-auto pr-1">
          <RiskSummaryCard summary={nowcastData?.summary} />
          <LayerControlPanel
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
          />
          <MetricsPanel timeline={nowcastData?.forecast_timeline} />
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

export default App;
