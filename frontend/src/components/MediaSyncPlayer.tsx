import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flag,
  Sparkles,
  Camera,
  Activity,
} from 'lucide-react';
import { Meeting, TranscriptSegment } from '../types';
import { formatTimecode, formatDuration } from '../utils/time';

interface MediaSyncPlayerProps {
  meeting: Meeting;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onFlagDecision: (timestamp: number) => void;
  currentCaption?: string;
  currentSpeakerName?: string;
}

export const MediaSyncPlayer: React.FC<MediaSyncPlayerProps> = ({
  meeting,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onFlagDecision,
  currentCaption,
  currentSpeakerName,
}) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Keep playback time moving without restarting the animation loop on each frame.
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number = performance.now();

    const loop = (now: number) => {
      const deltaSeconds = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setCurrentTime((time) => {
          return Math.min(meeting.durationSeconds, time + deltaSeconds * playbackRate);
        });
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      lastTimestamp = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackRate, meeting.durationSeconds, setCurrentTime, setIsPlaying]);

  useEffect(() => {
    if (isPlaying && currentTime >= meeting.durationSeconds) setIsPlaying(false);
  }, [currentTime, isPlaying, meeting.durationSeconds, setIsPlaying]);

  // Keyboard shortcut listeners (J/K/L/Space/S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 5));
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setCurrentTime(Math.min(meeting.durationSeconds, currentTime + 5));
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onFlagDecision(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, meeting.durationSeconds, setIsPlaying, setCurrentTime, onFlagDecision]);

  // Scrubber click/drag
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(fraction * meeting.durationSeconds);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverTime(fraction * meeting.durationSeconds);
    setHoverPosition(clickX);
  };

  const progressPercent = (currentTime / meeting.durationSeconds) * 100;
  const bufferedPercent = Math.min(100, progressPercent + 25);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className="flex flex-col h-full rounded-2xl border border-[#B0DEED] bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-colors"
    >
      {/* Media Screen & Overlays */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group select-none">
        {/* Background Image / Meeting Stream */}
        <img
          src={meeting.mediaThumbnailUrl}
          alt={meeting.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-101"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Top Gradient */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none" />

        {/* Top Header Information inside video */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase drop-shadow-sm font-mono">
              REC · 1080p60
            </span>
            <span className="text-xs text-slate-300 drop-shadow-sm hidden sm:inline">
              · {meeting.title}
            </span>
          </div>

          {/* Timecode readout: HH:MM:SS:FF */}
          <div className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-white backdrop-blur-md border border-white/10 tabular-nums">
            {formatTimecode(currentTime)}
          </div>
        </div>

        {/* Active Speaker Visualizer Pill */}
        {currentSpeakerName && (
          <div className="absolute top-12 left-3 flex items-center gap-2 rounded-lg bg-slate-900/80 px-2.5 py-1.5 backdrop-blur-md border border-slate-700/60 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-0.5 h-3">
              <span className={`w-0.5 rounded-full bg-[#1D70F5] ${isPlaying ? 'animate-bounce h-3' : 'h-1.5'}`} />
              <span className={`w-0.5 rounded-full bg-[#1D70F5] ${isPlaying ? 'animate-bounce h-2 delay-75' : 'h-1.5'}`} />
              <span className={`w-0.5 rounded-full bg-[#1D70F5] ${isPlaying ? 'animate-bounce h-3.5 delay-150' : 'h-1.5'}`} />
              <span className={`w-0.5 rounded-full bg-[#1D70F5] ${isPlaying ? 'animate-bounce h-2.5 delay-100' : 'h-1.5'}`} />
            </div>
            <span className="text-xs font-semibold text-white">
              {currentSpeakerName}
            </span>
          </div>
        )}

        {/* Caption Overlay */}
        {currentCaption && (
          <div className="absolute bottom-4 inset-x-4 flex justify-center pointer-events-none">
            <div className="max-w-xl rounded-xl bg-slate-950/80 px-4 py-2 text-center text-xs sm:text-sm font-medium text-white shadow-xl backdrop-blur-md border border-white/10 leading-snug">
              <span className="text-[#80CCE3] font-bold mr-1.5">{currentSpeakerName}:</span>
              &ldquo;{currentCaption}&rdquo;
            </div>
          </div>
        )}

        {/* Big Center Play Overlay on Pause */}
        {!isPlaying && (
          <div
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer backdrop-blur-[1px] transition"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1D70F5] text-white shadow-2xl hover:scale-105 transition transform-gpu">
              <Play className="h-6 w-6 fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Dual-Tone Scrubber Bar */}
      <div className="px-4 pt-3 pb-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div
          ref={scrubberRef}
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-2.5 w-full cursor-pointer rounded-full bg-slate-200 dark:bg-slate-800 hover:h-3.5 transition-all"
        >
          {/* Buffer track */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-slate-300 dark:bg-slate-700 pointer-events-none transition-all"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Played track (Vibrant Primary Blue) */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-[#1D70F5] pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Decision Markers on timeline */}
          {meeting.decisions.map((dec) => {
            const decPercent = (dec.citationTimestamp / meeting.durationSeconds) * 100;
            return (
              <div
                key={dec.id}
                title={`Decision: ${dec.statement}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTime(dec.citationTimestamp);
                }}
                className="absolute top-0 -mt-0.5 h-3.5 w-1.5 rounded-sm bg-amber-400 border border-amber-600 z-10 hover:scale-125 transition"
                style={{ left: `${decPercent}%` }}
              />
            );
          })}

          {/* Playhead indicator (#EF4444) */}
          <div
            className="absolute top-1/2 -mt-2 -ml-2 h-4 w-4 rounded-full bg-[#EF4444] border-2 border-white dark:border-slate-900 shadow-md transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover timestamp tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold text-white shadow-md pointer-events-none z-20"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatDuration(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* Media Playback Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900">
        
        {/* Left: J / K / L controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Rewind 5s (J) */}
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px]"
            title="Rewind 5s (J)"
            aria-label="Rewind 5 seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Play / Pause (K / Space) */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D70F5] text-white shadow-xs hover:bg-[#165fd4] transition min-h-[44px] min-w-[44px]"
            title={isPlaying ? 'Pause (K or Space)' : 'Play (K or Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-white" />
            ) : (
              <Play className="h-4 w-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Forward 5s (L) */}
          <button
            onClick={() => setCurrentTime(Math.min(meeting.durationSeconds, currentTime + 5))}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px]"
            title="Fast Forward 5s (L)"
            aria-label="Fast forward 5 seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Timecode Readout */}
          <div className="ml-2 font-mono text-xs tabular-nums font-bold text-slate-800 dark:text-slate-200">
            <span>{formatDuration(currentTime)}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-500">{formatDuration(meeting.durationSeconds)}</span>
          </div>
        </div>

        {/* Right: Flag Decision, Speed, Volume, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Flag Decision Shortcut (S) */}
          <button
            onClick={() => onFlagDecision(currentTime)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 transition min-h-[44px]"
            title="Flag timestamp as Decision Point (S)"
          >
            <Flag className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="hidden md:inline">Flag Decision (S)</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`rounded-md px-1.5 py-1 text-[11px] font-mono font-bold transition min-h-[36px] ${
                  playbackRate === rate
                    ? 'bg-white text-[#1D70F5] shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px]"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
