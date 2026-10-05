import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Play,
  ArrowRight,
  GitBranch,
  FileEdit,
  LayoutDashboard,
  Lock,
  Cpu,
  BarChart3,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Activity,
  Zap,
  TrendingUp,
  Target,
  Sliders,
  Check,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import meetingVideoFeed from '../../assets/images/meeting_video_feed_1790933819582.jpg';

export type HeroPreviewTab = 'dashboard' | 'hitl' | 'traceability' | 'security';

interface EnterpriseLandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLaunchDemo: (targetTab?: 'dashboard' | 'mom-editor' | 'traceability' | 'settings') => void;
}

export const EnterpriseLandingPage: React.FC<EnterpriseLandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
  onLaunchDemo,
}) => {
  const [activeHeroTab, setActiveHeroTab] = useState<HeroPreviewTab>('hitl');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavToTab = (tab: HeroPreviewTab) => {
    setActiveHeroTab(tab);
    scrollToSection('hero-mockup');
  };

  const featureCards = [
    {
      id: 'dashboard' as HeroPreviewTab,
      icon: LayoutDashboard,
      badge: 'Executive Analytics',
      title: 'Real-Time Sentiment & Engagement Telemetry',
      description:
        'Continuous NLP acoustic sentiment trajectories mapping positive, skeptical, and consensus moments across the entire executive meeting lifecycle.',
      stats: '96.4% Decision Accuracy',
      metrics: '4-Department Aggregation',
      targetTab: 'dashboard' as const,
    },
    {
      id: 'hitl' as HeroPreviewTab,
      icon: FileEdit,
      badge: 'Core Workflow',
      title: '3-Pane Human-in-the-Loop MOM Workspace',
      description:
        'Synchronized frame-accurate video scrubbers, interactive diarized transcript with speech-click seeking, and live collaborative minutes with Jira/Linear synchronization.',
      stats: '100% Verifiable Turn Attribution',
      metrics: 'Dual-Tone Scrubber + HH:MM:SS:FF',
      targetTab: 'mom-editor' as const,
    },
    {
      id: 'traceability' as HeroPreviewTab,
      icon: GitBranch,
      badge: 'Vector Grounding',
      title: 'Decision Traceability & RAG Audit Logs',
      description:
        'Every executive commitment and architectural decision is indexed to exact second-level audio coordinates, eliminating organizational ambiguity.',
      stats: '0.082 Average Cosine Distance',
      metrics: 'Verbatim Timestamp Citations',
      targetTab: 'traceability' as const,
    },
    {
      id: 'security' as HeroPreviewTab,
      icon: Lock,
      badge: 'Enterprise Trust',
      title: 'Configurable AI Thresholds & SOC2 Controls',
      description:
        'Fine-tune automated confidence boundaries (90%+ auto-approval), multi-tenant isolation, and automated SCIM 2.0 user provisioning.',
      stats: 'SOC2 Type II Certified',
      metrics: 'Granular RBAC & Webhooks',
      targetTab: 'settings' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-[#00F9C7]/20 selection:text-[#00F9C7]">
      
      {/* 1. Header / Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo & Cyan-Mint Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D70F5] to-[#00F9C7] flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_20px_rgba(0,249,199,0.35)]">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                MeetSync AI
              </span>
              <span className="rounded-full bg-[#00F9C7]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#00F9C7] border border-[#00F9C7]/30 shadow-[0_0_8px_rgba(0,249,199,0.2)]">
                ENTERPRISE
              </span>
            </div>
          </div>

          {/* Navigation Links with Smooth Scrolling & Tab Toggling */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#00F9C7] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavToTab('hitl')}
              className="hover:text-[#00F9C7] transition-colors flex items-center gap-1.5"
            >
              <span>HITL MOM Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F9C7] animate-pulse" />
            </button>
            <button
              onClick={() => handleNavToTab('traceability')}
              className="hover:text-[#00F9C7] transition-colors"
            >
              Traceability Matrix
            </button>
            <button
              onClick={() => handleNavToTab('security')}
              className="hover:text-[#00F9C7] transition-colors"
            >
              Security & RAG
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-[#00F9C7] transition-colors"
            >
              Pricing
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-850 rounded-xl transition min-h-[40px]"
            >
              Log In
            </button>

            <button
              onClick={onOpenSignup}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-[#00F9C7] text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,249,199,0.3)] hover:shadow-[0_0_30px_rgba(0,249,199,0.5)] transition duration-200 min-h-[40px] flex items-center gap-1.5"
            >
              <span>Sign Up / Request Demo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-800/80">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#1D70F5]/20 via-[#00F9C7]/15 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#00F9C7] animate-ping" />
            <span className="font-semibold text-white">Next-Gen Enterprise Meeting Intelligence</span>
            <span className="text-slate-500">·</span>
            <span className="text-[#00F9C7] font-mono">SOC2 Type II</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            Turn Enterprise Meetings into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F9C7] to-[#80CCE3] drop-shadow-[0_0_25px_rgba(0,249,199,0.35)]">
              Verifiable Executive Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Automate speaker diarization, interactive 3-pane MOM refinement, and vector-grounded RAG audit trails across your organization.
          </p>

          {/* Primary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onLaunchDemo('dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00F9C7] hover:bg-[#00E5B6] text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-[0_0_25px_rgba(0,249,199,0.35)] hover:shadow-[0_0_35px_rgba(0,249,199,0.5)] flex items-center justify-center gap-2.5 active:scale-98 min-h-[50px]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Launch Workspace Demo</span>
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 min-h-[50px]"
            >
              <span>Explore Platform Capabilities</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F9C7]" />
              <span className="text-slate-200 font-bold">142 Meetings Indexed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F9C7]" />
              <span className="text-slate-200 font-bold">96.4% Decision Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F9C7]" />
              <span className="text-slate-200 font-bold">Zero Mock Stubs</span>
            </div>
          </div>

          {/* Interactive Hero Mockup Switcher Controls */}
          <div id="hero-mockup" className="pt-8 space-y-4">
            
            {/* Interactive Preview Tabs */}
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md overflow-x-auto max-w-full">
                {[
                  { id: 'dashboard' as HeroPreviewTab, label: 'Dashboard Overview', icon: LayoutDashboard },
                  { id: 'hitl' as HeroPreviewTab, label: '3-Pane HITL MOM Editor', icon: FileEdit },
                  { id: 'traceability' as HeroPreviewTab, label: 'Decision Traceability Matrix', icon: GitBranch },
                  { id: 'security' as HeroPreviewTab, label: 'Security & RAG Settings', icon: Lock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeHeroTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHeroTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        isActive
                          ? 'bg-[#00F9C7] text-slate-950 shadow-[0_0_15px_rgba(0,249,199,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Embedded Floating Hero Card Container */}
            <div className="relative mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/90 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden p-2 sm:p-4 ring-1 ring-[#00F9C7]/20 group">
              
              {/* Fake Window Chrome */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/80 rounded-t-xl mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-xs text-slate-400 font-bold truncate">
                    {activeHeroTab === 'dashboard' && 'Executive Intelligence Overview · Live Feed'}
                    {activeHeroTab === 'hitl' && 'Q4 Product Strategy Sync · 00:14:28:12 / 00:45:00:00'}
                    {activeHeroTab === 'traceability' && 'Decision Traceability Matrix · RAG Grounded Citations'}
                    {activeHeroTab === 'security' && 'Platform Configuration · 90% Confidence Threshold'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-[#00F9C7]/15 text-[#00F9C7] px-2.5 py-0.5 rounded border border-[#00F9C7]/30 shadow-xs">
                    {activeHeroTab.toUpperCase()} ACTIVE
                  </span>
                </div>
              </div>

              {/* TAB 1 CONTENT: DASHBOARD OVERVIEW MOCKUP */}
              {activeHeroTab === 'dashboard' && (
                <div
                  onClick={() => onLaunchDemo('dashboard')}
                  className="space-y-4 p-2 cursor-pointer text-left"
                >
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold uppercase">
                        <span>Total Meetings</span>
                        <BarChart3 className="w-3.5 h-3.5 text-[#1D70F5]" />
                      </div>
                      <div className="mt-2 text-2xl font-black font-mono text-white">142</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">+12.4% vs last mo</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold uppercase">
                        <span>Pending Actions</span>
                        <Target className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="mt-2 text-2xl font-black font-mono text-white">28</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">82% closure velocity</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold uppercase">
                        <span>Decision Accuracy</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="mt-2 text-2xl font-black font-mono text-white">96.4%</div>
                      <div className="text-[11px] text-[#00F9C7] font-semibold mt-0.5">0 disputed in Q4</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="flex justify-between text-slate-400 text-[11px] font-bold uppercase">
                        <span>Avg Duration</span>
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="mt-2 text-2xl font-black font-mono text-white">38m</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">-14% time saved</div>
                    </div>
                  </div>

                  {/* Chart Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8 p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Sentiment Trajectory Curve</span>
                        <div className="flex gap-3 text-[10px] font-mono">
                          <span className="text-[#1D70F5]">■ 82% Positive</span>
                          <span className="text-slate-400">■ 14% Neutral</span>
                          <span className="text-rose-400">■ 4% Skeptical</span>
                        </div>
                      </div>
                      <div className="h-28 w-full flex items-end gap-1.5 pt-4">
                        {[40, 55, 62, 78, 65, 85, 92, 88, 70, 95, 90, 84, 88, 92].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end h-full">
                            <div
                              className="w-full rounded-t bg-gradient-to-t from-[#1D70F5] to-[#00F9C7] opacity-80 hover:opacity-100 transition"
                              style={{ height: `${val}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-4 p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                      <div className="text-xs font-bold text-white">Vocal Engagement Parity</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>Marcus Vance</span>
                          <span className="font-mono text-[#00F9C7]">45% (18m)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#1D70F5] h-full w-[45%]" />
                        </div>

                        <div className="flex justify-between text-slate-300">
                          <span>Elena Rostova</span>
                          <span className="font-mono text-[#00F9C7]">30% (12m)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[30%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2 CONTENT: 3-PANE HITL MOM EDITOR MOCKUP */}
              {activeHeroTab === 'hitl' && (
                <div
                  onClick={() => onLaunchDemo('mom-editor')}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 cursor-pointer text-left"
                >
                  {/* Pane 1: Video Player (4 cols) */}
                  <div className="md:col-span-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative aspect-video flex flex-col justify-end p-3">
                    <img
                      src={meetingVideoFeed}
                      alt="Meeting Recording"
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-102 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />
                    
                    <div className="relative z-10 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-[#00F9C7] animate-pulse" />
                        <span className="font-bold">Marcus Vance</span>
                      </div>
                      <span className="font-mono text-[10px] bg-red-600 px-1.5 py-0.5 rounded font-bold">LIVE REC</span>
                    </div>

                    <div className="relative z-10 mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-[#1D70F5]" />
                    </div>
                  </div>

                  {/* Pane 2: Diarized Transcript (4 cols) */}
                  <div className="md:col-span-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400 text-[11px]">
                      <span className="font-bold text-white">Diarized Transcript</span>
                      <span>14 Turns</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-2 rounded bg-slate-900 border-l-2 border-[#1D70F5]">
                        <div className="flex justify-between text-[10px] text-blue-400 font-bold">
                          <span>Elena Rostova</span>
                          <span>[00:03:36]</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs mt-0.5">
                          &ldquo;Let’s resolve the gateway fork today...&rdquo;
                        </p>
                      </div>

                      <div className="p-2 rounded bg-[#00F9C7]/10 border-l-2 border-[#00F9C7]">
                        <div className="flex justify-between text-[10px] text-[#00F9C7] font-bold">
                          <span>Marcus Vance (Decision)</span>
                          <span>[00:04:36]</span>
                        </div>
                        <p className="text-white font-sans text-xs mt-0.5">
                          &ldquo;We maintain backwards compatibility via Envoy reverse-proxy...&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pane 3: Editable Minutes of Meeting (4 cols) */}
                  <div className="md:col-span-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400 text-[11px]">
                      <span className="font-bold text-white">Executive Minutes (MOM)</span>
                      <span className="text-[#00F9C7] font-bold">Autosaved</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Action Item
                        </div>
                        <div className="text-xs text-white font-medium mt-0.5">
                          Publish GraphQL Gateway RFC & Envoy Spec
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Marcus Vance</span>
                          <span className="text-rose-400 font-bold">High Priority</span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Locked Decision DEC-104
                        </div>
                        <div className="text-xs text-slate-200 font-medium mt-0.5">
                          Adopt GraphQL Federation Gateway with Envoy Wrapper
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3 CONTENT: DECISION TRACEABILITY MATRIX MOCKUP */}
              {activeHeroTab === 'traceability' && (
                <div
                  onClick={() => onLaunchDemo('traceability')}
                  className="space-y-3 p-2 cursor-pointer text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Vector Cosine Dist</div>
                      <div className="mt-1 text-xl font-black font-mono text-[#00F9C7]">0.082 <span className="text-xs text-slate-500 font-normal">dense match</span></div>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Verification Rate</div>
                      <div className="mt-1 text-xl font-black font-mono text-emerald-400">100% (4/4 Locked)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Active Scope</div>
                      <div className="mt-1 text-xs font-bold text-white truncate">Q4 Product Strategy Sync</div>
                    </div>
                  </div>

                  {/* Decision Card 1 */}
                  <div className="rounded-xl border border-[#00F9C7]/30 bg-slate-950/90 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          DEC-104
                        </span>
                        <span className="font-bold text-white">Adopt GraphQL Federation Gateway with Envoy Wrapper</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00F9C7] bg-[#00F9C7]/10 px-2 py-0.5 rounded">
                        [00:04:36] Jump
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      &ldquo;We maintain backwards compatibility via Envoy reverse-proxy and unify subgraphs gradually without downtime.&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Consensus: Elena (Approved) · Marcus (Approved) · Sarah (Proposed)</span>
                      <span className="text-emerald-400 font-bold">VERIFIED RAG CITATION</span>
                    </div>
                  </div>

                  {/* Decision Card 2 */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          DEC-105
                        </span>
                        <span className="font-bold text-white">Client-Side SQLite with CRDT Conflict Resolution</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00F9C7] bg-[#00F9C7]/10 px-2 py-0.5 rounded">
                        [00:12:15] Jump
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4 CONTENT: SECURITY & RAG SETTINGS MOCKUP */}
              {activeHeroTab === 'security' && (
                <div
                  onClick={() => onLaunchDemo('settings')}
                  className="space-y-4 p-2 cursor-pointer text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Cpu className="w-4 h-4 text-[#00F9C7]" />
                        <span>AI Extraction Confidence Threshold</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                        <span>Minimum Peer Review Cutoff</span>
                        <span className="text-[#00F9C7]">90% Required</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00F9C7] h-full w-[90%]" />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Automated decision tags under 90% confidence trigger mandatory human review.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Active Enterprise Connectors</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                          <span>Jira Software Cloud (Auto-create sprint issues)</span>
                          <span className="text-emerald-400 font-bold">CONNECTED</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                          <span>Slack #executive-sync (Minutes broadcast)</span>
                          <span className="text-emerald-400 font-bold">CONNECTED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Interactive Trigger Banner */}
              <div className="mt-3 py-2.5 px-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00F9C7]" />
                  <span>Previewing active high-density UI component · Click anywhere to launch live workspace</span>
                </span>
                <button
                  onClick={() => onLaunchDemo(activeHeroTab === 'dashboard' ? 'dashboard' : activeHeroTab === 'hitl' ? 'mom-editor' : activeHeroTab === 'traceability' ? 'traceability' : 'settings')}
                  className="font-bold text-[#00F9C7] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Launch Live Interactive Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Interactive Feature Showcases Section */}
      <section id="features" className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F9C7]">
              ENTERPRISE PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Engineered for Executive Teams & Regulated Orgs
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              No hallucinated summaries. Every commitment is tied to verbatim speech with complete human-in-the-loop oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  onClick={() => onLaunchDemo(feat.targetTab)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 hover:border-[#00F9C7]/60 hover:bg-slate-900 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#00F9C7]/10 text-[#00F9C7] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold uppercase bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-[#00F9C7] transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-sm text-slate-400 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#00F9C7]">{feat.stats}</span>
                    <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold transition">
                      <span>Explore Live View</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#00F9C7]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Pricing / Enterprise Tiers Section */}
      <section id="pricing" className="py-20 border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F9C7]">
              TRANSPARENT ENTERPRISE LICENSING
            </span>
            <h2 className="text-3xl font-black text-white">
              Scalable for High-Velocity Leadership
            </h2>
            <p className="text-sm text-slate-400">
              Deploy in your dedicated AWS/GCP virtual private cloud or access our multi-tenant SaaS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="text-sm font-bold text-white">For Scaling Teams</div>
              <div className="text-3xl font-extrabold text-white font-mono">$49 <span className="text-xs text-slate-400 font-sans">/ seat / mo</span></div>
              <p className="text-xs text-slate-400">Up to 50 hours of diarized meeting transcription & MOM export.</p>
              <button
                onClick={onOpenSignup}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-white transition"
              >
                Start Free Trial
              </button>
            </div>

            {/* Tier 2 (Highlighted) */}
            <div className="rounded-2xl border-2 border-[#00F9C7] bg-slate-900 p-6 space-y-4 relative shadow-[0_0_30px_rgba(0,249,199,0.15)]">
              <div className="absolute -top-3 right-6 bg-[#00F9C7] text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-sm font-bold text-white">Enterprise Guild</div>
              <div className="text-3xl font-extrabold text-white font-mono">$99 <span className="text-xs text-slate-400 font-sans">/ seat / mo</span></div>
              <p className="text-xs text-slate-300">Unlimited diarization, full RAG decision matrix, and Jira/Slack connectors.</p>
              <button
                onClick={() => onLaunchDemo('mom-editor')}
                className="w-full py-2.5 rounded-xl bg-[#00F9C7] hover:bg-[#00E5B6] text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-md"
              >
                Launch Workspace Demo
              </button>
            </div>

            {/* Tier 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="text-sm font-bold text-white">Dedicated VPC / Air-Gapped</div>
              <div className="text-3xl font-extrabold text-white font-mono">Custom</div>
              <p className="text-xs text-slate-400">On-premise deployment, custom vector embeddings, SLA guarantees.</p>
              <button
                onClick={onOpenSignup}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-white transition"
              >
                Contact Solutions Architect
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 bg-slate-950 text-xs text-slate-500 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MeetSync AI</span>
            <span>·</span>
            <span>Enterprise Meeting Intelligence & Decision Auditing</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenLogin} className="hover:text-slate-300">Sign In</button>
            <button onClick={onOpenSignup} className="hover:text-slate-300">Request Demo</button>
            <button onClick={() => onLaunchDemo('mom-editor')} className="hover:text-[#00F9C7] font-semibold">Workspace Demo</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
