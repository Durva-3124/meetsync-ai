type MeetingStatus = 'scheduled' | 'processing' | 'ready' | 'reviewed';

const statusStyles: Record<MeetingStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
  reviewed: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}