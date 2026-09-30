import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  ZoomControl,
} from 'react-leaflet';
import {
  CloudRain,
  Radio,
  Satellite,
  Wind,
  Zap,
  Navigation,
  Activity,
  Layers,
  ShieldAlert,
  Locate,
  LocateFixed,
  Crosshair,
  MapPin,
  AlertCircle,
  Building2,
  Plane,
  Cross,
  Cpu,
  Train,
  CheckCircle2,
} from 'lucide-react';
import { UserLocationMarker } from './UserLocationMarker';
import { RadarOverlay } from './RadarOverlay';
import { TimelineSlider } from './TimelineSlider';
import { getNearestStormCell } from '../../utils/geoUtils';

// Critical Infrastructure Assets Definitions for Spatial Rendering
const DEFAULT_CRITICAL_ASSETS = [
  {
    asset_id: 'ASSET-DEL-IGI',
    name: 'Indira Gandhi International Airport (DEL)',
    category: 'AIRPORT',
    risk_tolerance: 'CRITICAL',
    centroid: [28.5562, 77.1000],
    radius_km: 6.5,
    icon: Plane,
    color: '#0284c7', // Sky blue
    bounds: [
      [28.540, 77.060],
      [28.540, 77.135],
      [28.585, 77.135],
      [28.585, 77.060],
    ],
    contact: 'ATC Delhi & Airport Emergency Ops',
    dispatch: 'AIRPORT_GROUND_STOP',
  },
  {
    asset_id: 'ASSET-DEL-AIIMS',
    name: 'AIIMS New Delhi & Trauma Center',
    category: 'HOSPITAL',
    risk_tolerance: 'CRITICAL',
    centroid: [28.5672, 77.2100],
    radius_km: 3.2,
    icon: Cross,
    color: '#dc2626', // Red
    bounds: [
      [28.555, 77.195],
      [28.555, 77.225],
      [28.580, 77.225],
      [28.580, 77.195],
    ],
    contact: 'AIIMS Disaster Management Unit',
    dispatch: 'AIIMS_BACKUP_POWER_ENGAGED',
  },
  {
    asset_id: 'ASSET-DEL-GRID-BAWANA',
    name: 'Delhi 400kV Bawana / Rohini Power Grid',
    category: 'POWER_GRID',
    risk_tolerance: 'CRITICAL',
    centroid: [28.7850, 77.0500],
    radius_km: 4.8,
    icon: Cpu,
    color: '#d97706', // Amber
    bounds: [
      [28.760, 77.020],
      [28.760, 77.085],
      [28.815, 77.085],
      [28.815, 77.020],
    ],
    contact: 'Delhi Transco Ltd Load Dispatch',
    dispatch: 'GRID_SURGE_ARREST_ACTIVE',
  },
  {
    asset_id: 'ASSET-DEL-GRID-MBAGH',
    name: 'Maharani Bagh 220kV Power Substation',
    category: 'POWER_GRID',
    risk_tolerance: 'HIGH',
    centroid: [28.5700, 77.2600],
    radius_km: 3.5,
    icon: Cpu,
    color: '#ea580c', // Orange
    bounds: [
      [28.555, 77.245],
      [28.555, 77.275],
      [28.585, 77.275],
      [28.585, 77.245],
    ],
    contact: 'BSES Yamuna Grid Operations',
    dispatch: 'SUBSTATION_FLOOD_PUMP_ENGAGED',
  },
  {
    asset_id: 'ASSET-DEL-METRO-RAJIV',
    name: 'Rajiv Chowk Metro Transit Interchange',
    category: 'METRO_NETWORK',
    risk_tolerance: 'HIGH',
    centroid: [28.6328, 77.2197],
    radius_km: 2.8,
    icon: Train,
    color: '#7c3aed', // Purple
    bounds: [
      [28.620, 77.205],
      [28.620, 77.235],
      [28.645, 77.235],
      [28.645, 77.205],
    ],
    contact: 'DMRC Central OCC Control',
    dispatch: 'METRO_SPEED_RESTRICTION_30KMH',
  },
];

/**
 * Enterprise Meteorological MapView Component with Live GPS Geolocation,
 * Timeline Historical/Nowcast Playback Slider, and Automated Emergency Siren Alerts.
 */
export const MapView = ({
  center = [28.7041, 77.1025], // Delhi NCR Coordinates
  zoom = 9,
  stormCells = [],
  multiRadarInputs = null,
  satelliteInputs = null,
  latestStrikes = [],
  emergencySirenTrigger = null,
  regionName = 'National Capital Region (Delhi NCR)',
  theme = 'light',
  userLocation = null,
  isGpsTracking = false,
  isGpsLocating = false,
  startGpsTracking,
  toggleGpsTracking,
  gpsError = null,
}) => {
  const [mapMode, setMapMode] = useState(theme === 'dark' ? 'dark' : 'standard');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [showRadarOverlay, setShowRadarOverlay] = useState(true);
  const [showCriticalAssets, setShowCriticalAssets] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0); // Timeline offset in minutes (-60 to +120)
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Sync map tile styling when app theme changes
  useEffect(() => {
    setMapMode(theme === 'dark' ? 'dark' : 'standard');
  }, [theme]);

  // GPS Locate / Center handler
  const handleGpsToggle = () => {
    if (!isGpsTracking && startGpsTracking) {
      startGpsTracking();
    }
    setRecenterTrigger((prev) => prev + 1);
  };

  // Helper to determine styling based on storm cell intensity and dBZ
  const getCellStyling = (cell) => {
    const intensityStr = (cell.intensity || '').toLowerCase();
    const dbz = cell.dbz || 0;

    if (intensityStr.includes('severe') || intensityStr.includes('extreme') || dbz >= 50) {
      return {
        color: '#dc2626', // High-visibility Red
        fillColor: '#ef4444',
        fillOpacity: 0.38,
        weight: 2.5,
        badgeBg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
        badgeText: 'SEVERE STORM CELL',
      };
    } else if (intensityStr.includes('moderate') || dbz >= 38) {
      return {
        color: '#ea580c', // Orange
        fillColor: '#f97316',
        fillOpacity: 0.3,
        weight: 2,
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
        badgeText: 'MODERATE STORM CELL',
      };
    } else {
      return {
        color: '#ca8a04', // Yellow
        fillColor: '#eab308',
        fillOpacity: 0.24,
        weight: 1.5,
        badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
        badgeText: 'DEVELOPING CONVECTION',
      };
    }
  };

  // Compute time-adjusted storm cell positions based on timeline offset
  const timeAdjustedStormCells = useMemo(() => {
    if (timeOffset === 0) return stormCells;

    const hours = timeOffset / 60.0;
    return stormCells.map((cell) => {
      const speed = cell.speed_kmh || 40.0;
      const deg = cell.direction_deg || (cell.direction === 'ENE' ? 67.5 : cell.direction === 'NE' ? 45.0 : 90.0);
      const rad = (deg * Math.PI) / 180.0;

      // Displacement
      const distKm = speed * hours;
      const dLat = (distKm * Math.cos(rad)) / 111.0;
      const dLng = (distKm * Math.sin(rad)) / (111.0 * Math.cos((cell.lat * Math.PI) / 180.0));

      // Decaying / intensifying dbz over nowcast window
      const dbzMod = timeOffset > 0 ? -Math.min(5, (timeOffset / 120) * 6) : 0;
      const adjDbz = Math.round((cell.dbz + dbzMod) * 10) / 10;

      return {
        ...cell,
        lat: Number((cell.lat + dLat).toFixed(5)),
        lng: Number((cell.lng + dLng).toFixed(5)),
        dbz: adjDbz,
        isTimelineShifted: true,
      };
    });
  }, [stormCells, timeOffset]);

  // Compute nearest cell to user if GPS is locked
  const nearestStormToUser = userLocation
    ? getNearestStormCell(userLocation.latitude, userLocation.longitude, timeAdjustedStormCells)
    : null;

  const isSirenActive = emergencySirenTrigger?.siren_triggered;
  const sirenLevel = emergencySirenTrigger?.siren_level || 'LEVEL_3_HIGH_PRIORITY_KLAXON';
  const dispatchFlags = emergencySirenTrigger?.dispatch_flags || [];

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col transition-colors">
      {/* 1. Leaflet Interactive Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className={`w-full h-full z-0 ${mapMode === 'dark' ? 'leaflet-dark-tiles' : ''}`}
          zoomControl={false}
        >
          {/* ZoomControl positioned at bottomleft above timeline slider */}
          <ZoomControl position="bottomleft" />

          {/* OpenStreetMap Standard Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Dynamic Radar Reflectivity Overlay advecting with timeline */}
          <RadarOverlay timeOffset={timeOffset} visible={showRadarOverlay} />

          {/* Critical Urban Infrastructure Polygons */}
          {showCriticalAssets &&
            DEFAULT_CRITICAL_ASSETS.map((asset) => {
              const IconComponent = asset.icon;
              return (
                <React.Fragment key={asset.asset_id}>
                  {/* Infrastructure Boundary Polygon */}
                  <Polygon
                    positions={asset.bounds}
                    pathOptions={{
                      color: asset.color,
                      fillColor: asset.color,
                      fillOpacity: 0.18,
                      weight: 1.8,
                      dashArray: '4, 4',
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <div className="font-sans text-xs font-semibold">
                        <span className="font-bold">{asset.name}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {asset.category} • {asset.risk_tolerance} ASSET
                        </div>
                      </div>
                    </Tooltip>

                    <Popup maxWidth={320}>
                      <div className="p-1 space-y-2 text-xs font-sans">
                        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                          <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                            <IconComponent className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                            <div className="text-[10px] text-slate-500">{asset.category}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-slate-700 dark:text-slate-300">
                          <div>
                            <strong>Contact:</strong> {asset.contact}
                          </div>
                          <div>
                            <strong>Automated Hook:</strong>{' '}
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                              {asset.dispatch}
                            </span>
                          </div>
                          <div>
                            <strong>Status:</strong>{' '}
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Protected Under PostGIS Geofence
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>

                  {/* Asset Centroid Node */}
                  <CircleMarker
                    center={asset.centroid}
                    radius={5}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: asset.color,
                      fillOpacity: 1,
                      weight: 1.5,
                    }}
                  />
                </React.Fragment>
              );
            })}

          {/* Live GPS User Location Marker with Telemetry Halo */}
          <UserLocationMarker
            location={userLocation}
            stormCells={timeAdjustedStormCells}
            triggerRecenter={recenterTrigger}
          />

          {/* Storm Cell Zones & Convective Cores */}
          {timeAdjustedStormCells.map((cell) => {
            const style = getCellStyling(cell);
            const radiusMeters = (cell.radius_km || 15) * 1000;

            return (
              <React.Fragment key={cell.cell_id || `${cell.lat}-${cell.lng}`}>
                {/* Convective Footprint Zone */}
                <Circle
                  center={[cell.lat, cell.lng]}
                  radius={radiusMeters}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fillColor,
                    fillOpacity: style.fillOpacity,
                    weight: style.weight,
                    dashArray: cell.intensity?.toLowerCase().includes('severe') ? undefined : '5, 5',
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="font-sans text-xs font-semibold space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {cell.cell_id}{' '}
                        {timeOffset !== 0 && (
                          <span className="text-[10px] font-mono font-normal opacity-80">
                            ({timeOffset > 0 ? `+${timeOffset}m Nowcast` : `${timeOffset}m Past`})
                          </span>
                        )}
                      </div>
                      <div className="text-amber-600 dark:text-amber-300">{cell.intensity}</div>
                      <div className="text-slate-600 dark:text-slate-300">Coverage: {cell.radius_km} km radius</div>
                    </div>
                  </Tooltip>

                  {/* Rich Leaflet Convective Telemetry Popup */}
                  <Popup className="custom-storm-popup" maxWidth={360} minWidth={290}>
                    <div className="p-2 space-y-3 font-sans text-slate-800 dark:text-slate-200">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{cell.cell_id}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {cell.lat.toFixed(4)}°N, {cell.lng.toFixed(4)}°E
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badgeBg}`}>
                          {style.badgeText}
                        </span>
                      </div>

                      {/* Convective Cell Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-red-500 dark:text-red-400" />
                            <span>Max Reflectivity</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {cell.dbz || 50.0} <span className="text-[10px] text-slate-500 dark:text-slate-400">dBZ</span>
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <CloudRain className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                            <span>Coverage Radius</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {cell.radius_km} <span className="text-[10px] text-slate-500 dark:text-slate-400">km</span>
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Motion Vector</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {cell.speed_kmh} km/h • {cell.direction}
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Wind className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                            <span>Cloud-Top Echo</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-mono">
                            {cell.cloud_top_height_km} km
                          </div>
                        </div>
                      </div>

                      {/* Multi-Radar Inputs Section */}
                      <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center space-x-1.5 font-semibold text-sky-700 dark:text-sky-400">
                          <Radio className="w-3.5 h-3.5" />
                          <span>Multi-Radar Doppler Ingestion</span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300">
                          <span className="text-slate-500 dark:text-slate-400">Stations:</span>{' '}
                          {multiRadarInputs?.active_stations?.join(', ') || 'Delhi Palam DWR (S-Band), Mausam Bhavan DWR'}
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 flex justify-between pt-0.5">
                          <span>
                            <span className="text-slate-500 dark:text-slate-400">Composite:</span>{' '}
                            <strong className="text-red-600 dark:text-red-400">
                              {multiRadarInputs?.composite_max_dbz || cell.dbz} dBZ
                            </strong>
                          </span>
                          <span>
                            <span className="text-slate-500 dark:text-slate-400">Tilts:</span> 6 scans (0.5°-15°)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Circle>

                {/* Storm Cell Centroid Core Marker with Outer Pulse Ring */}
                <CircleMarker
                  center={[cell.lat, cell.lng]}
                  radius={7}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: style.color,
                    fillOpacity: 1,
                    weight: 2,
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Real-Time Lightning Strike Pulses */}
          {latestStrikes.slice(0, 25).map((strike, idx) => {
            const isCG = strike.strike_type === 'CG';
            return (
              <CircleMarker
                key={strike.id || `${strike.lat}-${strike.lng}-${idx}`}
                center={[strike.lat, strike.lng]}
                radius={isCG ? 6 : 4.5}
                pathOptions={{
                  color: isCG ? '#b45309' : '#0284c7',
                  fillColor: isCG ? '#f59e0b' : '#38bdf8',
                  fillOpacity: 0.95,
                  weight: 1.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 font-mono">
                    ⚡ {isCG ? 'Cloud-to-Ground' : 'Intra-Cloud'} ({strike.amplitude_ka} kA)
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* 2. Floating Top-Left Region Badge & GPS Status */}
        <div className="absolute top-3 left-3 z-[999] flex flex-col gap-1.5 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2.5 pointer-events-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold">{regionName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700 font-mono">
              {stormCells.length} Convective Cells
            </span>
          </div>

          {/* GPS Proximity Card */}
          {userLocation && nearestStormToUser && (
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-2 pointer-events-auto">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span className="text-[11px]">
                Nearest Core: <strong className="text-slate-900 dark:text-slate-100">{nearestStormToUser.cell_id}</strong> (
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  {nearestStormToUser.distanceKm} km {nearestStormToUser.bearing}
                </span>
                )
              </span>
            </div>
          )}

          {/* GPS Error Alert */}
          {gpsError && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-1.5 pointer-events-auto">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-[11px]">{gpsError}</span>
            </div>
          )}
        </div>

        {/* 3. Floating Top-Right Map Controls */}
        <div className="absolute top-3 right-3 z-[999] flex items-center space-x-2 pointer-events-auto">
          {/* Live GPS Button */}
          <button
            onClick={handleGpsToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
              isGpsTracking && userLocation
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={userLocation ? 'Re-center Map on My Live GPS Location' : 'Activate Live GPS Position Tracking'}
          >
            {isGpsLocating ? (
              <Crosshair className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin" />
            ) : isGpsTracking && userLocation ? (
              <LocateFixed className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-pulse" />
            ) : (
              <Locate className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            )}
            <span>{isGpsTracking && userLocation ? 'GPS Active' : isGpsLocating ? 'Locating...' : 'Live GPS'}</span>
          </button>

          {/* GIS Critical Assets Layer Toggle */}
          <button
            onClick={() => setShowCriticalAssets(!showCriticalAssets)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 cursor-pointer ${
              showCriticalAssets
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Urban Critical Infrastructure Geofences"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Critical Assets</span>
          </button>

          {/* Dark / Light Basemap Mode Toggle */}
          <button
            onClick={() => setMapMode(mapMode === 'dark' ? 'standard' : 'dark')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
            title="Toggle Dark Meteorological / Standard OSM Basemap"
          >
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{mapMode === 'dark' ? 'Dark GIS' : 'Light OSM'}</span>
          </button>
        </div>

        {/* 5. Floating Bottom-Right Severity Legend */}
        <div className="absolute bottom-4 right-3 z-[999] px-3 py-2 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 pointer-events-auto max-w-[270px]">
          <div
            className="flex items-center justify-between cursor-pointer font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
          >
            <span>Convective Reflectivity & Assets</span>
            <span className="text-sky-600 dark:text-sky-400 ml-2 font-mono">[{isLegendOpen ? '−' : '+'}]</span>
          </div>

          {isLegendOpen && (
            <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-300"></span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Severe Core (Siren Hook)</span>
                </div>
                <span className="text-red-600 dark:text-red-400 font-mono font-bold">&gt; 50 dBZ</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300"></span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Moderate Storm</span>
                </div>
                <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">38–50 dBZ</span>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-sky-500"></span>
                  <span>IGI Airport</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-red-500"></span>
                  <span>AIIMS</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-amber-500"></span>
                  <span>Power Grid</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Sleek Time-Travel Replay Control Bar Docked at Bottom of Map */}
      <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 z-10">
        <TimelineSlider
          currentOffset={timeOffset}
          onOffsetChange={setTimeOffset}
          isLive={timeOffset === 0}
        />
      </div>
    </div>
  );
};

export default MapView;
