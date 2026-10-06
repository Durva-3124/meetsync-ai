import React from 'react';
import {
  LayoutDashboard,
  FileEdit,
  GitBranch,
  Settings,
  HardDrive,
  Keyboard,
  Clock,
  Sparkles,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { ActiveTab, Meeting } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onOpenShortcuts: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onOpenShortcuts,
  isCollapsed,
  setIsCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: '4 New',
    },
    {
      id: 'mom-editor' as ActiveTab,
      label: 'HITL MOM Editor',
      icon: FileEdit,
      badge: 'Active',
    },
    {
      id: 'traceability' as ActiveTab,
      label: 'Decision Traceability',
      icon: GitBranch,
      badge: '98% RAG',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Security',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out border-[#B0DEED] dark:border-slate-800 bg-[#DAEBF2] dark:bg-slate-900 backdrop-blur-md ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className={`px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ${isCollapsed ? 'hidden' : 'block'}`}>
              Platform View
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition min-h-[44px] ${
                      isActive
                        ? 'bg-[#1D70F5] text-white font-semibold shadow-md'
                        : 'text-slate-700 hover:bg-[#C2DAE6] hover:text-slate-950 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white'}`} />
                    {!isCollapsed && (
                      <div className="flex flex-1 items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#1D70F5]/10 text-[#1D70F5] dark:bg-[#1D70F5]/25 dark:text-blue-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Recent Meetings Quick Jump */}
          {!isCollapsed && (
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Recent Meetings
                </span>
                <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="space-y-1">
                {meetings.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 italic text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                    No meetings indexed
                  </div>
                ) : (
                  meetings.map((m) => {
                  const isSelected = m.id === selectedMeetingId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMeeting(m.id);
                        if (activeTab === 'dashboard') {
                          setActiveTab('mom-editor');
                        }
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                        isSelected
                          ? 'border border-[#B0DEED] bg-white text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-700 hover:bg-[#C2DAE6]/70 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="mt-1 h-2 w-2 rounded-full shrink-0 bg-[#1D70F5]" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold leading-tight">{m.title}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="font-mono">{Math.round(m.durationSeconds / 60)}m</span>
                          <span>·</span>
                          <span>{m.attendees.length} people</span>
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="h-3.5 w-3.5 text-[#1D70F5] mt-1 shrink-0" />}
                    </button>
                  );
                }))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom quota & shortcuts */}
        <div className="border-t border-[#B0DEED] p-3 space-y-3 dark:border-slate-800 bg-white/40 dark:bg-slate-900">
          {!isCollapsed && (
            <div className="rounded-xl border border-[#B0DEED] bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-[#1D70F5]" /> AI Processing Quota
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">48.2 / 100 hrs</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-full bg-gradient-to-r from-[#1D70F5] to-emerald-500 w-[48%]" />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>SOC2 Compliant</span>
                <span className="flex items-center gap-1 text-[#067330] dark:text-emerald-400 font-semibold">
                  <Sparkles className="h-2.5 w-2.5" /> Fast Diarization
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onOpenShortcuts}
              className={`flex items-center justify-center gap-2 rounded-lg border border-[#B0DEED] bg-white px-2 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition min-h-[44px] ${
                isCollapsed ? 'w-full' : 'flex-1'
              }`}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              {!isCollapsed && <span>Shortcuts (J/K/L)</span>}
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-lg border border-[#B0DEED] bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition min-h-[44px] min-w-[44px]"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${
                  isCollapsed ? '' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
