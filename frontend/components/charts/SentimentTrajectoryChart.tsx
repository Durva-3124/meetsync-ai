import React, { useState } from 'react';
import { SentimentPoint } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: SentimentPoint[];
  meetingTitle?: string;
  onTimeSelect?: (seconds: number) => void;
}

export const SentimentTrajectoryChart: React.FC<Props> = ({
  data,
  meetingTitle = 'Q4 Product Strategy Sync',
  onTimeSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Default trajectory points if data is empty
  const points = data.length > 0 ? data : [
    { time: '00:00', seconds: 0, positive: 45, neutral: 50, skeptical: 5 },
    { time: '07:30', seconds: 450, positive: 58, neutral: 36, skeptical: 6 },
    { time: '15:00', seconds: 900, positive: 38, neutral: 42, skeptical: 20 },
    { time: '22:30', seconds: 1350, positive: 72, neutral: 22, skeptical: 6 },
    { time: '30:00', seconds: 1800, positive: 92, neutral: 6, skeptical: 2 },
    { time: '37:30', seconds: 2250, positive: 86, neutral: 11, skeptical: 3 },
    { time: '45:00', seconds: 2700, positive: 88, neutral: 10, skeptical: 2 },
  ];

  const [hoverIndex, setHoverIndex] = useState<number>(4); // Default to 30:00 as shown in screenshot

  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 52;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Coordinate mapping
  const getX = (index: number) => {
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    // 0% at bottom, 100% at top
    return paddingTop + chartHeight - (val / 100) * chartHeight;
  };

  // Build smooth cubic bezier path for positive line
  const coordinates = points.map((p, i) => ({ x: getX(i), y: getY(p.positive) }));

  // Generate smooth SVG path using Catmull-Rom or cubic bezier control points
  const generateSmoothPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(coordinates);
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${paddingTop + chartHeight} L ${coordinates[0].x} ${paddingTop + chartHeight} Z`;

  const activePoint = points[hoverIndex] || points[4];
  const activeCoord = coordinates[hoverIndex] || coordinates[4];

  return (
    <div
      className="rounded-xl p-6 transition-colors relative bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            Sentiment & Engagement Trajectory
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Continuous acoustic & NLP sentiment analysis for: {meetingTitle}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span className="text-[var(--text-secondary)]">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-[var(--text-secondary)]">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            <span className="text-[var(--text-secondary)]">Skeptical</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * svgWidth - paddingLeft;
            const step = chartWidth / (points.length - 1);
            let idx = Math.round(relX / step);
            if (idx < 0) idx = 0;
            if (idx >= points.length) idx = points.length - 1;
            setHoverIndex(idx);
          }}
          onClick={() => {
            if (onTimeSelect && activePoint) {
              onTimeSelect(activePoint.seconds);
            }
          }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={isDark ? 0.45 : 0.35} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (25%, 50%, 75%, 100%) */}
          {[100, 75, 50, 25].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke={isDark ? '#1E293B' : '#F1F5F9'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={isDark ? '#64748B' : '#94A3B8'}
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  className="tabular-nums"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Bottom X-axis baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke={isDark ? '#334155' : '#E2E8F0'}
            strokeWidth="1"
          />

          {/* Area under curve */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Timestamps */}
          {points.map((p, i) => {
            const x = getX(i);
            const y = paddingTop + chartHeight + 18;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fill={isDark ? '#64748B' : '#94A3B8'}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                className="tabular-nums"
              >
                {p.time}
              </text>
            );
          })}

          {/* Hover indicator vertical line */}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={paddingTop}
              x2={activeCoord.x}
              y2={paddingTop + chartHeight}
              stroke="#00E5FF"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.85"
            />
          )}

          {/* Active Data Point Circle with Outer Ring */}
          {activeCoord && (
            <g transform={`translate(${activeCoord.x}, ${activeCoord.y})`}>
              <circle r="7" fill="#2563EB" opacity="0.3" filter="url(#glow)" />
              <circle r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            </g>
          )}
        </svg>

        {/* Hover Tooltip - Styled exactly matching Screenshot 1 */}
        {activePoint && activeCoord && (
          <div
            className={`absolute pointer-events-none transition-all duration-75 z-20 px-3 py-2 rounded-lg text-xs font-mono shadow-2xl border ${
              isDark
                ? 'bg-[#0B132B]/95 border-slate-700 text-slate-100 shadow-cyan-950/40'
                : 'bg-slate-900/95 border-slate-800 text-white shadow-slate-400/40'
            }`}
            style={{
              left: `${(activeCoord.x / svgWidth) * 100}%`,
              top: `${(activeCoord.y / svgHeight) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-semibold text-white tracking-wide border-b border-slate-700/60 pb-1 mb-1">
              {activePoint.time}
              {activePoint.keyEvent && (
                <span className="font-sans text-[10px] text-slate-400 font-normal ml-2">
                  ({activePoint.keyEvent})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#38BDF8]">
              <span>positive :</span>
              <span className="font-bold">{activePoint.positive}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#F87171]">
              <span>skeptical :</span>
              <span className="font-bold">{activePoint.skeptical}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
