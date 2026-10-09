import React, { useState, useEffect } from 'react';
import { Search, X, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { MeetingSummaryItem, ActiveTab } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingSummaryItem[];
  onSelectMeeting: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  meetings,
  onSelectMeeting,
  setActiveTab,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-2xl overflow-hidden transition-all"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] gap-3 bg-[var(--card)]">
          <Search className="w-4 h-4 text-[#00F5D4]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a meeting title, decision, or persona..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] focus:outline-none placeholder-[var(--text-secondary)]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-[var(--card)]">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Meetings & Workspaces
          </p>

          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[var(--text-secondary)]">
              No meetings found matching "{query}"
            </div>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMeeting(m.id);
                  setActiveTab('editor');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs hover:bg-[var(--background)] text-[var(--text-primary)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[#00F5D4] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{m.title}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {m.department} · {m.duration} · {m.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="text-[10px] bg-[var(--background)] px-2 py-0.5 rounded text-emerald-500 border border-[var(--border)] font-mono">
                    {m.decisionAccuracy}% RAG
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))
          )}

          <div className="pt-2 border-t border-[var(--border)] mt-2">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Quick Navigation
            </p>
            <button
              onClick={() => {
                setActiveTab('traceability');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--background)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>Open Cross-Meeting Decision Traceability Matrix</span>
            </button>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--background)] border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
