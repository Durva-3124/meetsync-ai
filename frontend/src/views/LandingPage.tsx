import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCheck,
  GitBranch,
  Calendar,
  Layers,
  ShieldCheck,
  AudioLines,
  ChevronRight,
  Bot,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface Props {
  onLaunchDemo: () => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const LandingPage: React.FC<Props> = ({ onLaunchDemo, onOpenAuth, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-[#070D1F] text-slate-100 selection:bg-[#00F5D4]/20 selection:text-[#00F5D4] select-none">
      {/* Top Navbar matching Screenshot 3 */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-slate-800/80 sticky top-0 bg-[#070D1F]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F5D4] to-[#2563EB] flex items-center justify-center font-black text-slate-950 font-mono">
              M
            </div>
            <span className="font-extrabold text-lg text-white">MeetSync AI</span>
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-[#00F5D4] border border-[#00F5D4]/40">
            ENTERPRISE
          </span>
        </div>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <button
            onClick={() => {
              setActiveTab('editor');
            }}
            className="text-[#00F5D4] flex items-center gap-1 hover:underline"
          >
            <span>HITL MOM Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('traceability')}
            className="hover:text-white transition-colors"
          >
            Traceability Matrix
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="hover:text-white transition-colors"
          >
            Security & RAG
          </button>
          <button
            onClick={onOpenAuth}
            className="hover:text-white transition-colors text-slate-300 font-bold ml-2"
          >
            Log In
          </button>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/20 transition-all active:scale-95"
          >
            <span>SIGN UP / REQUEST DEMO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section matching Screenshot 3 */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-emerald-500/40 text-emerald-300 shadow-sm">
          <span>Next-Gen Enterprise Meeting Intelligence</span>
          <span>·</span>
          <span className="text-[#00F5D4] font-mono">SOC2 Type II</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Turn Enterprise Meetings into Verifiable Executive Intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Automate speaker diarization, interactive 3-pane MOM refinement, and vector-grounded RAG audit trails across your organization.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-xl shadow-[#00F5D4]/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>LAUNCH WORKSPACE DEMO</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 hover:border-slate-500 text-white transition-all"
          >
            <span>Explore Platform Capabilities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust Badges matching Screenshot 3 */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" />
            <span>142 Meetings Indexed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" />
            <span>96.4% Decision Accuracy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" />
            <span>Zero Mock Stubs</span>
          </div>
        </div>

        {/* Tab strip above preview player matching Screenshot 3 */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className="px-3.5 py-1.5 rounded-lg bg-[#00F5D4] text-slate-950 shadow-md font-bold"
            >
              3-Pane HITL MOM Editor
            </button>
            <button
              onClick={() => setActiveTab('traceability')}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Decision Traceability Matrix
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Security & RAG Settings
            </button>
          </div>
        </div>

        {/* Preview Player Bar matching Screenshot 3 */}
        <div
          onClick={onLaunchDemo}
          className="rounded-2xl border border-slate-800 bg-[#0B132B] p-4 text-left shadow-2xl cursor-pointer hover:border-slate-700 transition-all max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <span className="text-xs font-bold text-white">
                Q4 Product Strategy Sync · 00:14:28:12 / 00:45:00:00
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-[#00F5D4] border border-[#00F5D4]/40">
              HITL ACTIVE
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Diarized Speakers: Trisha Moharle, Mohan Moharle, Elena Rostova, David Chen</span>
            <span className="text-[#00F5D4] font-semibold flex items-center gap-1">
              Click to Open Full Workspace <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* 6-Pillar Feature Grid Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Enterprise Architecture & Algorithmic Foundations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Engineered for high-stakes executive strategy, verifiable decision trails, and zero hallucination risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <AudioLines className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Speech-to-Text & Diarization
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenAI Whisper large-v3 combined with pyannote.audio 3.1 neural speaker embeddings. Sub-1.2s chunk latency for live captions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center text-[#00F5D4]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Skill-Based Task Assignment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sentence-BERT vector matching against employee repo commits and past deliverables, balancing sprint bandwidth automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Decision Log with Traceability
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every ratified mandate includes an explainable "View Source" vector quote, linking directly to the speaker's exact timestamped audio.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Deadline Extraction & Gantt Timeline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Natural language temporal resolution transforms spoken promises like "by next Friday" into concrete RFC3339 milestones.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Human-in-the-Loop (HITL) Editor
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit diff highlighting comparing AI initial drafts with manual adjustments. Instant export to verified .docx, .pdf, and .json.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-[#0E172E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Meeting Effectiveness & Sentiment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous acoustic sentiment telemetry and speaking parity curves identify skepticism spikes and consensus alignment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>MeetSync AI Enterprise · SOC2 Type II Certified · Zero-Trust Memory Isolation</p>
      </footer>
    </div>
  );
};
