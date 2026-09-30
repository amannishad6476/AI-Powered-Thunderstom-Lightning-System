import React from 'react';
import { CircleMarker, Popup, Circle } from 'react-leaflet';
import { Zap } from 'lucide-react';
import { formatLocalIST } from '../../utils/dateUtils';

export const LightningLayer = ({ strikes = [], riskGrid = [], showHeatmap = true, visible = true }) => {
  if (!visible) return null;

  return (
    <>
      {/* Predictive Lightning Risk Zones */}
      {showHeatmap &&
        riskGrid.map((gridCell, idx) => (
          <Circle
            key={`risk-${idx}`}
            center={[gridCell.lat, gridCell.lon]}
            radius={5000}
            pathOptions={{
              color: gridCell.probability > 0.7 ? '#ef4444' : '#f59e0b',
              fillColor: gridCell.probability > 0.7 ? '#ef4444' : '#f59e0b',
              fillOpacity: gridCell.probability * 0.4,
              weight: 0,
            }}
          />
        ))}

      {/* Observed / Real-time Lightning Strike Flashes */}
      {strikes.map((strike) => {
        const isCG = strike.strike_type === 'CG';
        const strokeColor = isCG ? '#b45309' : '#0284c7';

        return (
          <CircleMarker
            key={strike.id}
            center={[strike.latitude, strike.longitude]}
            radius={isCG ? 7 : 5}
            pathOptions={{
              color: strokeColor,
              fillColor: isCG ? '#f59e0b' : '#38bdf8',
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-slate-800 dark:text-slate-200">
                <div className="flex items-center space-x-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span>{strike.strike_type === 'CG' ? 'Cloud-to-Ground Strike' : 'Intra-Cloud Flash'}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <p><strong>Peak Current:</strong> {strike.amplitude_ka} kA</p>
                  <p><strong>Time:</strong> {formatLocalIST(strike.timestamp)}</p>
                  <p><strong>Confidence:</strong> {Math.round(strike.confidence * 100)}%</p>
                  <p><strong>Coordinates:</strong> {strike.latitude.toFixed(3)}°N, {strike.longitude.toFixed(3)}°E</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

export default LightningLayer;
