import React from 'react';
import { Layers, Eye, EyeOff, Radio, Zap, Navigation, ShieldAlert, CloudRain } from 'lucide-react';

export const LayerControlPanel = ({ layerVisibility, onToggleLayer }) => {
  const layerConfigs = [
    { key: 'radar', label: 'Doppler Radar Reflectivity', icon: <CloudRain className="w-4 h-4 text-emerald-400" /> },
    { key: 'lightning', label: 'Lightning Strikes & Risk Grid', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { key: 'stormCells', label: 'AI Storm Cells & Path Vectors', icon: <Navigation className="w-4 h-4 text-red-400" /> },
    { key: 'stations', label: 'AWS Weather Stations', icon: <Radio className="w-4 h-4 text-sky-400" /> },
    { key: 'warnings', label: 'CAP Alert Warning Zones', icon: <ShieldAlert className="w-4 h-4 text-orange-400" /> },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
        <Layers className="w-4 h-4 text-sky-400" />
        <span>Map GIS Layers</span>
      </div>

      <div className="space-y-2">
        {layerConfigs.map((layer) => {
          const isActive = layerVisibility[layer.key];

          return (
            <button
              key={layer.key}
              onClick={() => onToggleLayer(layer.key)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition ${
                isActive
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-sm'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {layer.icon}
                <span>{layer.label}</span>
              </div>
              {isActive ? (
                <Eye className="w-4 h-4 text-sky-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
