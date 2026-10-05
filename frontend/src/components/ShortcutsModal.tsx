import React from 'react';
import { X, Keyboard, Play, FileEdit, Flag, Search, Layers } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Media & Playback Control',
      icon: Play,
      items: [
        { keys: ['J'], desc: 'Rewind 5 seconds in synchronized playback' },
        { keys: ['K'], desc: 'Toggle Play / Pause media playback' },
        { keys: ['L'], desc: 'Fast forward 5 seconds in synchronized playback' },
        { keys: ['Space'], desc: 'Alternative Play / Pause toggle' },
        { keys: ['S'], desc: 'Flag current playback timestamp as a Decision Point' },
      ],
    },
    {
      group: 'Workflow & Navigation',
      icon: Layers,
      items: [
        { keys: ['Cmd', 'K'], desc: 'Open Command Palette & Global Search' },
        { keys: ['E'], desc: 'Jump focus to Human-In-The-Loop MOM Editor' },
        { keys: ['1'], desc: 'Switch to Tab A: Dashboard Overview' },
        { keys: ['2'], desc: 'Switch to Tab B: HITL MOM Editor' },
        { keys: ['3'], desc: 'Switch to Tab C: Decision Traceability Matrix' },
        { keys: ['?'], desc: 'Open or close this shortcuts cheatsheet' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#B0DEED] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1D70F5]/10 text-[#1D70F5] dark:bg-[#1D70F5]/20">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                MeetSync Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accelerate review, playback scrubbing, and decision audits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.group} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <GroupIcon className="h-3.5 w-3.5 text-[#1D70F5]" />
                  <span>{group.group}</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.desc}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, i) => (
                          <kbd
                            key={i}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#1D70F5] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#155bd0] transition min-h-[44px]"
          >
            Got it, continue
          </button>
        </div>

      </div>
    </div>
  );
};
