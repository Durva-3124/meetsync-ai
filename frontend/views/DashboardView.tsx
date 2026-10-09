import React from 'react';
import {
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  Upload,
  FileEdit,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Video,
  FolderOpen,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AnalyticsData, Meeting } from '../types';
import { SentimentTrajectoryChart } from '../components/charts/SentimentTrajectoryChart';
import { SpeakerAirtimeDonut } from '../components/charts/SpeakerAirtimeDonut';

interface Props {
  analytics: AnalyticsData | null;
  activeMeeting: Meeting | null;
  onOpenUpload: () => void;
  onOpenEditor: () => void;
  onOpenStartMeeting?: () => void;
  onSeedMeeting?: () => void;
  onSelectMeeting: (id: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  analytics,
  activeMeeting,
  onOpenUpload,
  onOpenEditor,
  onOpenStartMeeting,
  onSeedMeeting,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const kpis = analytics?.kpis || {
    totalMeetings: {
      value: 0,
      change: '0%',
      subtitle: 'Across 0 departments · 0.0 hrs logged',
    },
    actionItems: {
      pending: 0,
      total: 0,
      closureRate: '0%',
      avgDaysToDone: '0',
      subtitle: '0% closure rate · Avg 0 days to done',
    },
    decisionAccuracy: {
      value: '0%',
      change: '0%',
      subtitle: 'RAG-verified quotes · 0 disputed in Q4',
    },
    avgDuration: {
      value: '0m',
      timeSaved: '0%',
      median: '0m',
      subtitle: 'Median 0m · Prep AI enabled',
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Executive Headline & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--heading)]">
            Executive Meeting Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real-time multi-meeting synthesis, sentiment telemetry, and decision traceability audits
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {onOpenStartMeeting && (
            <button
              onClick={onOpenStartMeeting}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Start Instant Meeting</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-md shadow-[#00F5D4]/20 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Meeting Media</span>
          </button>

          {activeMeeting && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--primary)] transition-all active:scale-95"
            >
              <FileEdit className="w-4 h-4 text-[var(--primary)]" />
              <span>Open MOM Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Row of 4 Metric KPI Cards - All labels and numbers use --text-primary & --text-secondary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL MEETINGS */}
        <div className="rounded-xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Total Meetings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[var(--text-primary)]">
              {kpis.totalMeetings.value}
            </span>
            {kpis.totalMeetings.value > 0 && (
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {kpis.totalMeetings.change}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {kpis.totalMeetings.subtitle}
          </p>
        </div>

        {/* KPI 2: ACTION ITEMS */}
        <div className="rounded-xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Action Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--icon-bg-warning)] border border-amber-500/20 flex items-center justify-center text-[var(--warning)]">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[var(--text-primary)]">
              {kpis.actionItems.pending}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              pending / {kpis.actionItems.total} total
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-2">
            <span className="text-[var(--positive)] font-semibold">{kpis.actionItems.closureRate} closure rate</span>{' '}
            · Avg {kpis.actionItems.avgDaysToDone} days to done
          </p>
        </div>

        {/* KPI 3: DECISION ACCURACY */}
        <div className="rounded-xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Decision Accuracy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--icon-bg-success)] border border-emerald-500/20 flex items-center justify-center text-[var(--success)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[var(--text-primary)]">
              {kpis.decisionAccuracy.value}
            </span>
            {kpis.totalMeetings.value > 0 && (
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {kpis.decisionAccuracy.change}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {kpis.decisionAccuracy.subtitle}
          </p>
        </div>

        {/* KPI 4: AVG DURATION */}
        <div className="rounded-xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Avg Duration
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--icon-bg-purple)] border border-purple-500/20 flex items-center justify-center text-[var(--purple)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[var(--text-primary)]">
              {kpis.avgDuration.value}
            </span>
            {kpis.totalMeetings.value > 0 && (
              <span className="text-xs font-bold text-emerald-500">
                {kpis.avgDuration.timeSaved} time saved
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {kpis.avgDuration.subtitle}
          </p>
        </div>
      </div>

      {/* Visual Analytics Row: Sentiment Trajectory (65%) + Speaker Airtime Donut (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SentimentTrajectoryChart
            data={activeMeeting?.sentimentTrajectory || []}
            meetingTitle={activeMeeting?.title || 'Session Telemetry Analysis'}
          />
        </div>

        <div className="lg:col-span-4">
          <SpeakerAirtimeDonut data={activeMeeting?.speakerAirtime || []} />
        </div>
      </div>

      {/* Active Meeting Executive Snapshot Card OR Empty Session Gateway Banner */}
      {activeMeeting ? (
        <div className="rounded-xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border)] mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Active Meeting Focus: {activeMeeting.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono">
                {activeMeeting.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span>{activeMeeting.date}</span>
              <span>·</span>
              <span>{activeMeeting.duration}</span>
              <span>·</span>
              <span>{activeMeeting.attendeesCount} participants</span>
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1 text-[var(--primary)] hover:underline font-semibold ml-2"
              >
                <span>Edit Minutes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Summary preview */}
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Executive Synthesis
              </span>
              <p className="text-[var(--text-primary)] leading-relaxed">
                {activeMeeting.executiveSummary}
              </p>
            </div>

            {/* Quick stats */}
            <div className="space-y-2 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">RAG Verification Score:</span>
                <span className="font-mono font-bold text-[var(--positive)]">
                  {activeMeeting.decisionAccuracy}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Ratified Decisions:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {activeMeeting.decisions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Skill-Matched Tasks:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {activeMeeting.actionItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6 sm:p-8 border border-dashed border-[var(--border)] bg-[var(--card)] text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Ready to Begin Live Meeting Analysis
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            No active meetings are currently loaded. Use the top gateway to start an instant live session, join with a meeting code, or upload media recordings.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {onOpenStartMeeting && (
              <button
                onClick={onOpenStartMeeting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Start Instant Meeting</span>
              </button>
            )}
            {onSeedMeeting && (
              <button
                onClick={onSeedMeeting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--primary)] transition-all"
              >
                <Sparkles className="w-4 h-4 text-[var(--heading)]" />
                <span>Seed Sample Sync</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
