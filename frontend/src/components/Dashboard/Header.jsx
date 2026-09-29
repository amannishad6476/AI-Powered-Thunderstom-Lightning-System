import React from 'react';
import { CloudLightning, Radio, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { formatLocalIST } from '../../utils/dateUtils';

export const Header = ({ onRefresh, isRefreshing, activeAlertCount = 0 }) => {
  const currentTime = new Date().toISOString();

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Branding */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white">
          <CloudLightning className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              AI Thunderstorm & Lightning Nowcasting
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              SIH26072
            </span>
          </div>
          <p className="text-xs text-slate-400">
            0–3 Hour High-Resolution Convective Storm & Lightning Hazard Predictor
          </p>
        </div>
      </div>

      {/* Real-time Status Indicators & Actions */}
      <div className="flex items-center space-x-4">
        {/* Model Engine Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Inference:</span>
          <span className="font-semibold text-emerald-400">ConvLSTM + XGBoost</span>
        </div>

        {/* Live Stream Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono">{formatLocalIST(currentTime)}</span>
        </div>

        {/* Active Alerts Pill */}
        {activeAlertCount > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeAlertCount} Critical Warnings</span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
          title="Refresh Nowcasting Feed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
