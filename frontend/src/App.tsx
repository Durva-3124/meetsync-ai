import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { LoadingState } from './components/common/LoadingState';
import { EmptyState } from './components/common/EmptyState';
import {
  useMeetingsQuery,
  useMeetingDetailQuery,
  useUpdateMeetingMutation,
  useUpdateTranscriptMutation,
  useAddActionItemMutation,
  useToggleActionItemMutation,
  useDeleteActionItemMutation,
  useAddDecisionMutation,
  useUpdateDecisionStatusMutation,
} from './services/useMeetings';
import {
  ActiveTab,
  Meeting,
  ActionItem,
  TranscriptSegment,
  CurrentUser,
  MeetingDecision,
  Speaker,
} from './types';
import { formatDuration } from './utils/time';
import {
  exportDecisionsToCSV,
  exportMOMToMarkdown,
  exportMOMToJiraJSON,
  exportMOMToPDF,
} from './utils/export';
import { X } from 'lucide-react';

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

  // Real backend queries via TanStack Query
  const {
    data: meetings = [],
    isLoading: isMeetingsLoading,
    refetch: refetchMeetings,
  } = useMeetingsQuery();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Default to first available meeting ID if none explicitly selected
  const activeMeetingId = selectedMeetingId || meetings[0]?.id || null;

  const {
    data: meetingDetail,
    isLoading: isDetailLoading,
  } = useMeetingDetailQuery(activeMeetingId);

  // Selected meeting object
  const selectedMeeting: Meeting | null =
    meetingDetail || meetings.find((m) => m.id === activeMeetingId) || meetings[0] || null;

  // Real backend mutations
  const updateMeetingMutation = useUpdateMeetingMutation();
  const updateTranscriptMutation = useUpdateTranscriptMutation();
  const addActionItemMutation = useAddActionItemMutation();
  const toggleActionItemMutation = useToggleActionItemMutation();
  const deleteActionItemMutation = useDeleteActionItemMutation();
  const addDecisionMutation = useAddDecisionMutation();
  const updateDecisionStatusMutation = useUpdateDecisionStatusMutation();

  // Playback synchronization state
  const [currentTime, setCurrentTime] = useState<number>(120); // 2 mins in by default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Dark mode class sync to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-scroll to top on view or navigation tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [activeTab, isLoggedIn]);

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
  const currentSegment = selectedMeeting?.transcript?.find(
    (seg) => currentTime >= seg.startSeconds && currentTime < seg.endSeconds
  );

  // Dynamically map speakers from meeting attendees
  const speakersMap = useMemo<Record<string, Speaker>>(() => {
    const map: Record<string, Speaker> = {};
    if (selectedMeeting?.attendees) {
      for (const spk of selectedMeeting.attendees) {
        map[spk.id] = spk;
        if (spk.name) {
          map[spk.name.toLowerCase().replace(/\s+/g, '_')] = spk;
          const first = spk.name.split(' ')[0].toLowerCase();
          map[first] = spk;
        }
      }
    }
    return map;
  }, [selectedMeeting?.attendees]);

  // Playback seek handler
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  // Flag decision from player or shortcut (S) -> Real API mutation
  const handleFlagDecision = async (timestamp: number) => {
    if (!selectedMeeting) return;
    const newDecisionCode = `DEC-${104 + (selectedMeeting.decisions?.length || 0)}`;
    const newDecision: MeetingDecision = {
      id: `dec-${Date.now()}`,
      code: newDecisionCode,
      statement: `Decision flagged at ${formatDuration(timestamp)} pending executive wording`,
      confidenceScore: 92.5,
      ragDistance: 0.15,
      citationSegmentId: currentSegment?.id || 'seg-custom',
      citationTimestamp: Math.floor(timestamp),
      citationQuote: currentSegment?.text || `Recorded audio bookmark at ${formatDuration(timestamp)}`,
      status: 'verified',
      category: 'Architecture',
      consensus: { 'Elena Rostova': 'Approved', 'Marcus Vance': 'Proposed' },
      impactedSystems: ['Platform Core'],
    };

    try {
      await addDecisionMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        decision: newDecision,
      });
      addToast(
        `Flagged Decision Point: ${newDecisionCode}`,
        `Timestamp locked at ${formatDuration(timestamp)}. Added to Traceability Matrix.`,
        'info'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Save Decision', errorMsg, 'warning');
    }
  };

  // Transcript Turn update (True HITL) -> Real API mutation
  const handleUpdateTranscriptSegment = async (
    segmentId: string,
    updatedText: string,
    updatedSpeakerId?: string
  ) => {
    if (!selectedMeeting) return;
    try {
      await updateTranscriptMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        segmentId,
        payload: {
          text: updatedText,
          speakerId: updatedSpeakerId,
        },
      });
      addToast('Transcript Turn Saved', 'Speaker text updated on server.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Update Transcript', errorMsg, 'warning');
    }
  };

  // Tag decision from transcript row
  const handleTagDecisionFromTranscript = (segment: TranscriptSegment) => {
    handleFlagDecision(segment.startSeconds);
  };

  // Extract action item from speech turn -> Real API mutation
  const handleAddActionItemFromSpeech = async (segment: TranscriptSegment) => {
    if (!selectedMeeting) return;
    const newItem: Omit<ActionItem, 'id'> = {
      title: `Action from ${segment.speakerName}: "${segment.text.slice(0, 70)}..."`,
      assignee: segment.speakerName,
      dueDate: '2026-10-18',
      priority: 'high',
      completed: false,
      originTimestamp: segment.startSeconds,
    };

    try {
      await addActionItemMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        item: newItem,
      });
      addToast('Action Item Extracted', `Assigned to ${segment.speakerName} at ${formatDuration(segment.startSeconds)}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Extract Action Item', errorMsg, 'warning');
    }
  };

  // Copy speech quote
  const handleCopyQuote = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    addToast('Quote Copied', 'Citation copied to system clipboard.');
  };

  // Key takeaways update -> Real API mutation
  const handleUpdateKeyTakeaways = async (takeaways: string[]) => {
    if (!selectedMeeting) return;
    try {
      await updateMeetingMutation.mutateAsync({
        id: selectedMeeting.id,
        updates: { keyTakeaways: takeaways },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Save Takeaways', errorMsg, 'warning');
    }
  };

  // Action item completion toggle -> Real API mutation
  const handleToggleActionItem = async (id: string) => {
    if (!selectedMeeting) return;
    try {
      await toggleActionItemMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        itemId: id,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Update Action Item', errorMsg, 'warning');
    }
  };

  // Add Action Item -> Real API mutation
  const handleAddActionItem = async (itemData: Omit<ActionItem, 'id'>) => {
    if (!selectedMeeting) return;
    try {
      await addActionItemMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        item: itemData,
      });
      addToast('Action Item Added', `Assigned to ${itemData.assignee} for ${itemData.dueDate}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Add Action Item', errorMsg, 'warning');
    }
  };

  // Delete Action Item -> Real API mutation
  const handleDeleteActionItem = async (id: string) => {
    if (!selectedMeeting) return;
    try {
      await deleteActionItemMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        itemId: id,
      });
      addToast('Action Item Removed', undefined, 'info');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Delete Action Item', errorMsg, 'warning');
    }
  };

  // Publish MOM -> Real API mutation
  const handlePublishMOM = async () => {
    if (!selectedMeeting) return;
    try {
      await updateMeetingMutation.mutateAsync({
        id: selectedMeeting.id,
        updates: { status: 'Approved' },
      });
      addToast('MOM Approved & Published', 'Audit trail locked and broadcast to team channels.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Publish MOM', errorMsg, 'warning');
    }
  };

  // Export MOM with real file downloads
  const handleExport = (format: 'pdf' | 'markdown' | 'jira') => {
    if (!selectedMeeting) return;
    if (format === 'pdf') {
      exportMOMToPDF(selectedMeeting);
      addToast('Executive Brief Generated', 'Print & PDF preview window triggered.');
    } else if (format === 'jira') {
      const filename = exportMOMToJiraJSON(selectedMeeting);
      addToast('Jira Backlog Payload Exported', `Downloaded ${filename} for sprint synchronization.`);
    } else {
      const filename = exportMOMToMarkdown(selectedMeeting);
      addToast('Markdown Minutes Exported', `Downloaded ${filename} to local system.`);
    }
  };

  // Update Decision verification status -> Real API mutation
  const handleUpdateDecisionStatus = async (
    decisionId: string,
    status: 'verified' | 'disputed' | 'superseded'
  ) => {
    if (!selectedMeeting) return;
    try {
      await updateDecisionStatusMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        decisionId,
        status,
      });
      addToast(
        `Status Updated: ${status.toUpperCase()}`,
        `Audit record updated for decision #${decisionId.slice(-4)}`
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Server error';
      addToast('Failed to Update Decision', errorMsg, 'warning');
    }
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

  // If meetings are loading on first visit
  if (isMeetingsLoading && meetings.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#DAEBF2] text-slate-900'
      }`}>
        <LoadingState
          message="Loading Executive Workspace..."
          subtext="Fetching verified meeting intelligence from REST API"
        />
      </div>
    );
  }

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
        selectedMeetingTitle={selectedMeeting?.title || 'No Meeting Selected'}
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
          selectedMeetingId={selectedMeeting?.id || ''}
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
              selectedMeeting ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#B0DEED] dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00F9C7] shadow-[0_0_8px_#00F9C7]" />
                        <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
                          {selectedMeeting.title}
                        </h1>
                        <span className="rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
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

                  {isDetailLoading && !meetingDetail ? (
                    <LoadingState
                      message="Loading Meeting Details..."
                      subtext="Fetching audio synchronized transcripts and minutes"
                      className="my-12"
                    />
                  ) : (
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
                          transcript={selectedMeeting.transcript || []}
                          speakers={speakersMap}
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
                          speakers={speakersMap}
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
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No Meeting Selected"
                  description="No meeting session is selected or available on the enterprise backend. Select a meeting from the sidebar or dashboard to start HITL MOM editing."
                  actionText="View Dashboard"
                  onAction={() => setActiveTab('dashboard')}
                  className="my-12"
                />
              )
            )}

            {/* Tab C: Decision Traceability Matrix */}
            {activeTab === 'traceability' && (
              selectedMeeting ? (
                <TraceabilityMatrixTab
                  meeting={selectedMeeting}
                  onSeek={handleSeek}
                  onOpenEditor={() => setActiveTab('mom-editor')}
                  onUpdateDecisionStatus={handleUpdateDecisionStatus}
                  onExportAuditReport={() => {
                    const filename = exportDecisionsToCSV(selectedMeeting);
                    addToast(
                      'Audit Matrix Exported',
                      `Downloaded ${filename} with verifiable RAG coordinates.`
                    );
                  }}
                />
              ) : (
                <EmptyState
                  title="No Meeting Selected"
                  description="Select a meeting to inspect vector-grounded RAG audit trails and citations."
                  actionText="View Dashboard"
                  onAction={() => setActiveTab('dashboard')}
                  className="my-12"
                />
              )
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
