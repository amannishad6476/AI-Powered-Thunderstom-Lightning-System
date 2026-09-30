import React from 'react';
import { Activity, TrendingUp, CloudRain, Zap } from 'lucide-react';

export const MetricsPanel = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) return null;

  // Compute maximums for relative SVG bar graph heights
  const maxRain = Math.max(...timeline.map((t) => t.rain_rate_mm_hr || 0), 10);
  const maxDbz = Math.max(...timeline.map((t) => t.reflectivity_dbz || 0), 60);

  return (
    <div className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md dark:shadow-xl space-y-3 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>0–120 Min High-Res Nowcast Curves</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Rain (mm/h)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Lightning Prob</span>
          </div>
        </div>
      </div>

      {/* Responsive Bar / Trend Visualization */}
      <div className="pt-2">
        <div className="h-32 flex items-end space-x-2 sm:space-x-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {timeline.map((point, idx) => {
            const rainHeightPercent = Math.min(100, Math.round((point.rain_rate_mm_hr / maxRain) * 100));
            const probHeightPercent = Math.min(100, Math.round(point.lightning_probability * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 px-2 py-1 rounded shadow-lg text-[10px] z-50 whitespace-nowrap pointer-events-none">
                  <span className="text-sky-400 font-bold">{point.rain_rate_mm_hr} mm/h</span>
                  <span className="text-amber-400">{Math.round(point.lightning_probability * 100)}% lightning risk</span>
                </div>

                <div className="w-full flex items-end justify-center space-x-1 h-full">
                  {/* Rain Bar */}
                  <div
                    style={{ height: `${rainHeightPercent}%` }}
                    className="w-1/2 bg-sky-500/80 hover:bg-sky-500 rounded-t transition-all duration-300 min-h-[4px]"
                  />
                  {/* Lightning Risk Bar */}
                  <div
                    style={{ height: `${probHeightPercent}%` }}
                    className="w-1/2 bg-amber-500/80 hover:bg-amber-500 rounded-t transition-all duration-300 min-h-[4px]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Time Labels */}
        <div className="flex justify-between px-2 pt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          {timeline.map((point, idx) => (
            <span key={idx} className="text-center">
              {point.time_offset_min === 0 ? 'Now' : `+${point.time_offset_min}m`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
