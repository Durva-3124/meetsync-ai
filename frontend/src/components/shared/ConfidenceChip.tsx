type ConfidenceLevel = 'low' | 'medium' | 'high';

interface ConfidenceChipProps {
  level: ConfidenceLevel;
}

const confidenceStyles: Record<ConfidenceLevel, string> = {
  low: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-emerald-100 text-emerald-700',
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

export function ConfidenceChip({ level }: ConfidenceChipProps) {
  return (
    <span
      title={confidenceLabels[level]}
      className={`inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${confidenceStyles[level]}`}
    >
      {level}
    </span>
  );
}