import React, { useState } from 'react';
import { SpeakerAirtimeItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: SpeakerAirtimeItem[];
}

export const SpeakerAirtimeDonut: React.FC<Props> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultData: SpeakerAirtimeItem[] = [
    {
      speaker: 'Trisha Moharle',
      percentage: 38,
      minutes: 17,
      color: '#00F5D4',
      initials: 'TM',
      wordsSpoken: 2450,
      interruptionRate: '1.2%',
    },
    {
      speaker: 'Mohan Moharle',
      percentage: 26,
      minutes: 12,
      color: '#2563EB',
      initials: 'MM',
      wordsSpoken: 1680,
      interruptionRate: '0.8%',
    },
    {
      speaker: 'Elena Rostova',
      percentage: 22,
      minutes: 10,
      color: '#A855F7',
      initials: 'ER',
      wordsSpoken: 1420,
      interruptionRate: '0.5%',
    },
    {
      speaker: 'David Chen',
      percentage: 14,
      minutes: 6,
      color: '#F59E0B',
      initials: 'DC',
      wordsSpoken: 920,
      interruptionRate: '0.4%',
    },
  ];

  const speakers = data && data.length > 0 ? data : defaultData;
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // SVG parameters
  const size = 220;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  let accumulatedPercent = 0;
  const segments = speakers.map((speaker, index) => {
    const strokeDasharray = `${(speaker.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += speaker.percentage;
    return {
      ...speaker,
      index,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSpeaker = speakers[hoveredIndex] || speakers[0];

  return (
    <div
      className="rounded-xl p-6 transition-colors flex flex-col justify-between bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] shadow-xs"
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          Speaker Airtime
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Vocal engagement & speaking parity
        </p>
      </div>

      {/* Donut Chart Display */}
      <div className="relative flex items-center justify-center my-4">
        <svg width={size} height={size} className="transform -rotate-90 select-none">
          {/* Base background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={isDark ? '#334155' : '#B6DFEF'}
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg) => {
            const isHovered = hoveredIndex === seg.index;
            return (
              <circle
                key={seg.speaker}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(seg.index)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-[var(--text-secondary)] font-medium">Parity Score</span>
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono tabular-nums">
            94<span className="text-xs text-emerald-400 font-sans ml-0.5">%</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">High Vocal Balance</span>
        </div>
      </div>

      {/* Bottom Highlighted Legend / Selected Speaker */}
      <div className="pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeSpeaker.color }}
            />
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[130px]">
              {activeSpeaker.speaker}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono tabular-nums text-xs font-semibold text-[var(--text-primary)]">
            <span style={{ color: activeSpeaker.color }}>{activeSpeaker.percentage}%</span>
            <span className="text-[var(--text-secondary)] font-sans font-normal">({activeSpeaker.minutes}m)</span>
          </div>
        </div>

        {/* Mini Pill List for All Speakers */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 text-[11px]">
          {speakers.map((s, idx) => (
            <button
              key={s.speaker}
              onClick={() => setHoveredIndex(idx)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                hoveredIndex === idx
                  ? isDark
                    ? 'bg-slate-800 text-white font-medium'
                    : 'bg-[#D9EBF3] text-[var(--primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.speaker.split(' ')[0]}</span>
              </div>
              <span className="font-mono tabular-nums shrink-0 ml-1">{s.percentage}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
