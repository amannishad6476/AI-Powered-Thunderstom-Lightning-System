import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radio,
  Sparkles,
  Zap,
  FastForward,
} from 'lucide-react';
import { formatOffsetLabel } from '../../utils/dateUtils';

export const TIMELINE_STEPS = [-60, -45, -30, -15, 0, 15, 30, 45, 60, 90, 120];

/**
 * Sleek, dark/light-compatible time-travel replay control component.
 * Allows meteorological operators to scrub through past radar history (-60m to 0m)
 * and future ConvLSTM nowcasting frames (+15m to +120m) to visualize storm evolution dynamically.
 */
export const TimelineSlider = ({
  currentOffset = 0,
  onOffsetChange,
  baseTimestamp = null,
  isLive = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5x, 1x, 2x, 4x
  const playTimerRef = useRef(null);

  // Playback Loop Timer
  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = Math.round(1400 / playbackSpeed);
      playTimerRef.current = setInterval(() => {
        onOffsetChange((prev) => {
          const currentIndex = TIMELINE_STEPS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % TIMELINE_STEPS.length;
          return TIMELINE_STEPS[nextIndex];
        });
      }, stepDurationMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, onOffsetChange]);

  // Step Forward / Backward handlers
  const handleStepBack = () => {
    setIsPlaying(false);
    const currentIndex = TIMELINE_STEPS.indexOf(currentOffset);
    if (currentIndex > 0) {
      onOffsetChange(TIMELINE_STEPS[currentIndex - 1]);
    } else {
      onOffsetChange(TIMELINE_STEPS[0]);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    const currentIndex = TIMELINE_STEPS.indexOf(currentOffset);
    if (currentIndex < TIMELINE_STEPS.length - 1) {
      onOffsetChange(TIMELINE_STEPS[currentIndex + 1]);
    } else {
      onOffsetChange(TIMELINE_STEPS[TIMELINE_STEPS.length - 1]);
    }
  };

  const handleResetLive = () => {
    setIsPlaying(false);
    onOffsetChange(0);
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 1, 2, 4];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Compute simulated timestamp for current offset
  const computeFrameTime = () => {
    const baseDate = baseTimestamp ? new Date(baseTimestamp) : new Date();
    const frameDate = new Date(baseDate.getTime() + currentOffset * 60000);
    return {
      utc: frameDate.toUTCString().slice(17, 22) + ' UTC',
      ist: frameDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const frameTime = computeFrameTime();
  const isPast = currentOffset < 0;
  const isPresent = currentOffset === 0;
  const isFuture = currentOffset > 0;

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 transition-colors select-none text-slate-800 dark:text-slate-200">
      {/* Top Meta Bar: Status Pill, Current Frame Time, and Dual-Zone Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
        {/* Left: Playback State & Time Indicator */}
        <div className="flex items-center space-x-2">
          {/* Mode Badge */}
          <div
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center space-x-1.5 border ${
              isPresent
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : isPast
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
            }`}
          >
            {isPresent ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LIVE RADAR SWEEP (T0)</span>
              </>
            ) : isPast ? (
              <>
                <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>OBSERVED DOPPLER RADAR ({currentOffset}m)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span>CONVLSTM AI NOWCAST (+{currentOffset}m)</span>
              </>
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{frameTime.ist}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">({frameTime.utc})</span>
          </div>
        </div>

        {/* Right: Dual-Zone Legend & Quick Reset */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="hidden sm:flex items-center space-x-3 text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-sky-500"></span>
              <span>Past Radar (-60m)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-indigo-500"></span>
              <span>ConvLSTM AI (+120m)</span>
            </span>
          </div>

          {/* Reset to Live Button */}
          {!isPresent && (
            <button
              onClick={handleResetLive}
              className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center space-x-1 transition active:scale-95 cursor-pointer"
              title="Return to Real-Time Live Stream"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Jump to Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Interactive Timeline Scrubber & Step Bar */}
      <div className="py-2.5 space-y-2">
        {/* Step Buttons Row */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5">
          {TIMELINE_STEPS.map((step) => {
            const isSelected = currentOffset === step;
            const isStepPast = step < 0;
            const isStepZero = step === 0;

            let buttonClass = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800';
            if (isSelected) {
              if (isStepZero) {
                buttonClass = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 dark:ring-emerald-500';
              } else if (isStepPast) {
                buttonClass = 'bg-sky-600 text-white font-bold ring-2 ring-sky-400 dark:ring-sky-500';
              } else {
                buttonClass = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 dark:ring-indigo-500';
              }
            } else if (isStepZero) {
              buttonClass = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-semibold';
            } else if (isStepPast) {
              buttonClass = 'bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900';
            } else {
              buttonClass = 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900';
            }

            return (
              <button
                key={step}
                onClick={() => {
                  setIsPlaying(false);
                  onOffsetChange(step);
                }}
                className={`flex-1 min-w-[42px] sm:min-w-[50px] py-1.5 px-1 rounded-lg text-center text-[11px] font-mono transition-all active:scale-95 cursor-pointer border ${buttonClass}`}
                title={
                  step === 0
                    ? 'Current Live Doppler Radar & INSAT-3DR Scan'
                    : step < 0
                    ? `Historical Radar Sweep ${Math.abs(step)} minutes ago`
                    : `ConvLSTM AI Spatiotemporal Prediction +${step} min`
                }
              >
                <div className="font-bold leading-none">
                  {step === 0 ? 'T0' : step > 0 ? `+${step}m` : `${step}m`}
                </div>
                <div className="text-[9px] opacity-75 mt-0.5 leading-none">
                  {step === 0 ? 'Live' : step < 0 ? 'Radar' : 'AI'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continuous Scrubber Range Slider with Visual Dual Track */}
        <div className="relative flex items-center pt-1">
          <input
            type="range"
            min={0}
            max={TIMELINE_STEPS.length - 1}
            step={1}
            value={TIMELINE_STEPS.indexOf(currentOffset)}
            onChange={(e) => {
              setIsPlaying(false);
              const idx = parseInt(e.target.value, 10);
              onOffsetChange(TIMELINE_STEPS[idx]);
            }}
            className="w-full h-2 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-500 dark:from-sky-600 dark:via-emerald-500 dark:to-indigo-600 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white focus:outline-none"
          />
        </div>
      </div>

      {/* Bottom Transport Controls Bar: Play/Pause, Step Buttons, Speed Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
        {/* Left: Playback Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Play / Pause Loop */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
            title={isPlaying ? 'Pause Timeline Animation' : 'Play Timeline Animation Loop'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Loop</span>
              </>
            )}
          </button>

          {/* Step Back (-15m) */}
          <button
            onClick={handleStepBack}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            title="Step Back 15 Minutes"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Step Forward (+15m) */}
          <button
            onClick={handleStepForward}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            title="Step Forward 15 Minutes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Reset to T0 */}
          <button
            onClick={handleResetLive}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            title="Reset to Live (T0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Playback Speed Toggle & Horizon Scope */}
        <div className="flex items-center space-x-2">
          {/* Speed Toggle */}
          <button
            onClick={toggleSpeed}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono font-bold text-[11px] flex items-center space-x-1 transition active:scale-95 cursor-pointer"
            title="Cycle Playback Speed (0.5x, 1x, 2x, 4x)"
          >
            <FastForward className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Range Scope Pill */}
          <span className="hidden sm:inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Window: -60m to +120m
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;
