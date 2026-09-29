import React from 'react';
import { AlertCircle, Clock, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import { getSeverityColor } from '../../utils/colorScales';
import { formatLocalIST } from '../../utils/dateUtils';

export const AlertFeed = ({ alerts = [] }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Active Severe Weather Warnings</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">CAP-1.2 Standard</span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          No severe weather warnings active in current viewport.
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const severity = getSeverityColor(alert.severity);

            return (
              <div
                key={alert.alert_id}
                className={`p-3 rounded-xl border ${severity.bg} ${severity.border} space-y-2 text-xs`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <AlertCircle className={`w-4 h-4 flex-shrink-0 ${severity.text}`} />
                    <span>{alert.headline}</span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{alert.description}</p>

                {alert.instruction && (
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-amber-300 text-[11px] font-medium">
                    ⚠️ {alert.instruction}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{alert.area_desc}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Expires: {formatLocalIST(alert.expires)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
