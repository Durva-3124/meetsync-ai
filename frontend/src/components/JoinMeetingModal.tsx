import React, { useState } from 'react';
import { X, LogIn, ArrowRight, Video, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJoinMeeting: (meetingId: string) => void;
}

export const JoinMeetingModal: React.FC<Props> = ({ isOpen, onClose, onJoinMeeting }) => {
  const [meetingIdInput, setMeetingIdInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingIdInput.trim()) return;
    onJoinMeeting(meetingIdInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl transition-all text-[var(--text-primary)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Join Active Meeting
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Enter session ID or invite link to join live call
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Meeting ID or Invite Link
            </label>
            <input
              type="text"
              required
              autoFocus
              value={meetingIdInput}
              onChange={(e) => setMeetingIdInput(e.target.value)}
              placeholder="e.g. 839-204-102"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:font-sans placeholder:text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            <span>Quick tip: Try typing </span>
            <button
              type="button"
              onClick={() => setMeetingIdInput('839-204-102')}
              className="font-mono font-bold text-[var(--primary)] hover:underline"
            >
              839-204-102
            </button>
            <span> to join the active Q4 Product Strategy session.</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-all active:scale-95"
            >
              <span>Join Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
