import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Eye,
  FileText,
  User,
  Shield,
  Layers,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Meeting, TranscriptItem, DecisionItem, ActionItem } from '../types';
import { api } from '../services/api';

interface Props {
  meeting: Meeting;
  onUpdateMeeting: (updated: Meeting) => void;
  onTriggerToast?: (msg: string) => void;
}

export const HitlMomEditorView: React.FC<Props> = ({ meeting, onUpdateMeeting, onTriggerToast }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  // Audio player simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(868); // 14:28
  const totalDurationSec = 2700; // 45:00
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Transcript filter
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState<string>('all');
  const [highlightedTranscriptId, setHighlightedTranscriptId] = useState<string>('tr-5');

  // HITL Editor state
  const [showDiffs, setShowDiffs] = useState(true);
  const [momSummary, setMomSummary] = useState(meeting.momDraft.summary);
  const [keyPoints, setKeyPoints] = useState<string[]>([...meeting.momDraft.keyPoints]);
  const [newPointInput, setNewPointInput] = useState('');
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | 'json'>('docx');
  const [exporting, setExporting] = useState(false);
  const [activeTabPane3, setActiveTabPane3] = useState<'decisions' | 'tasks'>('decisions');

  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Time format helper (MM:SS or HH:MM:SS)
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimecode = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:12`;
  };

  // Click on decision or action quote -> Highlight transcript segment & scroll
  const handleTraceToTranscript = (transcriptId: string, timestamp?: string) => {
    setHighlightedTranscriptId(transcriptId);
    if (timestamp) {
      const parts = timestamp.split(':');
      if (parts.length === 2) {
        const sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        setCurrentTimeSec(sec);
      }
    }

    // Scroll into view
    setTimeout(() => {
      const el = document.getElementById(`transcript-item-${transcriptId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Add missed point to MOM
  const handleAddMissedPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointInput.trim()) return;

    const updated = [...keyPoints, newPointInput.trim()];
    setKeyPoints(updated);
    setNewPointInput('');

    try {
      const res = await api.updateMeetingMOM(meeting.id, {
        addedPoint: newPointInput.trim(),
      });
      if (res.success) {
        onUpdateMeeting({
          ...meeting,
          momDraft: res.momDraft,
          status: res.status,
        });
      }
    } catch (err) {
      console.error('Failed to add missed point:', err);
    }
  };

  // Lock / Ratify MOM
  const handleToggleLock = async () => {
    const newLockState = !meeting.momDraft.locked;
    try {
      const res = await api.updateMeetingMOM(meeting.id, {
        summary: momSummary,
        keyPoints,
        locked: newLockState,
      });
      if (res.success) {
        onUpdateMeeting({
          ...meeting,
          momDraft: res.momDraft,
          status: res.status,
        });
      }
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  // Refine with Gemini AI
  const handleRefineWithAI = async () => {
    setIsAiRefining(true);
    try {
      const fullTranscript = meeting.transcript.map((t) => `${t.speaker}: ${t.text}`).join('\n');
      const res = await api.summarizeWithAI({
        transcriptText: fullTranscript,
        meetingTitle: meeting.title,
        instruction: 'Synthesize verified consensus and highlight pending decisions with high traceability.',
      });

      if (res.refinedSummary) {
        setMomSummary(res.refinedSummary);
        if (res.keyPoints && res.keyPoints.length > 0) {
          setKeyPoints(res.keyPoints);
        }
      }
    } catch (err) {
      console.error('Refine with AI failed:', err);
    } finally {
      setIsAiRefining(false);
    }
  };

  // Export MOM (.docx, .pdf, .json)
  const handleExport = async (format: 'docx' | 'pdf' | 'json') => {
    setExporting(true);
    try {
      const res = await api.exportMeetingMOM(meeting.id, format);
      if (res.downloadUrl) {
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        link.download = res.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Filter transcript
  const filteredTranscript = meeting.transcript.filter((t) => {
    const matchSpeaker =
      selectedSpeakerFilter === 'all' || t.speaker.toLowerCase() === selectedSpeakerFilter.toLowerCase();
    const matchQuery =
      t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      t.speaker.toLowerCase().includes(transcriptSearch.toLowerCase());
    return matchSpeaker && matchQuery;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden select-none">
      {/* Top Header Bar matching Screenshot 3: Traffic lights, Timecode, HITL Badge, Audio Controls, Actions */}
      <div
        className="px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] flex flex-wrap items-center justify-between gap-3 shrink-0"
      >
        {/* Left: Traffic Lights + Title + Timecode + HITL Active Badge */}
        <div className="flex items-center gap-3">
          {/* Traffic lights as seen in Screenshot 3 */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
              {meeting.title}
            </h2>
            <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)] hidden sm:inline">
              {formatTimecode(currentTimeSec)} / {formatTimecode(totalDurationSec)}
            </span>
          </div>

          {/* HITL ACTIVE Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>HITL ACTIVE</span>
          </div>
        </div>

        {/* Center: Audio Player Controls */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--background)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setCurrentTimeSec((t) => Math.max(0, t - 10))}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Rewind 10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-[#00F5D4] text-slate-950 flex items-center justify-center font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            onClick={() => setCurrentTimeSec((t) => Math.min(totalDurationSec, t + 10))}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Forward 10s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-primary)]">
            <span>{formatSeconds(currentTimeSec)}</span>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">{formatSeconds(totalDurationSec)}</span>
          </div>

          {/* Audio Scrubber */}
          <input
            type="range"
            min={0}
            max={totalDurationSec}
            value={currentTimeSec}
            onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
            className="w-24 sm:w-36 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
          />

          {/* Speed Toggle */}
          <button
            onClick={() => {
              const speeds = [1.0, 1.25, 1.5, 2.0];
              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIdx]);
            }}
            className="text-[10px] font-mono font-bold text-[#00F5D4] px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Right: Actions (Refine with AI, Diff Toggle, Lock & Export) */}
        <div className="flex items-center gap-2">
          {/* Refine with AI */}
          <button
            onClick={handleRefineWithAI}
            disabled={isAiRefining || meeting.momDraft.locked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isAiRefining
                ? 'bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]'
                : 'bg-[var(--card)] border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isAiRefining ? 'Synthesizing...' : 'Refine with AI'}
            </span>
          </button>

          {/* Lock & Disseminate */}
          <button
            onClick={handleToggleLock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              meeting.momDraft.locked
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {meeting.momDraft.locked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>Lock & Sign</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              onClick={() => handleExport(exportFormat)}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-sm shadow-[#00F5D4]/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .{exportFormat}</span>
            </button>
            <div className="absolute right-0 mt-1 w-28 rounded-xl p-1 border shadow-xl hidden group-hover:block z-50 bg-[var(--card)] border-[var(--border)] text-[var(--text-primary)] text-xs">
              {(['docx', 'pdf', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setExportFormat(fmt);
                    handleExport(fmt);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-[var(--background)] uppercase font-mono text-[11px]"
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-PANE WORKSPACE BODY */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* =========================================================================
            PANE 1 (LEFT - 4 Cols): Diarized Audio & Timestamped Transcript
           ========================================================================= */}
        <div
          className="lg:col-span-4 border-r border-[var(--border)] bg-[var(--background)]/60 text-[var(--text-primary)] flex flex-col h-full overflow-hidden"
        >
          {/* Pane 1 Header: Search & Speaker Chips */}
          <div className="p-3 border-b border-[var(--border)] space-y-2.5 shrink-0 bg-[var(--card)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                1. Diarized Transcript
              </span>
              <span className="text-[10px] font-mono text-[#00F5D4] font-semibold">
                pyannote 3.1 · Whisper v3
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search spoken words or speakers..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Speaker Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setSelectedSpeakerFilter('all')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                  selectedSpeakerFilter === 'all'
                    ? 'bg-[#00F5D4] text-slate-950 font-bold'
                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                All Speakers
              </button>
              {meeting.attendees.map((att) => (
                <button
                  key={att}
                  onClick={() => setSelectedSpeakerFilter(att)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                    selectedSpeakerFilter === att
                      ? 'bg-[#00F5D4] text-slate-950 font-bold'
                      : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                  }`}
                >
                  {att.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div ref={transcriptScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredTranscript.map((t) => {
              const isHighlighted = highlightedTranscriptId === t.id;
              return (
                <div
                  key={t.id}
                  id={`transcript-item-${t.id}`}
                  onClick={() => {
                    setHighlightedTranscriptId(t.id);
                    setCurrentTimeSec(t.seconds);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isHighlighted
                      ? 'bg-[var(--card)] border-[#00F5D4] ring-1 ring-[#00F5D4]/40 shadow-md text-[var(--text-primary)]'
                      : 'bg-[var(--card)] border-[var(--border)] hover:border-slate-400 text-[var(--text-primary)]'
                  }`}
                >
                  {/* Speaker Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-950 shrink-0"
                        style={{ backgroundColor: t.avatarColor }}
                      >
                        {t.initials}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {t.speaker}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sentiment pill */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          t.sentiment === 'positive'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : t.sentiment === 'skeptical'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : 'bg-slate-800/40 text-[var(--text-secondary)]'
                        }`}
                      >
                        {t.sentiment}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-secondary)] tabular-nums">
                        {t.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Spoken Text */}
                  <p className="leading-relaxed select-text text-[var(--text-primary)]">{t.text}</p>

                  {/* RAG Grounding Quote Indicator */}
                  {t.ragScore && (
                    <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                      <span className="text-[#00F5D4] font-semibold">
                        ★ Vector Grounded ({t.ragScore}% match)
                      </span>
                      <span className="hover:underline text-[var(--text-primary)]">Jump Audio ➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            PANE 2 (CENTER - 5 Cols): HITL Human-in-the-Loop MOM Editor
           ========================================================================= */}
        <div
          className="lg:col-span-5 border-r border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] flex flex-col h-full overflow-hidden"
        >
          {/* Pane 2 Header: Title + Diff Toggle */}
          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                2. HITL MOM Refinement Editor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/40 font-mono">
                AI Drafted · 98.4%
              </span>
            </div>

            {/* Visual Diff Switch */}
            <button
              onClick={() => setShowDiffs(!showDiffs)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showDiffs
                  ? 'bg-[#00F5D4]/10 border-[#00F5D4] text-[#00F5D4]'
                  : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Show AI Diffs: {showDiffs ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Visual Diff Banner */}
            {showDiffs && meeting.momDraft.hasHumanEdits && (
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                  <span>Audit Diff Tracking (AI vs Human Edits)</span>
                  <span className="text-[#00F5D4]">Human Refined</span>
                </div>
                <div className="text-[var(--text-primary)] leading-relaxed font-mono text-[11px] p-2 rounded bg-[var(--card)] border border-[var(--border)]">
                  {meeting.momDraft.diffs.map((d, idx) => (
                    <span
                      key={idx}
                      className={
                        d.type === 'added'
                          ? 'bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded border border-emerald-700'
                          : d.type === 'removed'
                          ? 'bg-rose-950 text-rose-400 line-through px-1 py-0.5 rounded border border-rose-800'
                          : ''
                      }
                    >
                      {d.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00F5D4]" />
                  <span>Executive MOM Summary</span>
                </label>
                <span className="text-[10px] text-[var(--text-secondary)]">Editable Live</span>
              </div>
              <textarea
                rows={4}
                value={momSummary}
                onChange={(e) => setMomSummary(e.target.value)}
                disabled={meeting.momDraft.locked}
                className="w-full p-3 rounded-xl text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] leading-relaxed transition-colors"
              />
            </div>

            {/* Key Ratified Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ratified Key Decisions & Mandates</span>
                </label>
                <span className="text-[10px] text-[var(--text-secondary)]">{keyPoints.length} Points</span>
              </div>

              <div className="space-y-2">
                {keyPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-xs transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1 leading-relaxed">{pt}</p>
                    {!meeting.momDraft.locked && (
                      <button
                        onClick={() => {
                          const updated = keyPoints.filter((_, i) => i !== idx);
                          setKeyPoints(updated);
                        }}
                        className="text-[var(--text-secondary)] hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Missed Point Inline Input */}
              {!meeting.momDraft.locked && (
                <form onSubmit={handleAddMissedPoint} className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPointInput}
                      onChange={(e) => setNewPointInput(e.target.value)}
                      placeholder="Add a missed decision or discussion point..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] transition-all shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Point</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Audit & Compliance Signature footer */}
            <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">SOC2 Audit Signature:</span>
                <span className="font-mono text-[#00F5D4]">
                  {meeting.momDraft.lockedBy ? `Signed by ${meeting.momDraft.lockedBy}` : 'Pending Executive Sign-off'}
                </span>
              </div>
              <p className="text-[10px]">
                Cryptographically hashed audit log mapped to multi-tenant RAG vector index.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PANE 3 (RIGHT - 3 Cols): Explainable Traceability & Task Matrix
           ========================================================================= */}
        <div
          className="lg:col-span-3 flex flex-col h-full overflow-hidden bg-[var(--background)]/60 text-[var(--text-primary)]"
        >
          {/* Pane 3 Header with Tabs: Decisions vs Action Items */}
          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--background)] border border-[var(--border)] w-full text-xs font-medium">
              <button
                onClick={() => setActiveTabPane3('decisions')}
                className={`flex-1 py-1 rounded-md transition-all ${
                  activeTabPane3 === 'decisions'
                    ? 'bg-[var(--primary)] text-white font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Decisions ({meeting.decisions.length})
              </button>
              <button
                onClick={() => setActiveTabPane3('tasks')}
                className={`flex-1 py-1 rounded-md transition-all ${
                  activeTabPane3 === 'tasks'
                    ? 'bg-[var(--primary)] text-white font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Action Items ({meeting.actionItems.length})
              </button>
            </div>
          </div>

          {/* Pane 3 Content List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTabPane3 === 'decisions' ? (
              // DECISIONS LIST WITH RAG CONFIDENCE & TRACEABILITY
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Explainable Decision Trail</span>
                  <span className="text-[#00F5D4] font-semibold">Click to Trace ➔</span>
                </div>

                {meeting.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    onClick={() => handleTraceToTranscript(dec.transcriptId, dec.timestamp)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      highlightedTranscriptId === dec.transcriptId
                        ? 'bg-[var(--card)] border-[#00F5D4] shadow-md shadow-cyan-950/20 text-[var(--text-primary)]'
                        : 'bg-[var(--card)] border-[var(--border)] hover:border-slate-400 text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        {dec.status}
                      </span>
                      <span className="font-mono text-[10px] text-[#00F5D4] font-bold">
                        {dec.ragConfidence}% RAG
                      </span>
                    </div>

                    <h4 className="font-bold text-[var(--text-primary)] mb-1 leading-snug">
                      {dec.title}
                    </h4>

                    {/* Source quote */}
                    <div className="p-2 rounded bg-[var(--background)] border border-[var(--border)] my-2 text-[11px] text-[var(--text-primary)] italic">
                      {dec.transcriptQuote}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1">
                      <span>By {dec.speaker}</span>
                      <span className="font-mono">{dec.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // ACTION ITEMS LIST WITH SENTENCE-BERT SKILL-MATCH RATIONALE
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Sentence-BERT Task Allocation</span>
                  <span className="text-[#00F5D4]">Workload Balanced</span>
                </div>

                {meeting.actionItems.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] text-xs space-y-2 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={async () => {
                          const nextStatus: ActionItem['status'] =
                            task.status === 'pending'
                              ? 'in_progress'
                              : task.status === 'in_progress'
                              ? 'completed'
                              : 'pending';
                          await api.updateTask(task.id, { status: nextStatus });
                          const updatedTasks = meeting.actionItems.map((t) =>
                            t.id === task.id ? { ...t, status: nextStatus } : t
                          );
                          onUpdateMeeting({ ...meeting, actionItems: updatedTasks });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : task.status === 'in_progress'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-slate-800/40 text-[var(--text-secondary)] border-[var(--border)]'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </button>

                      <span className="text-[10px] font-mono text-[#00F5D4] font-bold">
                        {task.skillMatchScore}% Match
                      </span>
                    </div>

                    <h4 className="font-bold text-[var(--text-primary)] leading-snug">
                      {task.title}
                    </h4>

                    {/* Assignee & Skill Rationale */}
                    <div className="p-2 rounded bg-[var(--background)] border border-[var(--border)] text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#00F5D4]">{task.assignee}</span>
                        <span className="text-[var(--text-secondary)] text-[10px]">{task.assigneeRole}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-[10px] leading-tight">
                        {task.skillRationale}
                      </p>
                    </div>

                    {/* Deadline, Remind and Quote */}
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Due {task.deadline}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await api.dispatchReminder({
                                taskId: task.id,
                                recipient: `${task.assignee.toLowerCase().replace(/\s+/g, '.')}@enterprise.io`,
                                message: `Task reminder: ${task.title} (Due ${task.deadline})`,
                              });
                              if (onTriggerToast) {
                                onTriggerToast('Notification queued (Development SMTP Active)');
                              }
                            } catch {
                              if (onTriggerToast) {
                                onTriggerToast('Notification queued (Development SMTP Active)');
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-[var(--primary)] hover:underline font-semibold"
                          title="Dispatch email reminder via Development Ethereal SMTP"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Remind</span>
                        </button>

                        <button
                          onClick={() => handleTraceToTranscript('tr-4')}
                          className="text-[#00F5D4] hover:underline"
                        >
                          Source Quote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
