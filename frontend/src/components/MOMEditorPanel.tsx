import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Share2,
  Download,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Flag,
  Save,
  CheckSquare,
  Square,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  GitCommit,
} from 'lucide-react';
import { Meeting, ActionItem, MeetingDecision, Speaker } from '../types';
import { formatDuration } from '../utils/time';

interface MOMEditorPanelProps {
  meeting: Meeting;
  speakers: Record<string, Speaker>;
  onSeek: (seconds: number) => void;
  onUpdateKeyTakeaways: (takeaways: string[]) => void;
  onToggleActionItem: (id: string) => void;
  onAddActionItem: (item: Omit<ActionItem, 'id'>) => void;
  onDeleteActionItem: (id: string) => void;
  onPublishMOM: () => void;
  onExport: (format: 'pdf' | 'markdown' | 'jira') => void;
}

export const MOMEditorPanel: React.FC<MOMEditorPanelProps> = ({
  meeting,
  speakers,
  onSeek,
  onUpdateKeyTakeaways,
  onToggleActionItem,
  onAddActionItem,
  onDeleteActionItem,
  onPublishMOM,
  onExport,
}) => {
  const [takeaways, setTakeaways] = useState<string[]>(meeting.keyTakeaways || []);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [showAddActionModal, setShowAddActionModal] = useState<boolean>(false);

  React.useEffect(() => {
    setTakeaways(meeting.keyTakeaways || []);
  }, [meeting.id, meeting.keyTakeaways]);

  // New action item state
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Marcus Vance');
  const [newDueDate, setNewDueDate] = useState('2026-10-16');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');

  const handleTakeawayChange = (index: number, val: string) => {
    const updated = [...takeaways];
    updated[index] = val;
    setTakeaways(updated);
    onUpdateKeyTakeaways(updated);
  };

  const handleAddTakeaway = () => {
    const updated = [...takeaways, 'New executive takeaway bullet point...'];
    setTakeaways(updated);
    onUpdateKeyTakeaways(updated);
  };

  const handleDeleteTakeaway = (index: number) => {
    const updated = takeaways.filter((_, i) => i !== index);
    setTakeaways(updated);
    onUpdateKeyTakeaways(updated);
  };

  // Simulated AI synthesis polish
  const handleAIPolish = () => {
    setIsPolishing(true);
    setTimeout(() => {
      const polished = takeaways.map((t) => {
        if (!t.endsWith('.')) return `${t}.`;
        return t;
      });
      setTakeaways(polished);
      onUpdateKeyTakeaways(polished);
      setIsPolishing(false);
    }, 700);
  };

  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddActionItem({
      title: newTitle,
      assignee: newAssignee,
      dueDate: newDueDate,
      priority: newPriority,
      completed: false,
      originTimestamp: 0,
    });

    setNewTitle('');
    setShowAddActionModal(false);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#B0DEED] bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-colors">
      
      {/* Top Header & HITL Badge */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Executive Minutes (MOM)
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-[#067330] dark:text-emerald-400">
              HITL Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Human-in-the-loop review mode active · Autosaved
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExport('pdf')}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-h-[36px]"
            title="Export Minutes to PDF"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={() => onExport('jira')}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-h-[36px]"
            title="Sync to Jira/Linear"
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Jira Sync</span>
          </button>

          <button
            onClick={onPublishMOM}
            className="flex items-center gap-1.5 rounded-lg bg-[#067330] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#055c26] transition min-h-[36px]"
            title="Approve and Publish finalized MOM"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approve MOM</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Section 1: Executive Summary & Key Takeaways */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Strategic Takeaways
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAIPolish}
                disabled={isPolishing}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#1D70F5] hover:underline"
              >
                <Sparkles className={`h-3 w-3 ${isPolishing ? 'animate-spin' : ''}`} />
                <span>{isPolishing ? 'Refining...' : 'AI Refine'}</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={handleAddTakeaway}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Add Bullet</span>
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {takeaways.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>No key strategic takeaways recorded yet.</p>
                <button
                  onClick={handleAddTakeaway}
                  className="mt-1 text-[#1D70F5] dark:text-[#00F9C7] font-semibold hover:underline"
                >
                  + Add First Key Takeaway
                </button>
              </div>
            ) : (
              takeaways.map((item, idx) => (
                <div key={idx} className="group flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1D70F5] shrink-0" />
                  <textarea
                    value={item}
                    onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                    rows={2}
                    className="flex-1 rounded-lg border border-transparent p-1.5 text-xs text-slate-800 leading-relaxed outline-none transition focus:border-[#1D70F5] focus:bg-white hover:border-slate-200 dark:text-slate-200 dark:focus:bg-slate-800 dark:hover:border-slate-700"
                  />
                  <button
                    onClick={() => handleDeleteTakeaway(idx)}
                    className="mt-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1"
                    title="Delete bullet"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Action Items Table / List */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Action Items & Ownership
              </h3>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                ({meeting.actionItems.filter((a) => a.completed).length}/{meeting.actionItems.length})
              </span>
            </div>

            <button
              onClick={() => setShowAddActionModal(true)}
              className="flex items-center gap-1 rounded-md bg-[#1D70F5]/10 px-2 py-1 text-[11px] font-semibold text-[#1D70F5] hover:bg-[#1D70F5]/20 dark:bg-[#1D70F5]/20"
            >
              <Plus className="h-3 w-3" />
              <span>Add Action Item</span>
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {meeting.actionItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>No action items assigned for this meeting yet.</p>
                <button
                  onClick={() => setShowAddActionModal(true)}
                  className="mt-2 text-[#1D70F5] dark:text-[#00F9C7] font-semibold hover:underline"
                >
                  + Add First Action Item
                </button>
              </div>
            ) : (
              meeting.actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-start justify-between gap-3 rounded-xl border p-2.5 transition ${
                    item.completed
                      ? 'border-slate-200/60 bg-slate-50/50 opacity-70 dark:border-slate-800 dark:bg-slate-900/40'
                      : 'border-slate-200 bg-white hover:border-[#B0DEED] dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleActionItem(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-[#1D70F5] transition"
                    >
                      {item.completed ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-semibold ${
                          item.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {/* Assignee */}
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{item.assignee}</span>
                        </div>

                        {/* Due date */}
                        <div className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{item.dueDate}</span>
                        </div>

                        {/* Priority */}
                        <span
                          className={`text-[10px] font-bold uppercase font-mono ${
                            item.priority === 'high'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.priority === 'medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.priority}
                        </span>

                        {/* Origin Timestamp Link */}
                        {item.originTimestamp !== undefined && item.originTimestamp > 0 && (
                          <button
                            onClick={() => onSeek(item.originTimestamp!)}
                            className="flex items-center gap-0.5 text-[#1D70F5] hover:underline font-mono"
                            title="Seek to audio moment where this was assigned"
                          >
                            <Clock className="h-2.5 w-2.5" />
                            <span>{formatDuration(item.originTimestamp)}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteActionItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1"
                    title="Remove action item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Decisions Log Preview */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Decisions Recorded
            </h3>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
              {meeting.decisions.length} Decisions Logged
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {meeting.decisions.map((dec) => (
              <div
                key={dec.id}
                className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
              >
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-mono text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      {dec.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      · {dec.category}
                    </span>
                  </div>
                  <button
                    onClick={() => onSeek(dec.citationTimestamp)}
                    className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#1D70F5] hover:underline"
                  >
                    <span>{formatDuration(dec.citationTimestamp)}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {dec.statement}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Action Item Modal */}
      {showAddActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#B0DEED] bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Create New Action Item
            </h4>
            <form onSubmit={handleCreateActionItem} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Deliverable Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Finalize GraphQL benchmark report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {Object.values(speakers).map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="high">High (P0)</option>
                    <option value="medium">Medium (P1)</option>
                    <option value="low">Low (P2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddActionModal(false)}
                  className="rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1D70F5] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#165fd4]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
