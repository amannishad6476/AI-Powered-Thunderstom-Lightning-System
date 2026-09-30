import React, { useEffect } from 'react';
import { Circle, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { MapPin, Navigation, ShieldCheck, ShieldAlert, Compass, Activity } from 'lucide-react';
import { getNearestStormCell } from '../../utils/geoUtils';

/**
 * Controller to smoothly pan/fly map to user coordinates when requested
 */
export function FlyToLocation({ coordinates, triggerRecenter }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates[0] && coordinates[1] && triggerRecenter) {
      map.flyTo(coordinates, 12, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [coordinates, triggerRecenter, map]);

  return null;
}

/**
 * Live GPS User Location Marker with Accuracy Halo & Convective Hazard Telemetry
 */
export const UserLocationMarker = ({
  location,
  stormCells = [],
  triggerRecenter = 0,
}) => {
  if (!location || !location.latitude || !location.longitude) return null;

  const lat = location.latitude;
  const lng = location.longitude;
  const accuracy = Math.round(location.accuracy || 20);

  // Compute nearest active convective cell to the user
  const nearestCell = getNearestStormCell(lat, lng, stormCells);
  const isNearDanger = nearestCell && nearestCell.distanceKm <= 25;

  return (
    <>
      <FlyToLocation coordinates={[lat, lng]} triggerRecenter={triggerRecenter} />

      {/* GPS Accuracy Radius Circle */}
      <Circle
        center={[lat, lng]}
        radius={Math.max(accuracy, 100)}
        pathOptions={{
          color: isNearDanger ? '#ef4444' : '#0284c7',
          fillColor: isNearDanger ? '#f87171' : '#38bdf8',
          fillOpacity: 0.12,
          weight: 1,
          dashArray: '3, 4',
        }}
      />

      {/* Outer Pulse Ring */}
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{
          color: isNearDanger ? '#ef4444' : '#0284c7',
          fillColor: isNearDanger ? '#f87171' : '#38bdf8',
          fillOpacity: 0.3,
          weight: 1.5,
        }}
      />

      {/* Core Center GPS Dot */}
      <CircleMarker
        center={[lat, lng]}
        radius={7}
        pathOptions={{
          color: '#ffffff',
          fillColor: isNearDanger ? '#dc2626' : '#0284c7',
          fillOpacity: 1,
          weight: 2.5,
        }}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
          <div className="text-xs font-sans font-semibold space-y-0.5">
            <div className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Your Live GPS Position</span>
            </div>
            {nearestCell ? (
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Nearest storm: <strong>{nearestCell.cell_id}</strong> ({nearestCell.distanceKm} km {nearestCell.bearing})
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Scanning local atmosphere...</div>
            )}
          </div>
        </Tooltip>

        {/* Rich Interactive Location Popup */}
        <Popup className="custom-storm-popup" maxWidth={320}>
          <div className="p-2 space-y-2.5 font-sans text-xs text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-sky-700 dark:text-sky-400">
                <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Live GPS Device Telemetry</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                LIVE
              </span>
            </div>

            {/* Coordinates & Accuracy */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Coordinates</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                </div>
              </div>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">GPS Accuracy</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  ±{accuracy} meters
                </div>
              </div>
            </div>

            {/* Proximity Risk Analysis */}
            {nearestCell ? (
              <div
                className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                  isNearDanger
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  {isNearDanger ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  )}
                  <span>
                    {isNearDanger
                      ? 'Convective Danger Zone Alert'
                      : 'Atmospheric Proximity Normal'}
                  </span>
                </div>
                <div className="text-[11px] leading-tight">
                  Nearest storm cell <strong>{nearestCell.cell_id}</strong> is{' '}
                  <strong>{nearestCell.distanceKm} km</strong> ({nearestCell.bearing}) away with{' '}
                  <strong>{nearestCell.dbz || 45} dBZ</strong> reflectivity.
                </div>
              </div>
            ) : (
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                No active storm cells currently detected in immediate radar range.
              </div>
            )}
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
};

export default UserLocationMarker;
