import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  Play,
  GitBranch,
  Settings,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { Meeting, ActiveTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  onSelectMeeting: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onTogglePlay: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  meetings,
  onSelectMeeting,
  setActiveTab,
  darkMode,
  setDarkMode,
  onTogglePlay,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable items
  const items = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard Overview',
      subtitle: 'View executive KPIs, sentiment trends, & airtime analytics',
      category: 'Navigation',
      icon: Sliders,
      action: () => {
        setActiveTab('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-mom',
      title: 'Open HITL MOM Editor',
      subtitle: 'Synchronized media playback, transcript, and minutes panel',
      category: 'Navigation',
      icon: FileText,
      action: () => {
        setActiveTab('mom-editor');
        onClose();
      },
    },
    {
      id: 'nav-traceability',
      title: 'Open Decision Traceability Matrix',
      subtitle: 'RAG-backed audit log & citation verification',
      category: 'Navigation',
      icon: GitBranch,
      action: () => {
        setActiveTab('traceability');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Open Platform Settings',
      subtitle: 'Confidence thresholds, integrations, and export templates',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        setActiveTab('settings');
        onClose();
      },
    },
    // Media controls
    {
      id: 'ctrl-play',
      title: 'Toggle Media Playback',
      subtitle: 'Play or pause current meeting recording',
      category: 'Media Controls',
      icon: Play,
      action: () => {
        onTogglePlay();
        onClose();
      },
    },
    // Theme
    {
      id: 'ctrl-theme',
      title: darkMode ? 'Switch to Icy Blue Light Mode' : 'Switch to Slate Dark Mode',
      subtitle: 'Toggle platform interface color theme',
      category: 'Preferences',
      icon: darkMode ? Sun : Moon,
      action: () => {
        setDarkMode((prev) => !prev);
        onClose();
      },
    },
    // Meetings
    ...meetings.map((m) => ({
      id: `mtg-${m.id}`,
      title: m.title,
      subtitle: `${m.date} · ${m.department} · ${m.attendees.map((a) => a.name).join(', ')}`,
      category: 'Meetings',
      icon: FileText,
      action: () => {
        onSelectMeeting(m.id);
        setActiveTab('mom-editor');
        onClose();
      },
    })),
  ];

  const filteredItems = items.filter((item) =>
    `${item.title} ${item.subtitle} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#B0DEED] bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Input header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search meetings, decisions, transcripts..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No matching commands or meetings found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected
                      ? 'bg-[#1D70F5]/10 text-[#1D70F5] dark:bg-[#1D70F5]/20'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1D70F5] text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-4">
            <span><kbd className="font-mono bg-white dark:bg-slate-800 border px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-white dark:bg-slate-800 border px-1 rounded">↵</kbd> select</span>
            <span><kbd className="font-mono bg-white dark:bg-slate-800 border px-1 rounded">esc</kbd> close</span>
          </div>
          <span>MeetSync Command Mesh</span>
        </div>
      </div>
    </div>
  );
};
