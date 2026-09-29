import React from 'react';
import { Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Navigation, Flame } from 'lucide-react';
import { getSeverityColor } from '../../utils/colorScales';

export const StormCellTracker = ({ stormCells = [], visible = true }) => {
  if (!visible) return null;

  return (
    <>
      {stormCells.map((cell) => {
        const severityColor = getSeverityColor(cell.severity_level);
        
        // Build trajectory line points: [current, ...projected]
        const linePoints = [
          [cell.latitude, cell.longitude],
          ...cell.projected_track.map((pt) => [pt.latitude, pt.longitude]),
        ];

        return (
          <React.Fragment key={cell.cell_id}>
            {/* Projected Path Line */}
            <Polyline
              positions={linePoints}
              pathOptions={{
                color: severityColor.hex,
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.85,
              }}
            />

            {/* Current Storm Cell Centroid */}
            <CircleMarker
              center={[cell.latitude, cell.longitude]}
              radius={10}
              pathOptions={{
                color: severityColor.hex,
                fillColor: '#0f172a',
                fillOpacity: 0.9,
                weight: 3,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <span className="font-bold text-xs">{cell.cell_id} ({cell.max_reflectivity_dbz} dBZ)</span>
              </Tooltip>

              <Popup>
                <div className="p-1 space-y-1.5 text-xs text-slate-200 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-sky-400 flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1 text-red-500" />
                      {cell.cell_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${severityColor.bg} ${severityColor.text}`}>
                      {cell.severity_level}
                    </span>
                  </div>
                  <div><strong>Max Reflectivity:</strong> {cell.max_reflectivity_dbz} dBZ</div>
                  <div><strong>Cloud Top Height:</strong> {cell.cloud_top_height_km} km</div>
                  <div><strong>VIL Density:</strong> {cell.vil_kg_m2} kg/m²</div>
                  <div className="flex items-center space-x-1">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Speed / Heading:</strong> {cell.speed_kmh} km/h @ {cell.direction_deg}°</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Projected Step Markers */}
            {cell.projected_track.map((step, idx) => (
              <CircleMarker
                key={`${cell.cell_id}-step-${idx}`}
                center={[step.latitude, step.longitude]}
                radius={4}
                pathOptions={{
                  color: severityColor.hex,
                  fillColor: severityColor.hex,
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              >
                <Tooltip direction="right" offset={[5, 0]} opacity={0.8}>
                  <span className="text-[10px]">+{step.lead_time_min}m ({step.predicted_dbz} dBZ)</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};
