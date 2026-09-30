import React from 'react';
import { CloudLightning, RefreshCw, ShieldAlert, Radio, MapPin, Activity, Globe, Compass, Sun, Moon, LocateFixed } from 'lucide-react';
import { formatLocalIST } from '../../utils/dateUtils';

/**
 * Enterprise Meteorological Top Header for AtmosGuard AI Nowcasting System
 * Clean, flat operational grid header with live GPS status indicators.
 */
export const Header = ({
  onRefresh,
  isRefreshing = false,
  systemStatus = 'OPERATIONAL',
  regionName = 'National Capital Region (Delhi NCR)',
  lastUpdated = new Date().toISOString(),
  activeAlertCount = 0,
  theme = 'light',
  onToggleTheme,
  userLocation,
  isGpsTracking,
  gpsLocality,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20 transition-colors duration-200">
      {/* Brand Identity & Subtext */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group">
          <div className="p-2 bg-gradient-to-br from-amber-500 via-sky-600 to-indigo-600 rounded-lg text-white flex items-center justify-center transition group-hover:scale-105">
            <CloudLightning className="w-5 h-5 sm:w-5 sm:h-5 text-amber-200" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-amber-600 via-sky-700 to-indigo-700 dark:from-amber-300 dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                ⚡ AtmosGuard AI: National Weather & Lightning Nowcasting System
              </span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 uppercase tracking-widest font-mono">
              Enterprise Grid
            </span>
          </div>

          {/* Subtext: Ministry of Earth Sciences Operational Grid */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ministry of Earth Sciences Operational Grid</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{regionName}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-500 dark:text-slate-400">0–3h Convective Storm & Lightning Hazard Predictor</span>
          </div>
        </div>
      </div>

      {/* Operational Status & Telemetry Actions */}
      <div className="flex items-center space-x-2.5 flex-wrap">
        {/* Live GPS Active Status Indicator */}
        {userLocation && (
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
            <LocateFixed className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-pulse" />
            <span>GPS: {userLocation.latitude.toFixed(3)}°N, {userLocation.longitude.toFixed(3)}°E</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        )}

        {/* System Operational Status */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden xs:inline">System:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-wide text-[11px] sm:text-xs">{systemStatus}</span>
        </div>

        {/* Live IST Timestamp */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <Radio className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-slate-500 dark:text-slate-400">Synced:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {formatLocalIST(lastUpdated)} IST
          </span>
        </div>

        {/* Active Alert Banner Pill */}
        {activeAlertCount > 0 ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{activeAlertCount} Warnings</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Hazard Normal</span>
          </div>
        )}

        {/* Live Sync Action Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white transition-colors disabled:opacity-50 text-xs font-semibold cursor-pointer"
          title="Force Sync Live Telemetry Stream"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-200' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
