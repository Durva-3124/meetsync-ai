import { StatusBadge } from '@/components/shared/StatusBadge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { NewMeetingDialog } from '@/components/dashboard/NewMeetingDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type MeetingStatus = 'scheduled' | 'processing' | 'ready' | 'reviewed';

interface Meeting {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
  participants: number;
}

const MOCK_MEETINGS: Meeting[] = [
  { id: '1', title: 'Sprint Planning', date: '2026-08-05', status: 'reviewed', participants: 6 },
  { id: '2', title: 'Design Review', date: '2026-08-05', status: 'ready', participants: 4 },
  { id: '3', title: 'Client Sync — Ardent Labs', date: '2026-08-04', status: 'processing', participants: 3 },
  { id: '4', title: '1:1 with Manager', date: '2026-08-04', status: 'reviewed', participants: 2 },
  { id: '5', title: 'Engineering Standup', date: '2026-08-03', status: 'reviewed', participants: 8 },
  { id: '6', title: 'Product Roadmap Q3', date: '2026-08-01', status: 'ready', participants: 5 },
];

async function fetchMeetings(): Promise<Meeting[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_MEETINGS;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const {
    data: meetings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['meetings'],
    queryFn: fetchMeetings,
  });

  const [localMeetings, setLocalMeetings] = useState<Meeting[]>([]);

  const handleCreateMeeting = ({ title, date }: { title: string; date: string }) => {
    const newMeeting: Meeting = {
      id: `local-${Date.now()}`,
      title,
      date,
      status: 'scheduled',
      participants: 1,
    };
    setLocalMeetings((prev) => [newMeeting, ...prev]);
  };

  const allMeetings = [...localMeetings, ...(meetings ?? [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold">
            Good morning, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your meetings.</p>
        </div>
        <NewMeetingDialog onCreate={handleCreateMeeting} />
      </div>

      <div className="rounded-lg border bg-background">
        {isLoading && <LoadingState message="Loading meetings..." />}

        {isError && <ErrorState message="Couldn't load meetings." onRetry={() => refetch()} />}

        {!isLoading && !isError && allMeetings.length === 0 && (
          <EmptyState
            title="No meetings yet"
            description="Create your first meeting to get started."
          />
        )}

        {!isLoading && !isError && allMeetings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={meeting.status} />
                  </TableCell>
                  <TableCell>{meeting.participants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}