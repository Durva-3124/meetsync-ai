import React, { useState, useEffect, useCallback } from 'react';
import { EnterpriseLandingPage } from './components/landing/EnterpriseLandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { CourseraProfilePage } from './components/coursera/CourseraProfilePage';
import { CertificateModal } from './components/coursera/CertificateModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { MediaSyncPlayer } from './components/MediaSyncPlayer';
import { TranscriptPanel } from './components/TranscriptPanel';
import { MOMEditorPanel } from './components/MOMEditorPanel';
import { ResizableSplitLayout } from './components/ResizableSplitLayout';
import { TraceabilityMatrixTab } from './components/TraceabilityMatrixTab';
import { SettingsTab } from './components/SettingsTab';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PRIMARY_MEETING, RECENT_MEETINGS, SPEAKERS } from './mockData';
import { ActiveTab, Meeting, ActionItem, TranscriptSegment, CurrentUser } from './types';
import { formatDuration } from './utils/time';
import { X, Award } from 'lucide-react';

const DEFAULT_USER: CurrentUser = {
  name: 'Elena Rostova',
  email: 'elena.rostova@meetsync.corp',
  role: 'Enterprise Admin • SOC2 Auditor',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

export default function App() {
  // Central Dual View State & Navigation Toggle (Default: false -> Public Landing Page)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showLearnerProfile, setShowLearnerProfile] = useState<boolean>(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);

  // Platform Workspace state (Dark Mode by default)
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals & Overlays
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>(RECENT_MEETINGS);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(PRIMARY_MEETING.id);

  // Playback synchronization state
  const [currentTime, setCurrentTime] = useState<number>(120); // 2 mins in by default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const selectedMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  // Dark mode class sync to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast dispatch helper
  const addToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Login handler
  const handleLoginSuccess = (userData: CurrentUser) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    setAuthModalOpen(false);
    addToast(
      `Welcome to MeetSync Workspace, ${userData.name}!`,
      `Enterprise session initialized for ${userData.email}.`,
      'success'
    );
  };

  // Sign out handler
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(DEFAULT_USER);
    setShowLearnerProfile(false);
    addToast('Signed Out', 'User session ended. Returned to public landing page.', 'info');
  };

  // Demo launch handler with direct tab routing
  const handleLaunchDemo = (targetTab?: 'dashboard' | 'mom-editor' | 'traceability' | 'settings') => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    setCurrentUser(DEFAULT_USER);
    setIsLoggedIn(true);
    addToast(
      'Demo Workspace Connected',
      `Logged in as ${DEFAULT_USER.name} (${DEFAULT_USER.role}).`,
      'success'
    );
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      if (isLoggedIn) {
        if (e.key === '1') setActiveTab('dashboard');
        else if (e.key === '2') setActiveTab('mom-editor');
        else if (e.key === '3') setActiveTab('traceability');
        else if (e.key === 'e' || e.key === 'E') setActiveTab('mom-editor');
        else if (e.key === '?') setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLoggedIn]);

  // Current active caption and speaker based on playback time
  const currentSegment = selectedMeeting.transcript.find(
    (seg) => currentTime >= seg.startSeconds && currentTime < seg.endSeconds
  );

  // Playback seek handler
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  // Flag decision from player or shortcut (S)
  const handleFlagDecision = (timestamp: number) => {
    const newDecisionCode = `DEC-${104 + selectedMeeting.decisions.length}`;
    const newDecision = {
      id: `dec-${Date.now()}`,
      code: newDecisionCode,
      statement: `Decision flagged at ${formatDuration(timestamp)} pending executive wording`,
      confidenceScore: 92.5,
      ragDistance: 0.15,
      citationSegmentId: currentSegment?.id || 'seg-custom',
      citationTimestamp: Math.floor(timestamp),
      citationQuote: currentSegment?.text || `Recorded audio bookmark at ${formatDuration(timestamp)}`,
      status: 'verified' as const,
      category: 'Architecture' as const,
      consensus: { 'Elena Rostova': 'Approved' as const, 'Marcus Vance': 'Proposed' as const },
      impactedSystems: ['Platform Core'],
    };

    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, decisions: [newDecision, ...m.decisions] }
        : m
    );
    setMeetings(updated);
    addToast(
      `Flagged Decision Point: ${newDecisionCode}`,
      `Timestamp locked at ${formatDuration(timestamp)}. Added to Traceability Matrix.`,
      'info'
    );
  };

  // Transcript Turn update (True HITL)
  const handleUpdateTranscriptSegment = (
    segmentId: string,
    updatedText: string,
    updatedSpeakerId?: string
  ) => {
    const updated = meetings.map((m) => {
      if (m.id !== selectedMeeting.id) return m;
      const updatedTranscript = m.transcript.map((seg) => {
        if (seg.id !== segmentId) return seg;
        return {
          ...seg,
          text: updatedText,
          speakerId: updatedSpeakerId || seg.speakerId,
          speakerName: updatedSpeakerId
            ? SPEAKERS[updatedSpeakerId]?.name || seg.speakerName
            : seg.speakerName,
        };
      });
      return { ...m, transcript: updatedTranscript };
    });
    setMeetings(updated);
    addToast('Transcript Turn Saved', 'Speaker text updated with zero latency.');
  };

  // Tag decision from transcript row
  const handleTagDecisionFromTranscript = (segment: TranscriptSegment) => {
    handleFlagDecision(segment.startSeconds);
  };

  // Extract action item from speech turn
  const handleAddActionItemFromSpeech = (segment: TranscriptSegment) => {
    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      title: `Action from ${segment.speakerName}: "${segment.text.slice(0, 70)}..."`,
      assignee: segment.speakerName,
      dueDate: '2026-10-18',
      priority: 'high',
      completed: false,
      originTimestamp: segment.startSeconds,
    };

    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, actionItems: [newItem, ...m.actionItems] }
        : m
    );
    setMeetings(updated);
    addToast('Action Item Extracted', `Assigned to ${segment.speakerName} at ${formatDuration(segment.startSeconds)}`);
  };

  // Copy speech quote
  const handleCopyQuote = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    addToast('Quote Copied', 'Citation copied to system clipboard.');
  };

  // Key takeaways update
  const handleUpdateKeyTakeaways = (takeaways: string[]) => {
    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id ? { ...m, keyTakeaways: takeaways } : m
    );
    setMeetings(updated);
  };

  // Action item completion toggle
  const handleToggleActionItem = (id: string) => {
    const updated = meetings.map((m) => {
      if (m.id !== selectedMeeting.id) return m;
      const updatedActions = m.actionItems.map((act) =>
        act.id === id ? { ...act, completed: !act.completed } : act
      );
      return { ...m, actionItems: updatedActions };
    });
    setMeetings(updated);
  };

  // Add Action Item
  const handleAddActionItem = (itemData: Omit<ActionItem, 'id'>) => {
    const newItem: ActionItem = {
      ...itemData,
      id: `act-${Date.now()}`,
    };
    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, actionItems: [newItem, ...m.actionItems] }
        : m
    );
    setMeetings(updated);
    addToast('Action Item Added', `Assigned to ${newItem.assignee} for ${newItem.dueDate}`);
  };

  // Delete Action Item
  const handleDeleteActionItem = (id: string) => {
    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, actionItems: m.actionItems.filter((a) => a.id !== id) }
        : m
    );
    setMeetings(updated);
    addToast('Action Item Removed', undefined, 'info');
  };

  // Publish MOM
  const handlePublishMOM = () => {
    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, status: 'Approved' as const }
        : m
    );
    setMeetings(updated);
    addToast('MOM Approved & Published', 'Audit trail locked and broadcast to team channels.');
  };

  // Export MOM
  const handleExport = (format: 'pdf' | 'markdown' | 'jira') => {
    if (format === 'pdf') {
      addToast('Generating PDF Document', 'Executive brief formatted with verified decision matrix.');
    } else if (format === 'jira') {
      addToast('Jira Sync Successful', `${selectedMeeting.actionItems.length} action items synced to sprint backlog.`);
    } else {
      addToast('Markdown Exported', 'Clean Markdown minutes copied to clipboard.');
    }
  };

  // Update Decision verification status
  const handleUpdateDecisionStatus = (
    decisionId: string,
    status: 'verified' | 'disputed' | 'superseded'
  ) => {
    const updated = meetings.map((m) => {
      if (m.id !== selectedMeeting.id) return m;
      const updatedDecisions = m.decisions.map((dec) =>
        dec.id === decisionId ? { ...dec, status } : dec
      );
      return { ...m, decisions: updatedDecisions };
    });
    setMeetings(updated);
    addToast(
      `Status Updated: ${status.toUpperCase()}`,
      `Audit record updated for decision #${decisionId.slice(-4)}`
    );
  };

  // =========================================================================
  // VIEW 1: DEFAULT ENTERPRISE LANDING PAGE (When Not Logged In: isLoggedIn === false)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-[#00F9C7]/20 selection:text-[#00F9C7]">
        <EnterpriseLandingPage
          onOpenLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onOpenSignup={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
          onLaunchDemo={handleLaunchDemo}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccessLogin={handleLoginSuccess}
        />

        {/* Non-intrusive Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED-IN ENTERPRISE MEETING INTELLIGENCE PLATFORM
  // =========================================================================
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#DAEBF2] text-slate-900'
    }`}>
      
      {/* In-App Enterprise Top Bar Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        selectedMeetingTitle={selectedMeeting.title}
        onSignOut={handleSignOut}
        onViewLearnerProfile={() => setShowLearnerProfile(true)}
        currentUser={currentUser}
      />

      <div className="flex">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          meetings={meetings}
          selectedMeetingId={selectedMeetingId}
          onSelectMeeting={(id) => {
            setSelectedMeetingId(id);
            setCurrentTime(0);
          }}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Workspace Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <div className="mx-auto max-w-7xl">
            {/* Tab A: Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <DashboardTab
                meetings={meetings}
                selectedMeeting={selectedMeeting}
                onSelectMeeting={(id) => {
                  setSelectedMeetingId(id);
                  setCurrentTime(0);
                }}
                onOpenEditor={() => setActiveTab('mom-editor')}
                onOpenTraceability={() => setActiveTab('traceability')}
              />
            )}

            {/* Tab B: HITL MOM Editor */}
            {activeTab === 'mom-editor' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#B0DEED] dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#00F9C7] shadow-[0_0_8px_#00F9C7]" />
                      <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
                        {selectedMeeting.title}
                      </h1>
                      <span className="rounded-md bg-white/70 dark:bg-slate-800 border border-[#B0DEED] dark:border-slate-700 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {selectedMeeting.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm font-medium opacity-90 text-[#00634E] dark:text-[#70E4D3]">
                      <span>{selectedMeeting.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedMeeting.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>Host: {selectedMeeting.organizer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      <span className="font-mono text-[#1D70F5] font-bold">
                        {selectedMeeting.decisions.length}
                      </span>{' '}
                      Decisions Locked ·{' '}
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {selectedMeeting.actionItems.filter((a) => a.completed).length}
                      </span>
                      /{selectedMeeting.actionItems.length} Actions Done
                    </span>
                  </div>
                </div>

                <ResizableSplitLayout
                  leftComponent={
                    <MediaSyncPlayer
                      meeting={selectedMeeting}
                      currentTime={currentTime}
                      setCurrentTime={setCurrentTime}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      onFlagDecision={handleFlagDecision}
                      currentCaption={currentSegment?.text}
                      currentSpeakerName={currentSegment?.speakerName}
                    />
                  }
                  middleComponent={
                    <TranscriptPanel
                      transcript={selectedMeeting.transcript}
                      speakers={SPEAKERS}
                      currentTime={currentTime}
                      onSeek={handleSeek}
                      onUpdateSegment={handleUpdateTranscriptSegment}
                      onTagDecision={handleTagDecisionFromTranscript}
                      onAddActionItemFromSpeech={handleAddActionItemFromSpeech}
                      onCopyQuote={handleCopyQuote}
                    />
                  }
                  rightComponent={
                    <MOMEditorPanel
                      meeting={selectedMeeting}
                      speakers={SPEAKERS}
                      onSeek={handleSeek}
                      onUpdateKeyTakeaways={handleUpdateKeyTakeaways}
                      onToggleActionItem={handleToggleActionItem}
                      onAddActionItem={handleAddActionItem}
                      onDeleteActionItem={handleDeleteActionItem}
                      onPublishMOM={handlePublishMOM}
                      onExport={handleExport}
                    />
                  }
                />
              </div>
            )}

            {/* Tab C: Decision Traceability Matrix */}
            {activeTab === 'traceability' && (
              <TraceabilityMatrixTab
                meeting={selectedMeeting}
                onSeek={handleSeek}
                onOpenEditor={() => setActiveTab('mom-editor')}
                onUpdateDecisionStatus={handleUpdateDecisionStatus}
                onExportAuditReport={() => {
                  addToast(
                    'Audit Matrix Exported',
                    'CSV audit trail with RAG distances generated for compliance archive.'
                  );
                }}
              />
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <SettingsTab
                onSave={() => addToast('Configuration Saved', 'RAG confidence and connector settings updated.')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Optional Learner Profile Overlay Modal */}
      {showLearnerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto relative text-slate-900 border border-slate-700">
            <button
              onClick={() => setShowLearnerProfile(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="Close learner profile"
            >
              <X className="w-5 h-5" />
            </button>

            <CourseraProfilePage
              onContinueCourse={() => {
                setShowLearnerProfile(false);
                setActiveTab('mom-editor');
              }}
              onViewCertificateModal={() => setCertificateModalOpen(true)}
              onLaunchWorkspace={() => setShowLearnerProfile(false)}
              onShareProfile={() => {
                addToast('Profile Link Copied', 'Profile credential link copied to clipboard.');
              }}
            />
          </div>
        </div>
      )}

      {/* Verified Certificate Modal */}
      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        onShare={() => addToast('Shared to LinkedIn', 'Verification token broadcasted.')}
      />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        meetings={meetings}
        onSelectMeeting={(id) => {
          setSelectedMeetingId(id);
          setCurrentTime(0);
        }}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
      />

      {/* Global Shortcuts Cheatsheet Modal (?) */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Non-intrusive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
