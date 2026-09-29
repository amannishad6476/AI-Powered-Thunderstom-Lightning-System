import React from 'react';
import { CloudLightning, RefreshCw, ShieldAlert, Cpu, Radio, CheckCircle2, MapPin } from 'lucide-react';
import { formatLocalIST, formatUTC } from '../../utils/dateUtils';

/**
 * Modern dark-themed Top Header for SIH26072 Nowcasting System
 */
export const Header = ({
  onRefresh,
  isRefreshing = false,
  systemStatus = 'OPERATIONAL',
  regionName = 'National Capital Region (Delhi NCR)',
  lastUpdated = new Date().toISOString(),
  activeAlertCount = 0,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
      {/* Title & Branding */}
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-gradient-to-br from-amber-500 via-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white flex items-center justify-center">
          <CloudLightning className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>⚡</span>
              <span className="bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
                SIH26072: AIML Thunderstorm & Lightning Nowcasting System
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono">
              v1.0.0
            </span>
          </div>

          {/* Region and Subtitle */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{regionName}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>0–3h Convective Storm & Lightning Hazard Predictor</span>
          </div>
        </div>
      </div>

      {/* Real-time Status Indicators & Controls */}
      <div className="flex items-center space-x-3 flex-wrap">
        {/* System Operational Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/70 text-xs shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-medium">System:</span>
          <span className="font-bold text-emerald-400 tracking-wide">{systemStatus}</span>
        </div>

        {/* Last Updated Timestamp */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/70 text-xs">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-slate-400">Updated:</span>
          <span className="text-slate-200 font-mono font-semibold">
            {formatLocalIST(lastUpdated)} IST
          </span>
        </div>

        {/* Active Alert Pill if any */}
        {activeAlertCount > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse shadow-lg shadow-red-950/40">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeAlertCount} Severe Warnings</span>
          </div>
        )}

        {/* Refresh Action Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 hover:text-white transition disabled:opacity-50 text-xs font-semibold shadow-md"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          <span className="hidden md:inline">{isRefreshing ? 'Fetching...' : 'Live Sync'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
