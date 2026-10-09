import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  GitBranch,
  Settings,
  Upload,
  Folder,
  FolderOpen,
  CalendarX,
  Zap,
  ShieldCheck,
  ChevronRight,
  Keyboard,
  ChevronLeft,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab, MeetingSummaryItem } from '../types';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  recentMeetings: MeetingSummaryItem[];
  selectedMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onDeleteMeeting: (id: string, title: string) => void;
  onOpenUpload: () => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  recentMeetings,
  selectedMeetingId,
  onSelectMeeting,
  onDeleteMeeting,
  onOpenUpload,
  collapsed,
  setCollapsed,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Local state for delete confirmation dialog
  const [meetingToDelete, setMeetingToDelete] = useState<{ id: string; title: string } | null>(null);

  const confirmDelete = () => {
    if (meetingToDelete) {
      onDeleteMeeting(meetingToDelete.id, meetingToDelete.title);
      setMeetingToDelete(null);
    }
  };

  return (
    <>
      <aside
        className={`border-r transition-all duration-200 select-none flex flex-col justify-between shrink-0 ${
          collapsed ? 'w-16' : 'w-64 lg:w-72'
        } ${
          isDark
            ? 'bg-[#0B132B] border-[#334155] text-[#F8FAFC]'
            : 'bg-[#D9EBF3]/50 border-[#B6DFEF] text-[#101B35]'
        }`}
      >
        {/* Top Section */}
        <div className="p-3 lg:p-4 space-y-5 overflow-y-auto">
          {/* Platform View Header */}
          <div>
            {!collapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-2 mb-2">
                Platform View
              </p>
            )}

            <div className="space-y-1">
              {/* Dashboard Overview */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'text-[#F8FAFC] hover:bg-slate-800/60'
                    : 'text-[#101B35] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">Dashboard Overview</span>}
                </div>
                {!collapsed && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'dashboard'
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-blue-950/80 text-blue-400 border border-blue-800/40'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {recentMeetings.length > 0 ? `${recentMeetings.length} Sync` : '0 New'}
                  </span>
                )}
              </button>

              {/* HITL MOM Editor */}
              <button
                onClick={() => setActiveTab('editor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'editor'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'text-[#F8FAFC] hover:bg-slate-800/60'
                    : 'text-[#101B35] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileEdit className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">HITL MOM Editor</span>}
                </div>
                {!collapsed && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'editor'
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Active
                  </span>
                )}
              </button>

              {/* Decision Traceability */}
              <button
                onClick={() => setActiveTab('traceability')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'traceability'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'text-[#F8FAFC] hover:bg-slate-800/60'
                    : 'text-[#101B35] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GitBranch className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">Decision Traceability</span>}
                </div>
                {!collapsed && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'traceability'
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40'
                        : 'bg-cyan-100 text-cyan-700'
                    }`}
                  >
                    98% RAG
                  </span>
                )}
              </button>

              {/* Settings & Security */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'text-[#F8FAFC] hover:bg-slate-800/60'
                    : 'text-[#101B35] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">Settings & Security</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Big Mint Primary CTA Button */}
          {!collapsed && (
            <button
              onClick={onOpenUpload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/20 transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          )}

          {/* Recent Meetings Section */}
          {!collapsed && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Recent Meetings</span>
                </div>
                {recentMeetings.length > 0 && (
                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    ({recentMeetings.length})
                  </span>
                )}
              </div>

              {/* Dynamic rendering: Empty State placeholder when recentMeetings.length === 0 */}
              {recentMeetings.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 text-center flex flex-col items-center justify-center space-y-1.5">
                  <FolderOpen className="w-8 h-8 text-[var(--text-secondary)] opacity-70" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    No recent meetings available.
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                    Start or join a meeting to view session details here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentMeetings.map((m, idx) => {
                    const isSelected = selectedMeetingId === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`group relative rounded-xl border transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-[#1E293B] border-[#00F5D4] text-white shadow-md shadow-cyan-950/20'
                              : 'bg-[#FFFFFF] border-[var(--primary)] text-[#101B35] shadow-sm'
                            : isDark
                            ? 'bg-[#1E293B]/60 border-[#334155] text-slate-300 hover:border-slate-500'
                            : 'bg-[#FFFFFF] border-[#B6DFEF] text-[#101B35] hover:border-[var(--primary)]'
                        }`}
                      >
                        <button
                          onClick={() => {
                            onSelectMeeting(m.id);
                            setActiveTab('editor');
                          }}
                          className="w-full flex items-center justify-between p-2.5 text-left pr-8"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                idx === 0 ? 'bg-[#00F5D4]' : 'bg-[#2563EB]'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate leading-snug text-[var(--text-primary)]">
                                {m.title}
                              </p>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                                {m.duration} · {m.attendeesCount} people
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Hover-accessible Delete trash icon (Trash2) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMeetingToDelete({ id: m.id, title: m.title });
                          }}
                          className="absolute right-2 top-3 p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete meeting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: AI Quota & Shortcuts */}
        <div className="p-3 lg:p-4 space-y-3 border-t border-[var(--border)]">
          {/* AI Processing Quota Card */}
          {!collapsed && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                isDark
                  ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                  : 'bg-[#FFFFFF] border-[#B6DFEF] text-[#101B35] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-1.5">
                <span className="text-[11px] text-[var(--text-secondary)]">AI Processing Quota</span>
                <span className="font-mono text-xs tabular-nums text-[var(--text-primary)]">
                  {recentMeetings.length > 0 ? (recentMeetings.length * 12.5).toFixed(1) : '0.0'}{' '}
                  <span className="text-[var(--text-secondary)] font-normal">/ 100 hrs</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00F5D4] to-[#2563EB]"
                  style={{ width: `${Math.min(100, Math.max(5, recentMeetings.length * 12.5))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#00F5D4]" />
                  <span>SOC2 Compliant</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--heading)] font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Fast Diarization</span>
                </div>
              </div>
            </div>
          )}

          {/* Shortcuts + Collapse bar */}
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            {!collapsed ? (
              <button
                onClick={() =>
                  alert(
                    'Shortcuts:\nJ: Previous quote\nK: Play/Pause\nL: Next quote\nCmd+K: Global search\nE: Open MOM Editor'
                  )
                }
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-[var(--text-primary)] transition-colors text-[11px]"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts (J/K/L)</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:text-[var(--text-primary)] transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Dialog: "Delete meeting summary and transcript?" */}
      {meetingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 ${
              isDark
                ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                : 'bg-[#FFFFFF] border-[#B6DFEF] text-[#101B35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Delete Meeting?
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                  "{meetingToDelete.title}"
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Delete meeting summary and transcript? This will permanently remove the diarized quotes, MOM draft, and RAG verification index.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setMeetingToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2455] text-white hover:bg-red-600 shadow-sm transition-all active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
