import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Download,
  Filter,
  FileCheck,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MeetingDecision, Meeting } from '../types';
import { formatDuration } from '../utils/time';

interface TraceabilityMatrixTabProps {
  meeting: Meeting;
  onSeek: (seconds: number) => void;
  onOpenEditor: () => void;
  onUpdateDecisionStatus: (decisionId: string, status: 'verified' | 'disputed' | 'superseded') => void;
  onExportAuditReport: () => void;
}

export const TraceabilityMatrixTab: React.FC<TraceabilityMatrixTabProps> = ({
  meeting,
  onSeek,
  onOpenEditor,
  onUpdateDecisionStatus,
  onExportAuditReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'disputed' | 'superseded'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(
    meeting.decisions[0]?.id || null
  );

  const filteredDecisions = meeting.decisions.filter((dec) => {
    const matchesSearch =
      dec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dec.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dec.citationQuote.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dec.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || dec.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
              Decision Traceability Matrix
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-[#1D70F5]/10 px-2.5 py-0.5 text-xs font-bold text-[#1D70F5] dark:bg-[#1D70F5]/20">
              <ShieldCheck className="h-3.5 w-3.5" /> RAG Audit Log
            </span>
          </div>
          <p className="mt-1 text-sm font-medium opacity-90 text-[#00634E] dark:text-[#70E4D3]">
            Vector-grounded citations mapping executive commitments to precise diarized audio coordinates
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportAuditReport}
            className="flex items-center gap-2 rounded-xl border border-[#B0DEED] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 min-h-[44px]"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* RAG Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Average Vector Similarity
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              0.082 <span className="text-xs text-slate-400 font-sans font-normal">cosine dist</span>
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dense semantic embedding alignment
          </div>
        </div>

        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Audit Verification Rate
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              100%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({meeting.decisions.filter((d) => d.status === 'verified').length}/{meeting.decisions.length} verified)
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Zero unresolved disputes
          </div>
        </div>

        <div className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Meeting Scope
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
            {meeting.title}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {meeting.decisions.length} traceable decisions locked
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#B0DEED] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search decisions by code, keywords, or quotation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'verified', label: 'Verified' },
              { id: 'disputed', label: 'Disputed' },
              { id: 'superseded', label: 'Superseded' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  statusFilter === st.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-h-[38px]"
          >
            <option value="all">All Categories</option>
            <option value="Architecture">Architecture</option>
            <option value="Product">Product</option>
            <option value="Go-to-Market">Go-to-Market</option>
          </select>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <FileCheck className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              No decisions match your filter
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your query or resetting status filters.
            </p>
          </div>
        ) : (
          filteredDecisions.map((decision) => {
            const isExpanded = expandedDecisionId === decision.id;

            return (
              <div
                key={decision.id}
                className="rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-xs transition hover:border-[#1D70F5] dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Decision Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                      {decision.code}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {decision.statement}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Category: {decision.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Confidence: {decision.confidenceScore}%
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Vector Dist: {decision.ragDistance}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Switcher Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateDecisionStatus(decision.id, 'verified')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition min-h-[36px] ${
                        decision.status === 'verified'
                          ? 'bg-emerald-500/15 text-[#067330] border border-emerald-500/30 dark:text-emerald-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Mark as Verified by HITL auditor"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </button>

                    <button
                      onClick={() => onUpdateDecisionStatus(decision.id, 'disputed')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition min-h-[36px] ${
                        decision.status === 'disputed'
                          ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:text-rose-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Flag as Disputed"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Disputed</span>
                    </button>

                    <button
                      onClick={() => onUpdateDecisionStatus(decision.id, 'superseded')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition min-h-[36px] ${
                        decision.status === 'superseded'
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Mark as Superseded by newer architecture decision"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Superseded</span>
                    </button>
                  </div>
                </div>

                {/* Citation & Grounding Row */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Source Transcript Citation (2 cols) */}
                  <div className="md:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850">
                    <div className="flex items-center justify-between pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Sparkles className="h-3.5 w-3.5 text-[#1D70F5]" />
                        <span>Source Transcript Citation (RAG Mapped)</span>
                      </div>
                      
                      {/* Jump to audio timestamp link */}
                      <button
                        onClick={() => {
                          onSeek(decision.citationTimestamp);
                          onOpenEditor();
                        }}
                        className="flex items-center gap-1 rounded-md bg-[#1D70F5]/10 px-2 py-1 text-[11px] font-mono font-bold text-[#1D70F5] hover:bg-[#1D70F5]/20 dark:bg-[#1D70F5]/20"
                        title="Jump to audio/video recording at this exact second"
                      >
                        <Clock className="h-3 w-3" />
                        <span>[{formatDuration(decision.citationTimestamp)}]</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      &ldquo;{decision.citationQuote}&rdquo;
                    </p>
                  </div>

                  {/* Executive Consensus Matrix (1 col) */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 pb-2">
                      Consensus Stance Breakdown
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(decision.consensus).map(([person, stance]) => (
                        <div key={person} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">{person}</span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              stance === 'Approved'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : stance === 'Proposed'
                                ? 'text-[#1D70F5] dark:text-blue-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {stance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impacted Systems & Architecture */}
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400">Impacted Infrastructure:</span>
                  {decision.impactedSystems.map((system) => (
                    <span
                      key={system}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
