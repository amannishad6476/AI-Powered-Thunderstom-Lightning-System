import React from 'react';
import { Zap, CloudRain, Wind, Flame, Gauge, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getSeverityColor } from '../../utils/colorScales';

export const RiskSummaryCard = ({ summary }) => {
  if (!summary) return null;

  const severity = getSeverityColor(summary.risk_level);
  const probPercent = Math.round(summary.lightning_strike_probability * 100);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header Risk Banner */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Current Atmospheric Risk
        </span>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${severity.bg} ${severity.text} ${severity.border}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{summary.risk_level} HAZARD</span>
        </div>
      </div>

      {/* Main Metric: Lightning Probability Gauge */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Lightning Strike Probability (0–60m)</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {probPercent}%
          </div>
          <div className="text-[11px] text-slate-400">
            High-density ground discharge hazard detected
          </div>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-amber-400 transition-all duration-1000 ease-out"
              strokeDasharray={`${probPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Zap className="w-5 h-5 text-amber-400 absolute" />
        </div>
      </div>

      {/* Grid of Thermodynamic and Radar Parameters */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Precipitation Rate */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>Rainfall Rate</span>
          </div>
          <div className="text-lg font-bold text-slate-100">
            {summary.precipitation_rate_mm_hr} <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
        </div>

        {/* Max dBZ */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Reflectivity</span>
          </div>
          <div className="text-lg font-bold text-slate-100">
            {summary.reflectivity_dbz} <span className="text-xs font-normal text-slate-400">dBZ</span>
          </div>
        </div>

        {/* Wind Gusts */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Peak Wind Gust</span>
          </div>
          <div className="text-lg font-bold text-slate-100">
            {summary.wind_gust_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
        </div>

        {/* CAPE Index */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>CAPE Instability</span>
          </div>
          <div className="text-lg font-bold text-slate-100">
            {summary.cape_j_kg} <span className="text-xs font-normal text-slate-400">J/kg</span>
          </div>
        </div>
      </div>

      {/* Storm Arrival Lead Time */}
      {summary.storm_arrival_time_min && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs">
          <span className="text-indigo-300 font-medium">Estimated Storm Cell Core Arrival:</span>
          <span className="font-bold text-indigo-200 font-mono">+{summary.storm_arrival_time_min} mins</span>
        </div>
      )}
    </div>
  );
};
