import React, { useState } from 'react';
import {
  BellRing,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import {
  playEmergencySirenKlaxon,
  stopEmergencySirenKlaxon,
  toggleSirenMute,
  getSirenMuteState,
} from '../../utils/sirenAudio';

/**
 * Dedicated Enterprise Emergency Siren Alert Banner & Warning Drawer.
 * Placed cleanly in the dashboard layout to ensure zero overlap with map controls,
 * floating region badges, or zoom buttons.
 *
 * Features:
 * - High-contrast emergency visual styling adhering to SIH26072 standards.
 * - Real-time active automated dispatch flags.
 * - Web Audio API synthesized Klaxon siren sound testing & mute controls.
 * - Full dismiss and minimize/expand toggle for operator workflow convenience.
 */
export const AlertBanner = ({ emergencySirenTrigger = null }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => getSirenMuteState());
  const [isSirenAudioPlaying, setIsSirenAudioPlaying] = useState(false);

  // If no emergency siren is active or dismissed by operator
  if (!emergencySirenTrigger?.siren_triggered || isDismissed) {
    return null;
  }

  const sirenLevel = emergencySirenTrigger.siren_level || 'LEVEL_3_HIGH_PRIORITY_KLAXON';
  const sirenSound = emergencySirenTrigger.siren_sound || 'SEVERE_CONVECTIVE_SIREN_120DB';
  const dispatchFlags = emergencySirenTrigger.dispatch_flags || [];
  const broadcastText =
    emergencySirenTrigger.emergency_broadcast_text ||
    'Severe convective storm core detected (>50 dBZ) intersecting critical urban infrastructure polygons with ETA < 15 min. Automated siren hooks and emergency dispatch protocols engaged.';

  // Handle siren audio test toggle
  const handleSirenSoundToggle = () => {
    if (isSirenAudioPlaying) {
      stopEmergencySirenKlaxon();
      setIsSirenAudioPlaying(false);
    } else {
      playEmergencySirenKlaxon(7);
      setIsSirenAudioPlaying(true);
      setTimeout(() => setIsSirenAudioPlaying(false), 7500);
    }
  };

  // Handle audio mute toggle
  const handleMuteToggle = () => {
    const nextMuted = toggleSirenMute();
    setIsAudioMuted(nextMuted);
    if (nextMuted) setIsSirenAudioPlaying(false);
  };

  // 1. Minimized Mode (Compact Ticker Bar)
  if (isMinimized) {
    return (
      <div className="w-full bg-red-600 dark:bg-red-950 text-white px-3 sm:px-4 py-1.5 flex items-center justify-between border-b border-red-700 dark:border-red-900 text-xs transition-all select-none">
        <div className="flex items-center space-x-2 truncate">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="font-bold tracking-wide">
            🚨 SIREN ACTIVE ({sirenLevel.replace(/_/g, ' ')})
          </span>
          <span className="hidden md:inline text-red-100 text-[11px] truncate opacity-90">
            • {dispatchFlags.length} Dispatch Flags Engaged
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition"
            title="Expand Full Emergency Siren Panel"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded hover:bg-white/20 text-white transition cursor-pointer"
            title="Dismiss Siren Warning for this session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Full Standard Expanded Alert Banner
  return (
    <div className="w-full bg-red-600 dark:bg-red-950 text-white border-b border-red-700 dark:border-red-900 px-3 sm:px-4 py-2.5 transition-all select-none flex flex-col gap-2">
      {/* Top Row: Icon, Headline Badge, Broadcast Summary, Audio Controls, & Dismiss */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        {/* Left: Icon & Headline */}
        <div className="flex items-start sm:items-center space-x-2.5 flex-1 min-w-0">
          <div className="p-1.5 rounded-lg bg-white/20 text-white flex-shrink-0 mt-0.5 sm:mt-0">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase">
              Automated Emergency Siren Hook Active
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-red-800 dark:text-red-900 font-mono font-black text-[10px] tracking-wider uppercase">
              {sirenLevel.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Right: Audio Siren Synthesizer Controls, Minimize & Dismiss */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto flex-shrink-0">
          {/* Klaxon Siren Simulator Button */}
          <button
            onClick={handleSirenSoundToggle}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
              isSirenAudioPlaying
                ? 'bg-amber-300 text-slate-950 ring-2 ring-amber-400'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={isSirenAudioPlaying ? 'Stop Klaxon Siren Tone' : 'Test Synthesized Web Audio Klaxon Siren (880Hz)'}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSirenAudioPlaying ? 'Klaxon Warbling...' : 'Test Siren'}</span>
          </button>

          {/* Mute / Unmute Button */}
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer active:scale-95"
            title={isAudioMuted ? 'Unmute Emergency Siren Audio' : 'Mute Emergency Siren Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer active:scale-95"
            title="Minimize to Compact Bar"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer active:scale-95"
            title="Dismiss Emergency Siren Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Text: Incident Details */}
      <div className="text-[11px] sm:text-xs text-red-50 dark:text-red-100 font-medium leading-relaxed max-w-5xl">
        {broadcastText}
      </div>

      {/* Bottom Dispatch Flags Bar */}
      {dispatchFlags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 dark:text-red-300 flex items-center gap-1 mr-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Automated Dispatch Flags:</span>
          </span>
          {dispatchFlags.map((flag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/15 dark:bg-black/30 text-white border border-white/30"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
