import React, { useState, useEffect } from 'react';
import { Header } from './components/Dashboard/Header';
import { SidePanel } from './components/Dashboard/SidePanel';
import { MapView } from './components/Map/MapView';
import { AlertBanner } from './components/Map/AlertBanner';
import { useLiveWeatherSocket } from './hooks/useLiveWeatherSocket';
import { useGeolocation } from './hooks/useGeolocation';
import { computeUserLocationTelemetry, reverseGeocodeLocation } from './utils/geoUtils';

export function App() {
  // Theme state: defaults to light mode
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Production real-time WebSocket hook connected to FastAPI /ws/live-feed
  const {
    forecastData,
    connectionStatus,
    isConnected,
    lastUpdated,
    latestStrikes,
    reconnect,
  } = useLiveWeatherSocket('ws://localhost:8000/ws/live-feed');

  // Top-level Live GPS Geolocation hook
  const {
    location: userLocation,
    error: gpsError,
    isTracking: isGpsTracking,
    isLocating: isGpsLocating,
    startTracking: startGpsTracking,
    stopTracking: stopGpsTracking,
    toggleTracking: toggleGpsTracking,
  } = useGeolocation();

  const [gpsLocality, setGpsLocality] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // When GPS location updates, reverse geocode to get locality/city name
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      reverseGeocodeLocation(userLocation.latitude, userLocation.longitude).then((name) => {
        if (name) setGpsLocality(name);
      });
    } else {
      setGpsLocality(null);
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Delhi NCR Map Center Coordinates fallback
  const defaultCenter = [28.7041, 77.1025];
  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  const activeStormCells = forecastData?.active_storm_cells || [];
  const multiRadarInputs = forecastData?.multi_radar_inputs || null;
  const satelliteInputs = forecastData?.satellite_inputs || null;
  const baseRegionName = forecastData?.region_name || 'National Capital Region (Delhi NCR)';

  // Calculate high-resolution stats and distance metrics for user GPS location
  const userTelemetry = computeUserLocationTelemetry(
    userLocation,
    activeStormCells,
    latestStrikes,
    forecastData
  );

  // Dynamic region name (user live locality if GPS active)
  const displayRegionName = userLocation
    ? gpsLocality
      ? `${gpsLocality} (My Location)`
      : `${userLocation.latitude.toFixed(3)}°N, ${userLocation.longitude.toFixed(3)}°E (Live GPS)`
    : baseRegionName;

  // User-facing system status string
  const systemStatus = isConnected
    ? 'LIVE WEBSOCKET STREAM'
    : connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'
    ? 'CONNECTING TO RADAR FEED'
    : 'STANDALONE / FALLBACK';

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors duration-200">
      {/* 1. Enterprise Top Header with Live Real-Time Feed Indicators, GPS Status & Theme Toggle */}
      <Header
        onRefresh={reconnect}
        isRefreshing={connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'}
        systemStatus={systemStatus}
        regionName={displayRegionName}
        lastUpdated={lastUpdated}
        activeAlertCount={forecastData?.nowcast_summary?.severe_hazard_warnings?.length || 0}
        theme={theme}
        onToggleTheme={toggleTheme}
        userLocation={userLocation}
        isGpsTracking={isGpsTracking}
        gpsLocality={gpsLocality}
      />

      {/* 2. Automated Emergency Siren Alert Banner & Warning Drawer (Clean Non-Overlapping Bar) */}
      <AlertBanner emergencySirenTrigger={forecastData?.emergency_siren_trigger} />

      {/* 3. Main Dashboard Layout (Interactive Map + Real-Time Telemetry Side Panel) */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        {/* Left / Center Interactive Leaflet Map Area */}
        <section className="flex-1 flex flex-col h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
          <MapView
            center={defaultCenter}
            zoom={10}
            stormCells={activeStormCells}
            multiRadarInputs={multiRadarInputs}
            satelliteInputs={satelliteInputs}
            latestStrikes={latestStrikes}
            emergencySirenTrigger={forecastData?.emergency_siren_trigger}
            regionName={displayRegionName}
            theme={theme}
            userLocation={userLocation}
            isGpsTracking={isGpsTracking}
            isGpsLocating={isGpsLocating}
            startGpsTracking={startGpsTracking}
            toggleGpsTracking={toggleGpsTracking}
            gpsError={gpsError}
          />
        </section>

        {/* Right Side Panel / Convective Telemetry with Live GPS Integration */}
        <SidePanel
          forecastData={forecastData}
          onSelectCell={setSelectedCell}
          selectedCellId={selectedCell?.cell_id}
          userLocation={userLocation}
          userTelemetry={userTelemetry}
          gpsLocality={gpsLocality}
          isGpsTracking={isGpsTracking}
          isGpsLocating={isGpsLocating}
          onEnableGps={startGpsTracking}
        />
      </main>
    </div>
  );
}

export default App;
