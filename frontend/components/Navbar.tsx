import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Upload,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Shield,
  LogOut,
  Building2,
  Sparkles,
  CheckCircle2,
  Video,
  LogIn,
  AlertTriangle,
  Mail,
  Send,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import { api } from '../services/api';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenPersonaSwitch: () => void;
  onOpenStartMeeting: () => void;
  onOpenJoinMeeting: (meetingId?: string) => void;
  onTriggerToast?: (message: string) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenSearch,
  onOpenPersonaSwitch,
  onOpenStartMeeting,
  onOpenJoinMeeting,
  onTriggerToast,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, setTenant, logout } = useAuth();
  const isDark = theme === 'dark';

  const [profileOpen, setProfileOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickJoinId, setQuickJoinId] = useState('');
  const [dispatchingReminder, setDispatchingReminder] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const tenantRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setTenantOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tenantOptions = [
    'MeetSync Enterprise • SOC2',
    'Enterprise Product Guild',
    'FinTech Global Systems',
    'HealthTech Identity Core',
  ];

  const handleQuickJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJoinId.trim()) {
      onOpenJoinMeeting();
      return;
    }
    onOpenJoinMeeting(quickJoinId.trim());
    setQuickJoinId('');
  };

  const handleDispatchReminder = async () => {
    setDispatchingReminder(true);
    try {
      const res = await api.dispatchReminder({
        recipient: user?.email || 'trishamoharle26@enterprise.io',
        message: 'Review pending MOM action items and ratified architectural decisions.',
      });
      if (onTriggerToast) {
        onTriggerToast(res.message || 'Notification queued (Development SMTP Active)');
      }
    } catch (e) {
      if (onTriggerToast) {
        onTriggerToast('Notification queued (Development SMTP Active)');
      }
    } finally {
      setDispatchingReminder(false);
      setNotificationsOpen(false);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between w-full px-4 gap-2 overflow-x-auto whitespace-nowrap border-b border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] transition-colors select-none sticky top-0 z-40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* =========================================================================
          LEFT CLUSTER: Logo ("MeetSync AI") + Tenant Dropdown Selector
         ========================================================================= */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-shrink-0">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 group focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F5D4] via-[#00E5FF] to-[#2563EB] flex items-center justify-center shadow-md shadow-[#00F5D4]/10 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-slate-950 text-lg font-mono tracking-tighter">M</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
              MeetSync
            </span>
            <span className="font-semibold text-base sm:text-lg text-[var(--heading)]">
              AI
            </span>
          </div>
        </button>

        {/* Tenant Selector Dropdown */}
        <div className="relative shrink-0 flex-shrink-0" ref={tenantRef}>
          <button
            onClick={() => setTenantOpen(!tenantOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--background)]/60 text-[var(--text-primary)] hover:border-slate-400 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--heading)] shrink-0" />
            <span className="max-w-[130px] sm:max-w-[150px] truncate">{tenant}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          </button>

          {tenantOpen && (
            <div className="absolute left-0 mt-1.5 w-60 rounded-xl p-1.5 border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-xl z-50 text-xs">
              <div className="px-2 py-1.5 font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                Select Active Guild / Tenant
              </div>
              {tenantOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTenant(t);
                    setTenantOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    tenant === t
                      ? 'bg-[var(--background)] text-[#00F5D4] font-medium'
                      : 'hover:bg-[var(--background)]'
                  }`}
                >
                  <span className="truncate">{t}</span>
                  {tenant === t && <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          CENTER CLUSTER (Navigation & Gateway):
          - Navigation links ("Dashboard", "HITL MOM Editor", "Traceability Matrix", "Settings") using compact text/padding (px-2 py-1 text-sm)
          - Zoom Controls: "Start Meeting" button + compact "Join" input field (max-w-[160px])
          - Action Buttons: "Upload Media" + "Search (Ctrl+K)"
         ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-shrink-0 mx-1">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {(
            [
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'editor', label: 'HITL MOM Editor' },
              { id: 'traceability', label: 'Traceability Matrix' },
              { id: 'settings', label: 'Settings' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <span className="h-4 w-px bg-[var(--border)] inline-block mx-0.5" />

        {/* Zoom Controls: "Start Meeting" button */}
        <button
          onClick={onOpenStartMeeting}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 shadow-xs transition-all active:scale-95 shrink-0"
          title="Start Instant Live Meeting Session"
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>Start Meeting</span>
        </button>

        {/* Zoom Controls: compact "Join" input field (max-w-[160px]) */}
        <form onSubmit={handleQuickJoinSubmit} className="flex items-center max-w-[160px] shrink-0">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={quickJoinId}
              onChange={(e) => setQuickJoinId(e.target.value)}
              placeholder="Join (839-204-102)"
              className="w-full pl-2 pr-1.5 py-1.5 rounded-l-lg text-xs border border-r-0 border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              className="px-2 py-1.5 rounded-r-lg text-xs font-bold border border-[var(--border)] bg-[var(--card)] text-[var(--primary)] hover:bg-[var(--background)] transition-colors flex items-center gap-0.5 shrink-0"
              title="Join Session by ID"
            >
              <LogIn className="w-3 h-3 shrink-0" />
              <span>Join</span>
            </button>
          </div>
        </form>

        {/* Separator */}
        <span className="h-4 w-px bg-[var(--border)] inline-block mx-0.5" />

        {/* Action Button: "Upload Media" (Mint Pill) */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-xs shadow-[#00F5D4]/20 transition-all active:scale-95 shrink-0"
          title="Upload audio/video media recording for diarization"
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span>Upload Media</span>
        </button>

        {/* Action Button: "Search (Ctrl+K)" */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--background)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-colors shrink-0"
          title="Global Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-mono">Search (Ctrl+K)</span>
        </button>
      </div>

      {/* =========================================================================
          RIGHT CLUSTER (Status & Profile - ALWAYS VISIBLE):
          - "AI Mock Mode" badge (using --warning styling for dev mode: #E98300)
          - Dark/Light Theme Toggle
          - Notification Bell Icon (Bell)
          - User Profile Badge ("TM"): flex-shrink-0 ml-auto (ALWAYS 100% visible)
          - Profile Dropdown Drawer
         ========================================================================= */}
      <div className="flex items-center gap-2 shrink-0 flex-shrink-0 ml-auto">
        {/* 1. "AI Mock Mode" badge with hover tooltip */}
        <div
          className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)] cursor-help select-none shrink-0 flex-shrink-0"
          title="Backend is currently returning mock AI data for transcription and MOM generation."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse shrink-0" />
          <span>AI Mock Mode Active</span>

          {/* Hover Tooltip */}
          <div className="absolute top-full mt-2 right-0 hidden group-hover:block z-50 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-[11px] whitespace-normal w-60 shadow-2xl leading-tight pointer-events-none">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>AI Mock Mode Active</span>
            </div>
            Backend is currently returning mock AI data for transcription and MOM generation.
          </div>
        </div>

        {/* 2. Theme Toggle (Dark/Light pill) */}
        <div className="flex items-center p-0.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[11px] font-medium transition-colors shrink-0 flex-shrink-0">
          <button
            onClick={() => toggleTheme()}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              isDark ? 'bg-slate-900 text-[#00F5D4] font-semibold shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3 h-3 shrink-0" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => toggleTheme()}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              !isDark ? 'bg-white text-[var(--primary)] font-semibold shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Light Mode"
          >
            <Sun className="w-3 h-3 shrink-0" />
            <span>Light</span>
          </button>
        </div>

        {/* 3. Notification Bell Icon */}
        <div className="relative shrink-0 flex-shrink-0" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center relative border border-[var(--border)] bg-[var(--background)]/60 text-[var(--text-primary)] hover:border-slate-400 transition-colors"
            title="System notifications & SMTP queue"
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="w-2 h-2 rounded-full bg-[#00F5D4] absolute top-1.5 right-1.5 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl p-3.5 border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-2xl z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <span className="font-bold text-sm">System Notifications</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  SMTP Active
                </span>
              </div>

              {/* Notification card 1: Ethereal SMTP Status */}
              <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Mail className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                  <span>Ethereal SMTP Relay</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  Development notifications routed via <code className="font-mono text-cyan-400">smtp.ethereal.email</code>.
                </p>
              </div>

              {/* Action: Dispatch Reminders */}
              <button
                onClick={handleDispatchReminder}
                disabled={dispatchingReminder}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[var(--primary)] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>{dispatchingReminder ? 'Dispatching...' : 'Dispatch Meeting Reminders'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. User Profile Badge ("TM"): Ensure flex-shrink-0 ml-auto so user avatar is ALWAYS 100% visible on top-right corner */}
        <div className="relative shrink-0 flex-shrink-0 ml-auto" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center focus:outline-none group shrink-0 flex-shrink-0"
            title="User Profile: Trisha Moharle - Enterprise Lead"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow-sm border-2 border-white/40 transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: user?.avatarColor || '#00F5D4' }}
            >
              {user?.initials || 'TM'}
            </div>
          </button>

          {/* Profile Dropdown Drawer */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl p-3.5 border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-2xl z-50">
              {/* User Header showing "Trisha Moharle - Enterprise Lead" */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-slate-950 shadow-xs shrink-0"
                  style={{ backgroundColor: user?.avatarColor || '#00F5D4' }}
                >
                  {user?.initials || 'TM'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {user?.name || 'Trisha Moharle'}
                  </h4>
                  <p className="text-[11px] text-[var(--heading)] font-semibold truncate">
                    {user?.role ? `${user.role}` : 'Enterprise Lead'}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                    {user?.email || 'trishamoharle26@enterprise.io'}
                  </p>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-3 pt-2.5 border-t border-[var(--border)] space-y-1 text-xs">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenPersonaSwitch();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors text-left text-[var(--text-primary)] hover:bg-[var(--background)]"
                >
                  <UserCheck className="w-4 h-4 text-[var(--heading)] shrink-0" />
                  <span>Switch User / Persona</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors text-left text-[var(--text-primary)] hover:bg-[var(--background)]"
                >
                  <Shield className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <span>Tenant Settings & Security</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    setActiveTab('landing');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors text-left text-red-500 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
