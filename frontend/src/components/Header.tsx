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
import { ActiveTab, CurrentUser } from '../types';

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
  currentUser?: CurrentUser;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type?: 'action' | 'approval' | 'dispute' | 'security';
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
  currentUser,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workspace, setWorkspace] = useState('Enterprise Product Guild');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const activeUser: CurrentUser = currentUser || {
    name: 'Elena Rostova',
    email: 'elena.rostova@meetsync.corp',
    role: 'Enterprise Admin • SOC2 Auditor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  };

  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(activeUser.name);

  // Enhanced Notification Center State
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Action Item Due Soon',
      desc: 'GraphQL Federation Gateway RFC due Oct 9',
      time: '12m ago',
      unread: true,
      type: 'action',
    },
    {
      id: '2',
      title: 'MOM Approved',
      desc: 'Sarah Chen approved Q4 Design Tokens v2',
      time: '1h ago',
      unread: true,
      type: 'approval',
    },
    {
      id: '3',
      title: 'Decision Disputed',
      desc: 'Audit required on SQLite conflict resolution',
      time: '3h ago',
      unread: false,
      type: 'dispute',
    },
    {
      id: '4',
      title: 'SOC2 Audit Log Synced',
      desc: 'Automated cryptographic proof recorded for DEC-104',
      time: '5h ago',
      unread: false,
      type: 'security',
    },
  ]);

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = notificationsList.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const displayedNotifications = notificationsList.filter((n) => {
    if (notificationFilter === 'unread') return n.unread;
    if (notificationFilter === 'read') return !n.unread;
    return true;
  });

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
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1D70F5] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1D70F5]"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
                {/* Header with Title and Mark All Read */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notification Center
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#1D70F5]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1D70F5] dark:bg-[#1D70F5]/20 dark:text-blue-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className={`text-[11px] font-semibold transition ${
                      unreadCount > 0
                        ? 'text-[#1D70F5] hover:underline cursor-pointer dark:text-[#70E4D3]'
                        : 'text-slate-400 cursor-default'
                    }`}
                  >
                    {unreadCount > 0 ? 'Mark all read' : 'All caught up'}
                  </button>
                </div>

                {/* Filter Tabs: All, Unread, Read */}
                <div className="flex items-center gap-1 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setNotificationFilter('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      notificationFilter === 'all'
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    All ({notificationsList.length})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('unread')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      notificationFilter === 'unread'
                        ? 'bg-[#1D70F5]/15 text-[#1D70F5] dark:bg-[#1D70F5]/30 dark:text-[#00F9C7]'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>Unread</span>
                    <span className="rounded-full bg-[#1D70F5] text-white px-1.5 py-0.2 text-[9px] font-mono">
                      {unreadCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setNotificationFilter('read')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      notificationFilter === 'read'
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Read ({notificationsList.length - unreadCount})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto">
                  {displayedNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications in this view.
                    </div>
                  ) : (
                    displayedNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleToggleRead(n.id)}
                        className={`rounded-xl p-2.5 transition flex items-start gap-2.5 cursor-pointer ${
                          n.unread
                            ? 'bg-blue-50/60 dark:bg-slate-800/90 border-l-3 border-[#1D70F5] dark:border-[#00F9C7] shadow-2xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80 border-l-3 border-transparent'
                        }`}
                        title="Click to toggle read status"
                      >
                        <div className="mt-1 shrink-0">
                          {n.unread ? (
                            <span className="flex h-2 w-2 rounded-full bg-[#1D70F5] dark:bg-[#00F9C7]" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div
                            className={`text-xs ${
                              n.unread
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'font-medium text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.desc}
                          </div>
                          <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {n.time} · {n.unread ? 'Mark as read' : 'Read'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
              <div className="relative shrink-0">
                {activeUser.avatarUrl ? (
                  <img
                    src={activeUser.avatarUrl}
                    alt={activeUser.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#00F9C7]/50"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#1D70F5] to-[#00F9C7] text-slate-950 font-black text-xs flex items-center justify-center ring-2 ring-[#00F9C7]/50">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="truncate max-w-[120px]">{activeUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                  {activeUser.role.split('•')[0].trim()}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="px-3 py-3 border-b border-slate-800 text-left flex items-center gap-3">
                  <div className="relative shrink-0">
                    {activeUser.avatarUrl ? (
                      <img
                        src={activeUser.avatarUrl}
                        alt={activeUser.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#00F9C7]/50"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1D70F5] to-[#00F9C7] text-slate-950 font-black text-sm flex items-center justify-center ring-2 ring-[#00F9C7]/50">
                        {initials}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>
                  <div className="overflow-hidden leading-tight">
                    <div className="text-sm font-bold text-white truncate">{activeUser.name}</div>
                    <div className="text-[11px] text-[#00F9C7] font-mono truncate mt-0.5">{activeUser.email}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{activeUser.role}</div>
                  </div>
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
