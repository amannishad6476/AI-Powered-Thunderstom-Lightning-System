import React from 'react';
import {
  Zap,
  Activity,
  Flame,
  Radio,
  Satellite,
  Wind,
  CloudRain,
  ShieldAlert,
  Clock,
  Gauge,
  Layers,
  ChevronRight,
} from 'lucide-react';

/**
 * Side panel displaying active summary stats:
 * - Thunderstorm Probability (e.g. 85%)
 * - Lightning Risk Level (Severe/Moderate)
 * - Multi-Radar composite max dBZ (e.g. 56.4 dBZ)
 * - Multi-radar and satellite telemetry breakdown
 */
export const SidePanel = ({ forecastData, onSelectCell }) => {
  if (!forecastData) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
        Loading nowcasting telemetry...
      </div>
    );
  }

  const {
    thunderstorm_probability = '85%',
    lightning_risk_level = 'Severe',
    active_storm_cells = [],
    multi_radar_inputs,
    satellite_inputs,
    nowcast_summary,
  } = forecastData;

  const isSevere = lightning_risk_level.toLowerCase().includes('severe') || lightning_risk_level.toLowerCase().includes('critical') || lightning_risk_level.toLowerCase().includes('high');
  const probNum = parseInt(thunderstorm_probability, 10) || 85;
  const maxDbz = multi_radar_inputs?.composite_max_dbz || 56.4;

  return (
    <aside className="w-full lg:w-[410px] flex flex-col gap-4 overflow-y-auto pr-1">
      {/* 1. Primary Risk Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Risk Level Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Atmospheric Hazard Level
          </span>
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-lg ${
              isSevere
                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-950/50 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-950/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{lightning_risk_level.toUpperCase()} RISK</span>
          </div>
        </div>

        {/* Big Metrics Grid: Thunderstorm Probability & Composite dBZ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Thunderstorm Probability Card */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Thunderstorm Prob.</span>
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {thunderstorm_probability}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(probNum, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400">High lightning strike potential</div>
          </div>

          {/* Multi-Radar Composite Max dBZ Card */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 relative overflow-hidden group hover:border-red-500/40 transition">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Max Reflectivity</span>
            </div>
            <div className="text-3xl font-black text-red-400 font-mono tracking-tight">
              {maxDbz} <span className="text-sm font-normal text-slate-400">dBZ</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((maxDbz / 75) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400">Multi-radar composite max</div>
          </div>
        </div>

        {/* Secondary Parameters: Rain, Gusts, CAPE, Arrival */}
        {nowcast_summary && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>Rain Rate:</span>
              </div>
              <span className="font-bold text-slate-100">
                {nowcast_summary.expected_precipitation_mm_hr || 48.0} mm/h
              </span>
            </div>

            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind Gusts:</span>
              </div>
              <span className="font-bold text-slate-100">
                {nowcast_summary.peak_wind_gust_kmh || 76.5} km/h
              </span>
            </div>

            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>CAPE:</span>
              </div>
              <span className="font-bold text-slate-100">
                {nowcast_summary.cape_j_kg || 2840} J/kg
              </span>
            </div>

            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>ETA:</span>
              </div>
              <span className="font-bold text-amber-300 font-mono">
                +{nowcast_summary.estimated_arrival_minutes || 20} min
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Multi-Radar & Satellite Input Sources Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Multi-Radar & Satellite Inputs</span>
        </div>

        {/* Doppler Radar Network */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-sky-400">
              <Radio className="w-4 h-4" />
              <span>Doppler Radar Network</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              10m Cycle
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-1">
            <div className="text-[11px] text-slate-400">Active Radar Stations:</div>
            <ul className="space-y-1 text-[11px] pl-2 border-l-2 border-sky-500/30">
              {(multi_radar_inputs?.active_stations || [
                'Delhi Palam DWR (S-Band)',
                'Mausam Bhavan DWR (C-Band)',
                'Jaipur Regional DWR',
              ]).map((station, i) => (
                <li key={i} className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>{station}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Satellite Feed */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-indigo-400">
              <Satellite className="w-4 h-4" />
              <span>{satellite_inputs?.satellite_source || 'INSAT-3DR / INSAT-3D Multispectral'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
              15m Scans
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Channels Ingested</div>
              <div className="font-semibold text-slate-200">TIR-1, MIR, WV</div>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Cloud-Top Temp</div>
              <div className="font-semibold text-indigo-300">
                {satellite_inputs?.cloud_top_temp_kelvin || 204.5} K
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Active Storm Cells Tracked List */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span>Active Storm Cells ({active_storm_cells.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Tap on map to inspect</span>
        </div>

        <div className="space-y-2">
          {active_storm_cells.map((cell) => {
            const isCellSevere = (cell.intensity || '').toLowerCase().includes('severe') || (cell.dbz || 0) >= 50;

            return (
              <div
                key={cell.cell_id}
                className="p-3 bg-slate-950/70 hover:bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
                onClick={() => onSelectCell && onSelectCell(cell)}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-200">{cell.cell_id}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isCellSevere
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      }`}
                    >
                      {cell.intensity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Radius: {cell.radius_km} km</span>
                    <span>•</span>
                    <span>Motion: {cell.speed_kmh} km/h {cell.direction}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black font-mono text-slate-100">{cell.dbz} dBZ</div>
                  <div className="text-[10px] text-slate-400">{cell.cloud_top_height_km} km top</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Warnings Banner */}
      {nowcast_summary?.severe_hazard_warnings && (
        <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-4 text-xs space-y-2 shadow-xl">
          <div className="flex items-center space-x-2 text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Severe Weather Alerts</span>
          </div>
          <ul className="space-y-1.5 pl-4 list-disc text-slate-300 text-[11px]">
            {nowcast_summary.severe_hazard_warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default SidePanel;
