import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { formatOffsetLabel } from '../../utils/dateUtils';

const TIME_STEPS = [-30, -15, 0, 15, 30, 45, 60, 90, 120];

export const TimelineControls = ({ currentOffset, onOffsetChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // ms per step

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onOffsetChange((prev) => {
          const currentIndex = TIME_STEPS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % TIME_STEPS.length;
          return TIME_STEPS[nextIndex];
        });
      }, playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, onOffsetChange]);

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md dark:shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2.5 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-950'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span className="text-xs">{isPlaying ? 'Pause' : 'Play Loop'}</span>
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onOffsetChange(0);
          }}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 cursor-pointer"
          title="Reset to Live (T+0)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1.5 ml-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatOffsetLabel(currentOffset)}</span>
        </div>
      </div>

      {/* Step Buttons / Slider */}
      <div className="flex-1 flex items-center space-x-1.5 overflow-x-auto w-full max-w-xl py-1">
        {TIME_STEPS.map((step) => {
          const isSelected = currentOffset === step;
          const isObserved = step <= 0;

          return (
            <button
              key={step}
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(step);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-bold shadow-md shadow-sky-500/30'
                  : isObserved
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-transparent'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50'
              }`}
            >
              {step === 0 ? 'T0 (Live)' : step > 0 ? `+${step}m` : `${step}m`}
            </button>
          );
        })}
      </div>

      {/* Playback speed toggle */}
      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
        <FastForward className="w-3.5 h-3.5" />
        <button
          onClick={() => setPlaybackSpeed(playbackSpeed === 1500 ? 800 : 1500)}
          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          {playbackSpeed === 1500 ? '1x' : '2x'}
        </button>
      </div>
    </div>
  );
};

export default TimelineControls;
