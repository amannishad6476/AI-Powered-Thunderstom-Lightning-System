import React from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { CloudRain, Radio, Satellite, Wind, Zap, Navigation, Activity } from 'lucide-react';

/**
 * Interactive Leaflet Map component centered around Delhi NCR.
 * Renders circular storm cell zones colored and sized by severity/dBZ,
 * real-time lightning strikes streamed over WebSockets,
 * and rich popups with radar/satellite convective parameters.
 */
export const MapView = ({
  center = [28.7041, 77.1025], // Delhi NCR Coordinates
  zoom = 9,
  stormCells = [],
  multiRadarInputs = null,
  satelliteInputs = null,
  latestStrikes = [],
  regionName = 'National Capital Region (Delhi NCR)',
}) => {
  // Helper to determine styling based on storm cell intensity and dBZ
  const getCellStyling = (cell) => {
    const intensityStr = (cell.intensity || '').toLowerCase();
    const dbz = cell.dbz || 0;

    if (intensityStr.includes('severe') || intensityStr.includes('extreme') || dbz >= 50) {
      return {
        color: '#ef4444', // Red
        fillColor: '#dc2626',
        fillOpacity: 0.35,
        weight: 2.5,
        badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
        badgeText: 'SEVERE STORM CELL',
        glowColor: 'shadow-red-500/50',
      };
    } else if (intensityStr.includes('moderate') || dbz >= 38) {
      return {
        color: '#f97316', // Orange
        fillColor: '#ea580c',
        fillOpacity: 0.28,
        weight: 2,
        badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        badgeText: 'MODERATE STORM CELL',
        glowColor: 'shadow-orange-500/50',
      };
    } else {
      return {
        color: '#eab308', // Yellow
        fillColor: '#ca8a04',
        fillOpacity: 0.22,
        weight: 1.5,
        badgeBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        badgeText: 'DEVELOPING CONVECTION',
        glowColor: 'shadow-yellow-500/50',
      };
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        {/* Standard CartoDB Dark Matter Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {/* 1. Render Circular Storm Cell Zones */}
        {stormCells.map((cell) => {
          const style = getCellStyling(cell);
          const radiusMeters = (cell.radius_km || 15) * 1000;

          return (
            <React.Fragment key={cell.cell_id || `${cell.lat}-${cell.lng}`}>
              {/* Outer Convective Hazard Footprint Circle */}
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
                    <div className="text-white font-bold">{cell.cell_id}</div>
                    <div className="text-amber-300">{cell.intensity}</div>
                    <div className="text-slate-300">Radius: {cell.radius_km} km</div>
                  </div>
                </Tooltip>

                {/* Rich Leaflet Popup with Radar and Satellite Convective Telemetry */}
                <Popup className="custom-storm-popup" maxWidth={340} minWidth={280}>
                  <div className="p-2 space-y-3 font-sans text-slate-200">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-100">{cell.cell_id}</div>
                          <div className="text-[11px] text-slate-400">
                            Lat: {cell.lat.toFixed(4)}°, Lng: {cell.lng.toFixed(4)}°
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badgeBg}`}>
                        {style.badgeText}
                      </span>
                    </div>

                    {/* Convective Cell Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-700/60">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-red-400" />
                          <span>Max Reflectivity</span>
                        </div>
                        <div className="text-sm font-bold text-slate-100 font-mono">
                          {cell.dbz || 50.0} <span className="text-[10px] text-slate-400">dBZ</span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-700/60">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-sky-400" />
                          <span>Coverage Radius</span>
                        </div>
                        <div className="text-sm font-bold text-slate-100 font-mono">
                          {cell.radius_km} <span className="text-[10px] text-slate-400">km</span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-700/60">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-emerald-400" />
                          <span>Motion Vector</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-100">
                          {cell.speed_kmh} km/h • {cell.direction}
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-700/60">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Wind className="w-3 h-3 text-indigo-400" />
                          <span>Cloud-Top Echo</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-100 font-mono">
                          {cell.cloud_top_height_km} km
                        </div>
                      </div>
                    </div>

                    {/* Multi-Radar Inputs Section */}
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex items-center space-x-1.5 font-semibold text-sky-400">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Multi-Radar Doppler Ingestion</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Stations:</span>{' '}
                        {multiRadarInputs?.active_stations?.join(', ') || 'Delhi Palam DWR (S-Band), Mausam Bhavan DWR'}
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>
                          <span className="text-slate-400">Composite Max:</span>{' '}
                          <strong className="text-red-400">{multiRadarInputs?.composite_max_dbz || cell.dbz} dBZ</strong>
                        </span>
                        <span>
                          <span className="text-slate-400">Scans:</span>{' '}
                          {multiRadarInputs?.elevation_scans_deg ? `${multiRadarInputs.elevation_scans_deg.length} tilts` : '6 tilts (0.5°-15°)'}
                        </span>
                      </div>
                    </div>

                    {/* Satellite Inputs Section */}
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex items-center space-x-1.5 font-semibold text-indigo-400">
                        <Satellite className="w-3.5 h-3.5" />
                        <span>INSAT-3DR Satellite Telemetry</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Channels:</span>{' '}
                        {satelliteInputs?.channels?.join(', ') || 'TIR-1 (10.8 µm), MIR (3.9 µm), WV (6.7 µm)'}
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>
                          <span className="text-slate-400">Cloud-Top Temp:</span>{' '}
                          <strong className="text-indigo-300">{satelliteInputs?.cloud_top_temp_kelvin || 204.5} K</strong>
                        </span>
                        <span className="text-amber-400 font-medium">
                          {satelliteInputs?.overshooting_tops ? '⚡ Overshooting Tops' : 'Convective Core'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>

              {/* Storm Cell Core Centroid Marker */}
              <CircleMarker
                center={[cell.lat, cell.lng]}
                radius={6}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: style.color,
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* 2. Real-Time Lightning Strike Pulses */}
        {latestStrikes.slice(0, 15).map((strike) => (
          <CircleMarker
            key={strike.id || `${strike.lat}-${strike.lng}-${Math.random()}`}
            center={[strike.lat, strike.lng]}
            radius={5}
            pathOptions={{
              color: '#fef08a',
              fillColor: strike.strike_type === 'CG' ? '#eab308' : '#38bdf8',
              fillOpacity: 0.9,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -5]}>
              <div className="text-[10px] font-bold text-amber-300 font-mono">
                ⚡ {strike.strike_type} Strike ({strike.amplitude_ka} kA)
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Floating Map Legend & Region Pill */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs font-semibold text-slate-200 flex items-center space-x-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span>{regionName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {stormCells.length} Active Storm Cells
          </span>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] px-3.5 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs space-y-1.5 pointer-events-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Cell Severity & Reflectivity
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-300"></span>
            <span className="text-slate-300">Severe (&gt;50 dBZ)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300"></span>
            <span className="text-slate-300">Moderate (38–50 dBZ)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200"></span>
            <span className="text-slate-300">Light (&lt;38 dBZ)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
