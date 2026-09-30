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
  ShieldCheck,
  Clock,
  Gauge,
  Layers,
  MapPin,
  Navigation,
  Crosshair,
  LocateFixed,
  BellRing,
  Building2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

/**
 * Convective Telemetry & Risk Intelligence Side Panel
 * Clean, flat, simple meteorological metrics layout with live GPS stats,
 * automated emergency siren hooks, and critical infrastructure dispatch flags.
 */
export const SidePanel = ({
  forecastData,
  onSelectCell,
  selectedCellId,
  userLocation,
  userTelemetry,
  gpsLocality,
  isGpsTracking,
  isGpsLocating,
  onEnableGps,
}) => {
  if (!forecastData) {
    return (
      <aside className="w-full lg:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <Activity className="w-6 h-6 text-sky-600 dark:text-sky-400 animate-spin" />
        <span className="text-xs font-medium">Ingesting radar & satellite telemetry...</span>
      </aside>
    );
  }

  const {
    thunderstorm_probability = '85%',
    lightning_risk_level = 'Severe',
    active_storm_cells = [],
    multi_radar_inputs,
    satellite_inputs,
    nowcast_summary,
    emergency_siren_trigger,
    critical_asset_impacts = [],
    emergency_dispatch_flags = [],
  } = forecastData;

  const isRegionalSevere =
    lightning_risk_level.toLowerCase().includes('severe') ||
    lightning_risk_level.toLowerCase().includes('critical') ||
    lightning_risk_level.toLowerCase().includes('high');
  const regionalProbNum = parseInt(thunderstorm_probability, 10) || 85;
  const maxDbz = multi_radar_inputs?.composite_max_dbz || 56.4;

  const isSirenActive = emergency_siren_trigger?.siren_triggered;
  const sirenLevel = emergency_siren_trigger?.siren_level || 'NORMAL_SURVEILLANCE';
  const dispatchList = emergency_dispatch_flags.length > 0
    ? emergency_dispatch_flags
    : emergency_siren_trigger?.dispatch_flags || [];

  return (
    <aside className="w-full lg:w-[400px] flex flex-col gap-3 overflow-y-auto pr-0.5 pb-2">
      {/* 0. Automated Siren & Critical Infrastructure Emergency Hook Card */}
      {isSirenActive && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3.5 space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900 pb-2">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 font-bold text-xs">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>EMERGENCY SIREN HOOK ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white">
              {sirenLevel.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="text-[11px] text-red-900 dark:text-red-200 leading-relaxed font-medium">
            {emergency_siren_trigger?.emergency_broadcast_text ||
              'Severe convective core exceeding 50 dBZ intersecting urban infrastructure polygons with ETA < 15 min.'}
          </div>

          {/* Active Emergency Dispatch Flags */}
          {dispatchList.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Automated Dispatch Flags Triggered:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dispatchList.map((flag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Live GPS Location Intelligence Section (When GPS is active) */}
      {userLocation && userTelemetry ? (
        <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/80 rounded-xl p-4 space-y-3 transition-colors">
          {/* Live GPS Header Banner */}
          <div className="flex items-center justify-between gap-2 border-b border-sky-200/80 dark:border-sky-800/60 pb-2">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-sky-800 dark:text-sky-300">
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span className="truncate">{gpsLocality || 'My Live Location'}</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>GPS ±{userTelemetry.accuracyMeters}m</span>
            </div>
          </div>

          {/* Coordinates Subtext */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <span>
              {userTelemetry.latitude.toFixed(4)}°N, {userTelemetry.longitude.toFixed(4)}°E
            </span>
            {userTelemetry.speedKmh !== null && (
              <span>Speed: {userTelemetry.speedKmh} km/h</span>
            )}
          </div>

          {/* Localized Metrics: Probability at your GPS position & Nearest Storm Distance */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Local Thunderstorm Probability */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Local Strike Risk</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {userTelemetry.localProbability}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(userTelemetry.localProbabilityNum, 100)}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">At your coordinates</div>
            </div>

            {/* Nearest Storm Cell Proximity */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <Flame className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span>Nearest Storm</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
                {userTelemetry.nearestCell ? `${userTelemetry.nearestCell.distanceKm}` : 'Safe'}
                {userTelemetry.nearestCell && <span className="text-xs font-normal text-slate-500"> km</span>}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{
                    width: `${
                      userTelemetry.nearestCell
                        ? Math.max(10, Math.min(100, 100 - userTelemetry.nearestCell.distanceKm * 1.5))
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {userTelemetry.nearestCell
                  ? `${userTelemetry.nearestCell.cell_id} (${userTelemetry.nearestCell.bearing})`
                  : 'No cells within 60km'}
              </div>
            </div>
          </div>

          {/* Local Parameter Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <span>Local Rain:</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                {userTelemetry.localPrecipMmHr} mm/h
              </span>
            </div>

            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span>Local Wind:</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                {userTelemetry.localWindGustKmh} km/h
              </span>
            </div>

            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Core ETA:</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                {userTelemetry.estimatedEtaMin ? `~${userTelemetry.estimatedEtaMin} min` : 'Past / None'}
              </span>
            </div>

            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Peak Local:</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                {userTelemetry.localReflectivityDbz} dBZ
              </span>
            </div>
          </div>

          {/* Local Proximity Advisory Banner */}
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 ${
              userTelemetry.isSevere
                ? 'bg-red-100/70 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-300'
                : 'bg-emerald-100/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300'
            }`}
          >
            {userTelemetry.isSevere ? (
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="leading-tight text-[11px] font-medium">
              {userTelemetry.safetyDirective}
            </div>
          </div>
        </div>
      ) : (
        /* Prompt banner to enable live GPS */
        <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              View local storm & strike stats for your exact location
            </span>
          </div>
          <button
            onClick={onEnableGps}
            disabled={isGpsLocating}
            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold text-[11px] whitespace-nowrap cursor-pointer transition-colors"
          >
            {isGpsLocating ? 'Locating...' : 'Enable GPS'}
          </button>
        </div>
      )}

      {/* 2. Regional Meteorological Grid Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5 transition-colors">
        {/* Risk Level Badge Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Regional Atmospheric Hazard</span>
          </span>
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${
              isRegionalSevere
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{lightning_risk_level.toUpperCase()} RISK</span>
          </div>
        </div>

        {/* Regional Composite Probability & Reflectivity */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Regional Prob.</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {thunderstorm_probability}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(regionalProbNum, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Regional convective zone</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>Max Radar Echo</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
              {maxDbz} <span className="text-xs font-normal text-slate-500">dBZ</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${Math.min((maxDbz / 70) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Severe threshold &gt; 50 dBZ</div>
          </div>
        </div>

        {/* Multi-Sensor Grid: CAPE, CIN, Wind Gusts, Rain Rate */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>CAPE Index:</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {nowcast_summary?.cape_j_kg || 2840} J/kg
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <Wind className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>Peak Gust:</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {nowcast_summary?.peak_wind_gust_kmh || 76.5} km/h
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span>Rain Rate:</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {nowcast_summary?.expected_precipitation_mm_hr || 48.0} mm/h
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span>Storm ETA:</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {nowcast_summary?.estimated_arrival_minutes || 15} min
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Storm Cells Tracked List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
            <span>Active Convective Cells ({active_storm_cells.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Select to track</span>
        </div>

        <div className="space-y-2">
          {active_storm_cells.map((cell) => {
            const isCellSevere = (cell.intensity || '').toLowerCase().includes('severe') || (cell.dbz || 0) >= 50;
            const isSelected = selectedCellId === cell.cell_id;

            return (
              <div
                key={cell.cell_id}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-slate-800 border-sky-500'
                    : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                }`}
                onClick={() => onSelectCell && onSelectCell(cell)}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {cell.cell_id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isCellSevere
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                          : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900'
                      }`}
                    >
                      {cell.intensity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{cell.radius_km} km radius</span>
                    <span>•</span>
                    <span>{cell.speed_kmh} km/h {cell.direction}</span>
                  </div>
                </div>

                <div className="text-right pl-2">
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{cell.dbz} dBZ</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cell.cloud_top_height_km} km top</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Emergency Warnings Banner */}
      {nowcast_summary?.severe_hazard_warnings && nowcast_summary.severe_hazard_warnings.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3.5 text-xs space-y-2 transition-colors">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="uppercase tracking-wider">Operational Hazard Directives</span>
          </div>
          <ul className="space-y-1 pl-4 list-disc text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
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
