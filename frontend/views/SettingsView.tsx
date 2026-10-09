import React, { useState } from 'react';
import { Shield, Zap, Cpu, Key, Database, Sliders, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { theme } = useTheme();
  const { user, tenant } = useAuth();
  const isDark = theme === 'dark';

  const [fastDiarization, setFastDiarization] = useState(true);
  const [ragThreshold, setRagThreshold] = useState(94);
  const [autoApproveSoc2, setAutoApproveSoc2] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--heading)]">
            Settings & Enterprise Security
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Configure diarization inference pipelines, vector RAG audit thresholds, and SOC2 policies
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-sm transition-all"
        >
          Save Configuration
        </button>
      </div>

      {savedNotification && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration saved successfully. Applied across all tenant pipelines.</span>
        </div>
      )}

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Diarization Engine */}
        <div
          className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Cpu className="w-4 h-4 text-[#00F5D4]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Acoustic & Diarization Engine
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">OpenAI Whisper Model</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Speech-to-Text foundation</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded bg-[var(--background)] text-[#00F5D4] border border-[var(--border)] font-semibold">
                large-v3-turbo
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Diarization Cluster</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Speaker clustering</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded bg-[var(--background)] text-[var(--purple)] border border-[var(--border)] font-semibold">
                pyannote.audio 3.1
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Fast Diarization Mode</p>
                <p className="text-[11px] text-[var(--text-secondary)]">1.18s latency SLA on streaming audio chunks</p>
              </div>
              <button
                onClick={() => setFastDiarization(!fastDiarization)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  fastDiarization ? 'bg-[#00F5D4]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                    fastDiarization ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: RAG Grounding & Vector Cosine Threshold */}
        <div
          className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Database className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Vector Grounding & Verification
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[var(--text-primary)]">Minimum Cosine Similarity Threshold</span>
                <span className="font-mono font-bold text-[#00F5D4]">{ragThreshold}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={99}
                value={ragThreshold}
                onChange={(e) => setRagThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
              />
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Decisions below this similarity are flagged as "Under Review" for human verification.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Auto-Approve High Grounding</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Ratify quotes matching &gt;96% verbatim</p>
              </div>
              <button
                onClick={() => setAutoApproveSoc2(!autoApproveSoc2)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  autoApproveSoc2 ? 'bg-[#00F5D4]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                    autoApproveSoc2 ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Enterprise Tenant & Persona Access */}
        <div
          className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              SOC2 Security & Tenant Isolation
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="text-[var(--text-secondary)] text-[11px]">Active Guild Tenant:</span>
              <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">{tenant}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="text-[var(--text-secondary)] text-[11px]">Active Persona:</span>
              <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">{user?.name}</p>
              <p className="text-[11px] text-[#00F5D4] font-medium">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Card 4: Quota Usage */}
        <div
          className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Zap className="w-4 h-4 text-[var(--warning)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              AI Processing Capacity
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Total Monthly Pool:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">100.0 hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Consumed This Period:</span>
              <span className="font-mono font-bold text-[#00F5D4]">48.2 hrs</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00F5D4] to-[#2563EB]"
                style={{ width: '48.2%' }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Includes real-time diarization, Whisper STT, and Sentence-BERT vector matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
