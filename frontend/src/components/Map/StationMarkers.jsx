import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { Radio, Wind, Droplets, Thermometer } from 'lucide-react';

export const StationMarkers = ({ stations = [], visible = true }) => {
  if (!visible) return null;

  return (
    <>
      {stations.map((station) => (
        <CircleMarker
          key={station.station_code}
          center={[station.latitude, station.longitude]}
          radius={6}
          pathOptions={{
            color: '#38bdf8',
            fillColor: '#0369a1',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <div className="p-1 space-y-1.5 text-xs text-slate-200 min-w-[200px]">
              <div className="flex items-center space-x-1 font-bold text-sky-400 border-b border-slate-700 pb-1">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>{station.station_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-3 h-3 text-red-400" />
                  <span>{station.temperature_c}°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{station.relative_humidity_pct}% RH</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wind className="w-3 h-3 text-teal-400" />
                  <span>{station.wind_speed_kmh} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400">Rain: </span>
                  <span className="font-semibold text-amber-300">{station.rain_rate_mm_hr} mm/h</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                CAPE: <span className="text-amber-400 font-semibold">{station.cape_index} J/kg</span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};
