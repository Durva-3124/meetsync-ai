import React from 'react';
import { X, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonaSwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, availablePersonas, switchPersona } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Switch Executive Persona
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Test roles, permissions, and workload assignments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {availablePersonas.map((p) => {
            const isSelected = user?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={async () => {
                  await switchPersona(p.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[var(--background)] border-[#00F5D4] shadow-sm text-[var(--text-primary)] ring-1 ring-[#00F5D4]/40'
                    : 'bg-[var(--background)]/50 border-[var(--border)] hover:border-slate-400 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shrink-0 shadow-sm"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">{p.email}</p>
                    <p className="text-[10px] text-[#00F5D4] font-medium truncate mt-0.5">
                      {p.role}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#00F5D4] flex items-center justify-center text-slate-950 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0">
                    Select
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-[#00F5D4] shrink-0" />
          <span>Personas simulate authentic multi-role access controls and skill assignments.</span>
        </div>
      </div>
    </div>
  );
};
