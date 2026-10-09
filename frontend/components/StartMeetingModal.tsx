import React, { useState } from 'react';
import { X, Video, Mic, MicOff, VideoOff, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartMeeting: (title: string, meetingId: string, micOn: boolean, cameraOn: boolean) => void;
}

export const StartMeetingModal: React.FC<Props> = ({ isOpen, onClose, onStartMeeting }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('Executive Architecture & Roadmap Sync');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [meetingId] = useState(() => {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    const part3 = Math.floor(100 + Math.random() * 900);
    return `${part1}-${part2}-${part3}`;
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://meetsync.ai/m/${meetingId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStartMeeting(title.trim() || 'Executive Session', meetingId, micOn, cameraOn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isDark
            ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
            : 'bg-[#FFFFFF] border-[#B6DFEF] text-[#101B35]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Start Instant Meeting
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Launch live video session with real-time speech diarization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleStart} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Product Strategy"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Generated Meeting ID Box */}
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                Unique Meeting ID
              </span>
              <p className="font-mono font-bold text-sm text-[var(--text-primary)] mt-0.5">
                {meetingId}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Device Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                micOn
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2">
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="font-semibold">{micOn ? 'Mic Ready' : 'Muted'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                cameraOn
                  ? 'border-sky-500/50 bg-sky-950/20 text-sky-400'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2">
                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span className="font-semibold">{cameraOn ? 'Camera Ready' : 'Video Off'}</span>
              </div>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
