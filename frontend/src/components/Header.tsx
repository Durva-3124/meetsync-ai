import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronDown,
  User,
  LogOut,
  Award,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  selectedMeetingTitle: string;
  onSignOut?: () => void;
  onViewLearnerProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenShortcuts,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectedMeetingTitle,
  onSignOut,
  onViewLearnerProfile,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workspace, setWorkspace] = useState('Enterprise Product Guild');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Action Item Due Soon',
      desc: 'GraphQL Federation Gateway RFC due Oct 9',
      time: '12m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'MOM Approved',
      desc: 'Sarah Chen approved Q4 Design Tokens v2',
      time: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Decision Disputed',
      desc: 'Audit required on SQLite conflict resolution',
      time: '3h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors duration-200 border-[#B0DEED] dark:border-slate-800 bg-[#DAEBF2] dark:bg-slate-900 text-slate-900 dark:text-slate-100 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand & Workspace */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden min-h-[44px] min-w-[44px]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#0F172A] dark:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D70F5] text-white shadow-sm font-extrabold text-lg">
              M
            </div>
            <span>MeetSync AI</span>
          </a>

          {/* Workspace Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-2 rounded-lg border border-[#B0DEED] bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Building2 className="h-3.5 w-3.5 text-[#1D70F5]" />
              <span className="max-w-[150px] truncate">{workspace}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-lg border border-[#B0DEED] bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
                {['Enterprise Product Guild', 'Infrastructure Core', 'Executive Steering'].map((org) => (
                  <button
                    key={org}
                    onClick={() => {
                      setWorkspace(org);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition ${
                      workspace === org
                        ? 'bg-[#1D70F5]/10 text-[#1D70F5] font-semibold dark:bg-[#1D70F5]/20 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{org}</span>
                    {workspace === org && <CheckCircle2 className="h-3.5 w-3.5 text-[#1D70F5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 text-sm font-semibold transition rounded-lg ${
              activeTab === 'dashboard'
                ? 'text-[#1D70F5] bg-white shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('mom-editor')}
            className={`px-3 py-2 text-sm font-semibold transition rounded-lg ${
              activeTab === 'mom-editor'
                ? 'text-[#1D70F5] bg-white shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            HITL MOM Editor
          </button>
          <button
            onClick={() => setActiveTab('traceability')}
            className={`px-3 py-2 text-sm font-semibold transition rounded-lg ${
              activeTab === 'traceability'
                ? 'text-[#1D70F5] bg-white shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Traceability Matrix
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 text-sm font-semibold transition rounded-lg ${
              activeTab === 'settings'
                ? 'text-[#1D70F5] bg-white shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Search, Controls, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 rounded-lg border border-[#B0DEED] bg-white/80 px-3 py-1.5 text-xs text-slate-500 shadow-xs transition hover:bg-white hover:border-[#1D70F5] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 dark:hover:text-white min-h-[40px]"
            title="Global Search (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search meetings, decisions...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px]"
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px]"
            title={darkMode ? 'Switch to Icy Blue Light Mode' : 'Switch to Slate Dark Mode'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-[#C2DAE6] dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1D70F5] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1D70F5]"></span>
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#B0DEED] bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[11px] text-[#1D70F5] font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg p-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-2.5"
                    >
                      <div className="mt-0.5">
                        {n.unread ? (
                          <AlertCircle className="h-3.5 w-3.5 text-[#1D70F5]" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {n.desc}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400 font-mono">
                          {n.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill with Dropdown */}
          <div className="relative pl-1 sm:pl-2 border-l border-[#B0DEED] dark:border-slate-800">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="User profile menu"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Elena Rostova"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#00F9C7]/50"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>Elena Rostova</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">VP Product</div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-800 text-left">
                  <div className="text-xs font-bold text-white">Elena Rostova</div>
                  <div className="text-[11px] text-[#00F9C7] font-mono">elena.rostova@meetsync.corp</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Enterprise Admin · SOC2 Auditor</div>
                </div>

                <div className="py-1 space-y-0.5">
                  {onViewLearnerProfile && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewLearnerProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-left"
                    >
                      <Award className="w-4 h-4 text-[#00F9C7]" />
                      <span>Learner / User Profile View</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Platform Settings</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  {onSignOut && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out (Back to Landing Page)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
