import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, Loader2, Sparkles, AudioLines, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Meeting } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: (meeting: Meeting) => void;
}

export const UploadModal: React.FC<Props> = ({ isOpen, onClose, onMeetingCreated }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Product & Engineering');
  const [duration, setDuration] = useState('35m');
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    'Acoustic Ingestion & VAD Filtering (pyannote.audio 3.1)',
    'Speech Diarization & Whisper large-v3 Transcription',
    'Sentence-BERT Workload Allocation & Entity Tagging',
    'Vector Cosine Indexing & Executive MOM Generation',
  ];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsProcessing(true);
    setProcessStep(0);

    // Simulate multi-tier AI pipeline stages before saving
    for (let i = 0; i < steps.length; i++) {
      setProcessStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const res = await api.createMeeting({
        title: title.trim(),
        department,
        duration,
        attendees: ['Trisha Moharle', 'David Chen', 'Elena Rostova'],
      });

      onMeetingCreated(res.meeting);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Failed to create meeting:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
              <AudioLines className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Upload Meeting Media
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                AI Diarization & Verifiable MOM Synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isProcessing ? (
          <div className="py-8 space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-[#00F5D4] animate-spin mb-3" />
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Processing Meeting Audio...
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Fast Diarization cluster processing at 1.18s/chunk
              </p>
            </div>

            {/* Step Progress indicators */}
            <div className="space-y-2.5">
              {steps.map((s, idx) => {
                const isCurrent = processStep === idx;
                const isDone = processStep > idx;
                return (
                  <div
                    key={s}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40'
                        : isCurrent
                        ? 'bg-[var(--background)] text-[#00F5D4] font-medium border border-[#00F5D4]/40'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00F5D4] shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[var(--border)] flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
            {/* File Drag & Drop Zone */}
            <div
              onClick={() => setFileSelected('strategy_sync_session_oct2026.m4a')}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                fileSelected
                  ? 'border-[#00F5D4] bg-[#00F5D4]/5'
                  : 'border-[var(--border)] bg-[var(--background)]/50 hover:border-[var(--primary)]'
              }`}
            >
              <UploadCloud
                className={`w-10 h-10 mb-2 ${
                  fileSelected ? 'text-[#00F5D4]' : 'text-[var(--text-secondary)]'
                }`}
              />
              {fileSelected ? (
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#00F5D4]">{fileSelected}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">38.4 MB · Ready for diarization</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Click to select or drop audio / video recording
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    MP3, WAV, M4A, MP4 (Whisper large-v3 accelerated)
                  </p>
                </div>
              )}
            </div>

            {/* Meeting Title */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Meeting Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Cloud FinOps & GPU Cluster Optimization"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Department & Duration Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option>Product & Engineering</option>
                  <option>Identity & Security</option>
                  <option>Design & Frontend</option>
                  <option>Executive Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Duration (Approx)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option>15m</option>
                  <option>30m</option>
                  <option>45m</option>
                  <option>60m</option>
                </select>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
              <Shield className="w-4 h-4 text-[#00F5D4] shrink-0" />
              <span>SOC2 Type II Protected · In-memory audio processing with no external telemetry retention.</span>
            </div>

            {/* Submit Button */}
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start AI Diarization</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
