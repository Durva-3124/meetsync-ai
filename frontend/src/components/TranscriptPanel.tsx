import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Volume2,
  Edit2,
  Check,
  X,
  Flag,
  ListPlus,
  ArrowDownCircle,
  Copy,
} from 'lucide-react';
import { TranscriptSegment, Speaker } from '../types';
import { formatDuration } from '../utils/time';

interface TranscriptPanelProps {
  transcript: TranscriptSegment[];
  speakers: Record<string, Speaker>;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onUpdateSegment: (segmentId: string, updatedText: string, updatedSpeakerId?: string) => void;
  onTagDecision: (segment: TranscriptSegment) => void;
  onAddActionItemFromSpeech: (segment: TranscriptSegment) => void;
  onCopyQuote: (text: string) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  speakers,
  currentTime,
  onSeek,
  onUpdateSegment,
  onTagDecision,
  onAddActionItemFromSpeech,
  onCopyQuote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSpeakerId, setEditSpeakerId] = useState('');

  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (autoScroll && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentTime, autoScroll]);

  const handleStartEdit = (seg: TranscriptSegment) => {
    setEditingSegmentId(seg.id);
    setEditText(seg.text);
    setEditSpeakerId(seg.speakerId);
  };

  const handleSaveEdit = (segmentId: string) => {
    onUpdateSegment(segmentId, editText, editSpeakerId);
    setEditingSegmentId(null);
  };

  const filteredTranscript = transcript.filter((seg) => {
    const matchesSearch = seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = selectedSpeakerFilter === 'all' || seg.speakerId === selectedSpeakerFilter;
    return matchesSearch && matchesSpeaker;
  });

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#B0DEED] bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-colors">
      
      {/* Top Header & Search Bar */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Diarized Transcript
            </h2>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              ({transcript.length} turns)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition min-h-[36px] ${
                autoScroll
                  ? 'bg-[#1D70F5]/10 text-[#1D70F5] dark:bg-[#1D70F5]/20'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle auto-scrolling synchronization with playback"
            >
              <ArrowDownCircle className={`h-3.5 w-3.5 ${autoScroll ? 'text-[#1D70F5]' : 'text-slate-400'}`} />
              <span className="text-[11px] hidden sm:inline">Sync Scroll</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search speech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={selectedSpeakerFilter}
            onChange={(e) => setSelectedSpeakerFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Speakers</option>
            {Object.values(speakers).map((spk) => (
              <option key={spk.id} value={spk.id}>
                {spk.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transcript Scroll Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredTranscript.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No dialogue matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredTranscript.map((seg) => {
            const isActive =
              currentTime >= seg.startSeconds && currentTime < seg.endSeconds;
            const isEditing = editingSegmentId === seg.id;
            const speaker =
              Object.values(speakers).find((s) => s.id === seg.speakerId) || {
                name: seg.speakerName,
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                color: '#1D70F5',
                role: 'Participant',
              };

            return (
              <div
                key={seg.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(seg.startSeconds)}
                className={`group relative rounded-xl p-3 transition-all cursor-pointer border ${
                  isActive
                    ? 'border-l-4 border-l-[#1D70F5] border-y-[#B0DEED] border-r-[#B0DEED] bg-[#80CCE3]/20 shadow-xs dark:bg-[#1D70F5]/15 dark:border-y-slate-800 dark:border-r-slate-800 dark:border-l-[#1D70F5]'
                    : 'border-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.name}
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: speaker.color }}
                    >
                      {seg.speakerName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {speaker.role}
                    </span>
                  </div>

                  {/* Click-to-jump Timecode readout */}
                  <div className="flex items-center gap-1.5">
                    {seg.isKeyDecision && (
                      <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                        Decision
                      </span>
                    )}
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 group-hover:text-[#1D70F5] group-hover:bg-[#1D70F5]/10 tabular-nums">
                      {formatDuration(seg.startSeconds)}
                    </span>
                  </div>
                </div>

                {/* Transcript Body / HITL Edit */}
                {isEditing ? (
                  <div
                    className="mt-2 space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[#1D70F5] bg-white p-2 text-xs text-slate-900 outline-none dark:bg-slate-800 dark:text-white"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={editSpeakerId}
                        onChange={(e) => setEditSpeakerId(e.target.value)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:bg-slate-800 dark:text-white"
                      >
                        {Object.values(speakers).map((s) => (
                          <option key={s.id} value={s.id}>
                            Reattribute: {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingSegmentId(null)}
                          className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(seg.id)}
                          className="flex items-center gap-1 rounded-md bg-[#1D70F5] px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
                        >
                          <Check className="h-3 w-3" /> Save Turn
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {seg.text}
                  </p>
                )}

                {/* Hover HITL Quick Actions */}
                {!isEditing && (
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-slate-850/90 rounded-lg p-1 shadow-xs border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(seg);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Edit transcript line (Human-in-the-loop)"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTagDecision(seg);
                      }}
                      className="p-1 rounded text-amber-500 hover:text-amber-700 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Tag as Decision"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddActionItemFromSpeech(seg);
                      }}
                      className="p-1 rounded text-[#1D70F5] hover:text-blue-700 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Extract Action Item"
                    >
                      <ListPlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyQuote(seg.text);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Copy quote"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-2 border-t border-slate-100 text-[11px] text-slate-400 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
        <span>Click line to jump playback</span>
        <span>Hover line for HITL actions</span>
      </div>
    </div>
  );
};
