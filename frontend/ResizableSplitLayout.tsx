import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Eye, Video, FileText, Edit3 } from 'lucide-react';

interface ResizableSplitLayoutProps {
  leftComponent: React.ReactNode;
  middleComponent: React.ReactNode;
  rightComponent: React.ReactNode;
}

export const ResizableSplitLayout: React.FC<ResizableSplitLayoutProps> = ({
  leftComponent,
  middleComponent,
  rightComponent,
}) => {
  // Column width percentages for desktop: left (player), middle (transcript), right (mom editor)
  const [leftWidth, setLeftWidth] = useState(36);
  const [middleWidth, setMiddleWidth] = useState(32);
  const rightWidth = 100 - leftWidth - middleWidth;

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingDivider = useRef<'first' | 'second' | null>(null);

  // Resize drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingDivider.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const totalWidth = rect.width;
      const currentPercent = (pointerX / totalWidth) * 100;

      if (draggingDivider.current === 'first') {
        // Clamp left width between 20% and 55%
        const newLeft = Math.max(20, Math.min(55, currentPercent));
        setLeftWidth(newLeft);
        // Ensure middle width has at least 20%
        if (100 - newLeft - middleWidth < 20) {
          setMiddleWidth(100 - newLeft - 20);
        }
      } else if (draggingDivider.current === 'second') {
        // Divider 2 separates middle and right
        const newTotalFirstTwo = Math.max(leftWidth + 20, Math.min(80, currentPercent));
        const newMiddle = newTotalFirstTwo - leftWidth;
        setMiddleWidth(newMiddle);
      }
    };

    const handleMouseUp = () => {
      draggingDivider.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [leftWidth, middleWidth]);

  const startDragFirst = () => {
    draggingDivider.current = 'first';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startDragSecond = () => {
    draggingDivider.current = 'second';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Preset layouts
  const applyPreset = (preset: 'balanced' | 'player' | 'transcript' | 'editor') => {
    if (preset === 'balanced') {
      setLeftWidth(34);
      setMiddleWidth(33);
    } else if (preset === 'player') {
      setLeftWidth(50);
      setMiddleWidth(25);
    } else if (preset === 'transcript') {
      setLeftWidth(25);
      setMiddleWidth(50);
    } else if (preset === 'editor') {
      setLeftWidth(25);
      setMiddleWidth(25);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Split View Toolbar Preset Controls */}
      <div className="hidden lg:flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Columns3 className="h-3.5 w-3.5 text-[#1D70F5]" />
          <span>Interactive 3-Pane Split View (Drag dividers to adjust)</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            onClick={() => applyPreset('balanced')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-semibold transition"
          >
            Balanced (33/33/34)
          </button>
          <button
            onClick={() => applyPreset('player')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-semibold transition"
          >
            <Video className="h-3 w-3" /> Focus Player
          </button>
          <button
            onClick={() => applyPreset('transcript')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-semibold transition"
          >
            <FileText className="h-3 w-3" /> Focus Transcript
          </button>
          <button
            onClick={() => applyPreset('editor')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-semibold transition"
          >
            <Edit3 className="h-3 w-3" /> Focus MOM Editor
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative flex flex-col lg:flex-row h-full min-h-[640px] max-h-[850px] w-full gap-4 lg:gap-0"
      >
        {/* Left Column (Video/Audio Player) */}
        <div
          className="w-full lg:h-full lg:overflow-hidden flex flex-col"
          style={{ flex: `0 0 ${leftWidth}%` }}
        >
          {leftComponent}
        </div>

        {/* Divider 1 Handle */}
        <div
          onMouseDown={startDragFirst}
          className="hidden lg:flex w-2.5 items-center justify-center cursor-col-resize hover:bg-[#1D70F5]/20 group transition rounded-full mx-0.5 z-20 select-none"
          title="Drag to resize Player and Transcript panes"
        >
          <div className="h-8 w-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#1D70F5]" />
        </div>

        {/* Middle Column (Diarized Transcript) */}
        <div
          className="w-full lg:h-full lg:overflow-hidden flex flex-col"
          style={{ flex: `0 0 ${middleWidth}%` }}
        >
          {middleComponent}
        </div>

        {/* Divider 2 Handle */}
        <div
          onMouseDown={startDragSecond}
          className="hidden lg:flex w-2.5 items-center justify-center cursor-col-resize hover:bg-[#1D70F5]/20 group transition rounded-full mx-0.5 z-20 select-none"
          title="Drag to resize Transcript and Editor panes"
        >
          <div className="h-8 w-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#1D70F5]" />
        </div>

        {/* Right Column (Editable MOM Panel) */}
        <div
          className="w-full lg:h-full lg:overflow-hidden flex flex-col flex-1"
          style={{ flex: `0 0 ${rightWidth}%` }}
        >
          {rightComponent}
        </div>
      </div>
    </div>
  );
};
