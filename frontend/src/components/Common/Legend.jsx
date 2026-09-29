import React, { useState } from 'react';
import { DBZ_COLOR_SCALE } from '../../utils/colorScales';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const Legend = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-w-xs transition-all">
      <div
        className="flex items-center justify-between cursor-pointer font-semibold text-slate-200 mb-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Radar Reflectivity (dBZ)</span>
        </div>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          <div className="h-2.5 w-full rounded-sm flex overflow-hidden border border-slate-600 mb-2">
            {DBZ_COLOR_SCALE.map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: item.color }}
                className="flex-1 h-full"
                title={`${item.label}: ${item.desc}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#02fd02] inline-block" />
              <span>35-40: Moderate Rain</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fdfa02] inline-block" />
              <span>45-50: Thunderstorm</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fd0000] inline-block" />
              <span>55-60: Hail / Squall</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fd00fd] inline-block" />
              <span>&gt; 65: Severe Core</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
