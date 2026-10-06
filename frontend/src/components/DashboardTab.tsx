import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Target,
  FileText,
  Search,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Meeting } from '../types';
import { EmptyState } from './common/EmptyState';

interface DashboardTabProps {
  meetings: Meeting[];
  selectedMeeting?: Meeting | null;
  onSelectMeeting: (id: string) => void;
  onOpenEditor: () => void;
  onOpenTraceability: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  meetings,
  selectedMeeting,
  onSelectMeeting,
  onOpenEditor,
  onOpenTraceability,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  if (meetings.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
            Executive Meeting Intelligence
          </h1>
          <p className="mt-1 text-sm font-medium opacity-90 text-[#00634E] dark:text-[#70E4D3]">
            Real-time multi-meeting synthesis, sentiment telemetry, and decision traceability audits
          </p>
        </div>
        <EmptyState
          title="No Meetings Indexed"
          description="Your enterprise backend currently has zero recorded meetings. Connect an automated stream or upload a recording."
        />
      </div>
    );
  }

  const activeMeeting = selectedMeeting || meetings[0];

  // Filtered meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'All' || m.department.includes(filterDepartment);
    return matchesSearch && matchesDept;
  });

  // Calculate action item stats
  const totalActionItems = meetings.reduce((acc, m) => acc + m.actionItems.length, 0);
  const completedActionItems = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => a.completed).length,
    0
  );
  const pendingActionItems = totalActionItems - completedActionItems;

  // Department velocity data for recharts
  const departmentVelocityData = [
    { department: 'Product', completed: 42, open: 8 },
    { department: 'Engineering', completed: 68, open: 12 },
    { department: 'Design', completed: 24, open: 4 },
    { department: 'Security', completed: 18, open: 2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
            Executive Meeting Intelligence
          </h1>
          <p className="mt-1 text-sm font-medium opacity-90 text-[#00634E] dark:text-[#70E4D3]">
            Real-time multi-meeting synthesis, sentiment telemetry, and decision traceability audits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-2 rounded-xl bg-[#1D70F5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#165fd4] transition min-h-[44px]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open Current MOM Editor</span>
          </button>
        </div>
      </div>

      {/* Section 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Meetings */}
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Meetings</span>
            <div className="rounded-xl bg-[#1D70F5]/10 p-2 text-[#1D70F5] dark:bg-[#1D70F5]/20">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
              142
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +12.4%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Across 4 departments</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>48.2 hrs logged</span>
          </div>
        </div>

        {/* Card 2: Action Items Pending */}
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action Items</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {pendingActionItems}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              pending / {totalActionItems} total
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">82% closure rate</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Avg 3.2 days to done</span>
          </div>
        </div>

        {/* Card 3: Decision Accuracy */}
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Decision Accuracy</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-[#067330] dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
              96.4%
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +2.1%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>RAG-verified quotes</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>0 disputed in Q4</span>
          </div>
        </div>

        {/* Card 4: Avg Meeting Duration */}
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Duration</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
              38m
            </span>
            <span className="text-xs font-semibold text-[#067330] dark:text-emerald-400">
              -14% time saved
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Median 30m</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Prep AI enabled</span>
          </div>
        </div>
      </div>

      {/* Section 2: Recharts Analytics Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Sentiment Trends (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#B0DEED] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sentiment & Engagement Trajectory
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Continuous acoustic & NLP sentiment analysis for: {activeMeeting.title}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1D70F5]" />
                <span className="text-slate-600 dark:text-slate-300">Positive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">Neutral</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">Skeptical</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeMeeting.sentimentTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D70F5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1D70F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSkeptical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timeLabel"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                          <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            Timecode: {data.timeLabel}
                          </div>
                          <div className="mt-1.5 space-y-1">
                            <div className="flex justify-between gap-4 text-blue-600 dark:text-blue-400">
                              <span>Positive:</span>
                              <span className="font-mono font-bold">{data.positive}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                              <span>Neutral:</span>
                              <span className="font-mono font-bold">{data.neutral}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-500">
                              <span>Skeptical:</span>
                              <span className="font-mono font-bold">{data.skeptical}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stroke="#1D70F5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPositive)"
                />
                <Area
                  type="monotone"
                  dataKey="skeptical"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorSkeptical)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Speaker Airtime Distribution (1 col) */}
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Speaker Airtime
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Vocal engagement & speaking parity
            </p>
          </div>

          <div className="mt-2 h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeMeeting.speakerAirtime}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="percentage"
                >
                  {activeMeeting.speakerAirtime.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${Math.round(item.payload.durationSeconds / 60)}m)`,
                    item.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Legend */}
          <div className="space-y-2 pt-2">
            {activeMeeting.speakerAirtime.map((speaker) => (
              <div key={speaker.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: speaker.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {speaker.name}
                  </span>
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {speaker.percentage}% ({Math.round(speaker.durationSeconds / 60)}m)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Department Action Item Velocity */}
      <div className="rounded-2xl border border-[#B0DEED] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Action Item Execution Velocity by Department
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Completed commitments vs open deliverables across active sprints
            </p>
          </div>
        </div>

        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="department" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#067330" name="Completed Items" radius={[4, 4, 0, 0]} />
              <Bar dataKey="open" fill="#1D70F5" name="Open Items" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 4: Recent Meeting Repository Table */}
      <div className="rounded-2xl border border-[#B0DEED] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Meeting Repository & Diarized Archives
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Indexed recordings with synchronized transcripts, MOM notes, and verified decisions
            </p>
          </div>

          {/* Interactive Filters (Buttons, no pills) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {['All', 'Product', 'Engineering', 'Design', 'Security'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilterDepartment(dept)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    filterDepartment === dept
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="py-3 px-3">Meeting Title & Details</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Attendees</th>
                <th className="py-3 px-3">Decisions</th>
                <th className="py-3 px-3">Action Items</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/80">
              {filteredMeetings.map((meeting) => {
                const isCurrent = meeting.id === selectedMeeting?.id;
                return (
                  <tr
                    key={meeting.id}
                    className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      isCurrent ? 'bg-[#1D70F5]/5 dark:bg-[#1D70F5]/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {meeting.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{meeting.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {Math.round(meeting.durationSeconds / 60)} mins
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Host: {meeting.organizer}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {meeting.department}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex -space-x-1.5">
                        {meeting.attendees.map((attendee) => (
                          <img
                            key={attendee.id}
                            src={attendee.avatarUrl}
                            alt={attendee.name}
                            title={`${attendee.name} (${attendee.role})`}
                            className="h-6 w-6 rounded-full border border-white dark:border-slate-800 object-cover"
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                      {meeting.decisions.length}
                    </td>

                    <td className="py-3.5 px-3 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {meeting.actionItems.filter((a) => a.completed).length}
                      </span>
                      <span className="text-slate-400">/{meeting.actionItems.length}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-xs font-semibold ${
                          meeting.status === 'Approved'
                            ? 'text-[#067330] dark:text-emerald-400'
                            : meeting.status === 'Ready for Review'
                            ? 'text-[#1D70F5] dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            onSelectMeeting(meeting.id);
                            onOpenEditor();
                          }}
                          className="rounded-lg border border-[#B0DEED] bg-white px-2.5 py-1 text-xs font-semibold text-[#1D70F5] shadow-2xs hover:bg-[#1D70F5] hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-[#1D70F5] dark:hover:text-white transition min-h-[36px]"
                        >
                          HITL Editor
                        </button>
                        <button
                          onClick={() => {
                            onSelectMeeting(meeting.id);
                            onOpenTraceability();
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition min-h-[36px]"
                        >
                          Decisions
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
