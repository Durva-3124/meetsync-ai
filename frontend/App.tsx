/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { HitlMomEditorView } from './views/HitlMomEditorView';
import { TraceabilityMatrixView } from './views/TraceabilityMatrixView';
import { SettingsView } from './views/SettingsView';
import { LandingPage } from './views/LandingPage';
import { AuthView } from './views/AuthView';
import { UploadModal } from './components/UploadModal';
import { StartMeetingModal } from './components/StartMeetingModal';
import { JoinMeetingModal } from './components/JoinMeetingModal';
import { LiveMeetingStageModal } from './components/LiveMeetingStageModal';
import { CommandPalette } from './components/CommandPalette';
import { PersonaSwitcherModal } from './components/PersonaSwitcherModal';
import { api } from './services/api';
import { ActiveTab, Meeting, MeetingSummaryItem, AnalyticsData } from './types';
import { Loader2, Mail, X } from 'lucide-react';

function MainApp() {
  const { theme } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [meetingsSummary, setMeetingsSummary] = useState<MeetingSummaryItem[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [allFullMeetings, setAllFullMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Ethereal SMTP Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Zoom-Style Live Session Gateways
  const [startMeetingOpen, setStartMeetingOpen] = useState(false);
  const [joinMeetingOpen, setJoinMeetingOpen] = useState(false);
  const [liveStageOpen, setLiveStageOpen] = useState(false);
  const [currentLiveSession, setCurrentLiveSession] = useState<{
    title: string;
    meetingId: string;
    micOn: boolean;
    cameraOn: boolean;
  }>({
    title: 'Live Executive Sync',
    meetingId: '839-204-102',
    micOn: true,
    cameraOn: true,
  });

  // Global key listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial data dynamically from Express REST API
  const loadData = async () => {
    try {
      setLoadingData(true);
      const [analyticsData, meetingsData] = await Promise.all([
        api.getAnalytics(),
        api.getMeetings(),
      ]);

      setAnalytics(analyticsData);
      setMeetingsSummary(meetingsData.meetings || []);

      if (meetingsData.meetings && meetingsData.meetings.length > 0) {
        const defaultId = meetingsData.meetings[0].id;
        setSelectedMeetingId(defaultId);
        const singleMeeting = await api.getMeetingById(defaultId);
        setActiveMeeting(singleMeeting.meeting);

        const fullList = await Promise.all(
          meetingsData.meetings.map(async (m) => {
            const res = await api.getMeetingById(m.id);
            return res.meeting;
          })
        );
        setAllFullMeetings(fullList);
      } else {
        setSelectedMeetingId('');
        setActiveMeeting(null);
        setAllFullMeetings([]);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle meeting selection
  const handleSelectMeeting = async (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    try {
      const res = await api.getMeetingById(meetingId);
      setActiveMeeting(res.meeting);
    } catch (err) {
      console.error('Failed to load selected meeting:', err);
    }
  };

  // Handle Delete Meeting: calls DELETE /api/meetings/:id and updates state and total counts dynamically
  const handleDeleteMeeting = async (meetingId: string, title: string) => {
    try {
      await api.deleteMeeting(meetingId);
      const updatedSummary = meetingsSummary.filter((m) => m.id !== meetingId);
      const updatedFull = allFullMeetings.filter((m) => m.id !== meetingId);
      setMeetingsSummary(updatedSummary);
      setAllFullMeetings(updatedFull);

      // Refresh analytics KPI counts dynamically
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics);

      if (selectedMeetingId === meetingId) {
        if (updatedSummary.length > 0) {
          const nextId = updatedSummary[0].id;
          setSelectedMeetingId(nextId);
          const nextMeeting = await api.getMeetingById(nextId);
          setActiveMeeting(nextMeeting.meeting);
        } else {
          setSelectedMeetingId('');
          setActiveMeeting(null);
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  // Handle Seed Demo Meeting (1-click convenience)
  const handleSeedMeeting = async () => {
    try {
      const res = await api.seedDemoMeeting('Q4 Product Strategy Sync');
      if (res.meeting) {
        handleMeetingCreated(res.meeting);
      }
    } catch (err) {
      console.error('Failed to seed meeting:', err);
    }
  };

  // Handle Trace from Matrix directly into editor
  const handleSelectMeetingAndTrace = async (meetingId: string, transcriptId: string) => {
    await handleSelectMeeting(meetingId);
    setActiveTab('editor');
  };

  // Handle newly created meeting from Upload or Live Stage
  const handleMeetingCreated = async (newMeeting: Meeting) => {
    setActiveMeeting(newMeeting);
    setSelectedMeetingId(newMeeting.id);
    setAllFullMeetings((prev) => [newMeeting, ...prev]);
    setMeetingsSummary((prev) => [
      {
        id: newMeeting.id,
        title: newMeeting.title,
        date: newMeeting.date,
        duration: newMeeting.duration,
        department: newMeeting.department,
        attendeesCount: newMeeting.attendeesCount,
        attendees: newMeeting.attendees,
        status: newMeeting.status,
        decisionAccuracy: newMeeting.decisionAccuracy,
        actionItemsCount: newMeeting.actionItemsCount,
        pendingItemsCount: newMeeting.pendingItemsCount,
        summaryPreview: newMeeting.executiveSummary.substring(0, 120),
        locked: false,
      },
      ...prev,
    ]);

    // Refresh analytics
    try {
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (e) {
      // ignore
    }

    setActiveTab('editor');
  };

  // Zoom-style Start Meeting flow
  const handleStartMeetingLaunch = (title: string, meetingId: string, micOn: boolean, cameraOn: boolean) => {
    setCurrentLiveSession({ title, meetingId, micOn, cameraOn });
    setStartMeetingOpen(false);
    setLiveStageOpen(true);
  };

  // Zoom-style Join Meeting flow
  const handleJoinMeetingLaunch = (meetingId?: string) => {
    const targetId = meetingId || '839-204-102';
    setCurrentLiveSession({
      title: `Joined Live Session (${targetId})`,
      meetingId: targetId,
      micOn: true,
      cameraOn: true,
    });
    setJoinMeetingOpen(false);
    setLiveStageOpen(true);
  };

  // End live meeting and generate MOM into system
  const handleEndLiveMeeting = async (generatedData?: Partial<Meeting>) => {
    setLiveStageOpen(false);
    try {
      const res = await api.createMeeting({
        title: generatedData?.title || currentLiveSession.title,
        duration: generatedData?.duration || '15m',
        attendees: generatedData?.attendees || ['Trisha Moharle', 'David Chen', 'Elena Rostova'],
      });
      handleMeetingCreated(res.meeting);
    } catch (err) {
      console.error('Failed to create live meeting MOM:', err);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--text-primary)] select-none">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00F5D4] to-[#2563EB] flex items-center justify-center font-bold text-slate-950 text-2xl font-mono mb-4 animate-pulse">
          M
        </div>
        <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin mb-2" />
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading MeetSync AI Platform...</p>
      </div>
    );
  }

  // If user navigates to landing or is explicitly on landing
  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchDemo={() => setActiveTab('dashboard')}
          onOpenAuth={() => setAuthOpen(true)}
          setActiveTab={setActiveTab}
        />
        {authOpen && (
          <AuthView
            onSuccess={() => {
              setAuthOpen(false);
              setActiveTab('dashboard');
            }}
            onCancel={() => setAuthOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[var(--background)] text-[var(--text-primary)]">
      {/* Top Navbar with Zoom-style Start/Join controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenPersonaSwitch={() => setPersonaOpen(true)}
        onOpenStartMeeting={() => setStartMeetingOpen(true)}
        onOpenJoinMeeting={(id) => {
          if (id) {
            handleJoinMeetingLaunch(id);
          } else {
            setJoinMeetingOpen(true);
          }
        }}
        onTriggerToast={triggerToast}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar with dynamic meetings, empty state, and delete dialog */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recentMeetings={meetingsSummary}
          selectedMeetingId={selectedMeetingId}
          onSelectMeeting={handleSelectMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onOpenUpload={() => setUploadOpen(true)}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              activeMeeting={activeMeeting}
              onOpenUpload={() => setUploadOpen(true)}
              onOpenEditor={() => setActiveTab('editor')}
              onOpenStartMeeting={() => setStartMeetingOpen(true)}
              onSeedMeeting={handleSeedMeeting}
              onSelectMeeting={handleSelectMeeting}
            />
          )}

          {activeTab === 'editor' && (
            activeMeeting ? (
              <HitlMomEditorView
                meeting={activeMeeting}
                onUpdateMeeting={(updated) => {
                  setActiveMeeting(updated);
                  setAllFullMeetings((prev) =>
                    prev.map((m) => (m.id === updated.id ? updated : m))
                  );
                }}
                onTriggerToast={triggerToast}
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  No meeting selected for editing.
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Start an instant session or upload a recording to refine Minutes of Meeting.
                </p>
                <button
                  onClick={() => setStartMeetingOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white"
                >
                  Start Meeting
                </button>
              </div>
            )
          )}

          {activeTab === 'traceability' && (
            <TraceabilityMatrixView
              meetings={allFullMeetings}
              onSelectMeetingAndTrace={handleSelectMeetingAndTrace}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Zoom-Style Modals */}
      <StartMeetingModal
        isOpen={startMeetingOpen}
        onClose={() => setStartMeetingOpen(false)}
        onStartMeeting={handleStartMeetingLaunch}
      />

      <JoinMeetingModal
        isOpen={joinMeetingOpen}
        onClose={() => setJoinMeetingOpen(false)}
        onJoinMeeting={handleJoinMeetingLaunch}
      />

      <LiveMeetingStageModal
        isOpen={liveStageOpen}
        meetingTitle={currentLiveSession.title}
        meetingId={currentLiveSession.meetingId}
        initialMic={currentLiveSession.micOn}
        initialCamera={currentLiveSession.cameraOn}
        onEndMeeting={handleEndLiveMeeting}
      />

      {/* Media Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        meetings={meetingsSummary}
        onSelectMeeting={handleSelectMeeting}
        setActiveTab={setActiveTab}
      />

      {/* Persona Switcher Modal */}
      <PersonaSwitcherModal
        isOpen={personaOpen}
        onClose={() => setPersonaOpen(false)}
      />

      {/* Auth Modal */}
      {authOpen && (
        <AuthView
          onSuccess={() => {
            setAuthOpen(false);
            setActiveTab('dashboard');
          }}
          onCancel={() => setAuthOpen(false)}
        />
      )}

      {/* Ethereal SMTP Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="max-w-xs">
            <div className="text-xs font-bold text-emerald-400">SMTP Notification Dispatched</div>
            <div className="text-xs text-slate-200 font-medium">{toastMessage}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
