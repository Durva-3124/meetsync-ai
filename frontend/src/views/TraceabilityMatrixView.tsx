import React, { useState } from 'react';
import { GitBranch, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Meeting } from '../types';

interface Props {
  meetings: Meeting[];
  onSelectMeetingAndTrace: (meetingId: string, transcriptId: string) => void;
}

export const TraceabilityMatrixView: React.FC<Props> = ({ meetings, onSelectMeetingAndTrace }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Under Review' | 'Disputed'>('all');

  const allDecisions = meetings.flatMap((m) =>
    m.decisions.map((d) => ({
      ...d,
      meetingId: m.id,
      meetingTitle: m.title,
      department: m.department,
      date: m.date,
    }))
  );

  const filtered = allDecisions.filter((d) => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.transcriptQuote.toLowerCase().includes(search.toLowerCase()) ||
      d.meetingTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.speaker.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--heading)]">
              Decision Traceability Matrix
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              98.2% Average Grounding
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Cryptographic cross-meeting audit trail mapping ratified executive decisions to verifiable diarized audio
          </p>
        </div>

        <button
          onClick={() => {
            alert('Exporting SOC2 Type II Traceability Audit Report (PDF/CSV)...');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions, quotes, meetings, or speakers..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-[var(--text-secondary)] font-medium">Status:</span>
          {(['all', 'Approved', 'Under Review'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[var(--primary)] text-white font-semibold'
                  : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--background)]"
            >
              <tr>
                <th className="py-3 px-4">Ratified Decision</th>
                <th className="py-3 px-4">Meeting & Department</th>
                <th className="py-3 px-4">Speaker & Timestamp</th>
                <th className="py-3 px-4">RAG Confidence</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Trace Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[var(--background)]/50"
                >
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] max-w-xs">
                    <div>{item.title}</div>
                    <div className="text-[11px] text-[var(--text-secondary)] italic font-normal mt-1 line-clamp-1">
                      {item.transcriptQuote}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-primary)]">
                    <div className="font-medium">{item.meetingTitle}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{item.department}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-primary)]">
                    <div className="font-medium">{item.speaker}</div>
                    <div className="font-mono text-[10px] text-[var(--text-secondary)]">{item.timestamp}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#00F5D4]">
                      <span>{item.ragConfidence}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectMeetingAndTrace(item.meetingId, item.transcriptId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#00F5D4] hover:underline"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
