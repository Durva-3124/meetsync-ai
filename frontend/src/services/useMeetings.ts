import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from './meetingService';
import { Meeting, ActionItem, MeetingDecision } from '../lib/api/types';

export const MEETINGS_QUERY_KEY = ['meetings'];
export const meetingDetailQueryKey = (id: string) => ['meetings', id];

export function useMeetingsQuery() {
  return useQuery<Meeting[], Error>({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: () => meetingService.fetchMeetings(),
    staleTime: 30000,
  });
}

export function useMeetingDetailQuery(id: string | undefined | null) {
  return useQuery<Meeting, Error>({
    queryKey: meetingDetailQueryKey(id || ''),
    queryFn: () => {
      if (!id) throw new Error('No meeting ID provided');
      return meetingService.fetchMeetingById(id);
    },
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useUpdateMeetingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Meeting> }) =>
      meetingService.updateMeeting(id, updates),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useUpdateTranscriptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      segmentId,
      payload,
    }: {
      meetingId: string;
      segmentId: string;
      payload: { text: string; speakerId?: string };
    }) => meetingService.updateTranscriptSegment(meetingId, segmentId, payload),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useAddActionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      item,
    }: {
      meetingId: string;
      item: Omit<ActionItem, 'id'>;
    }) => meetingService.addActionItem(meetingId, item),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useToggleActionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      itemId,
    }: {
      meetingId: string;
      itemId: string;
    }) => meetingService.toggleActionItem(meetingId, itemId),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useDeleteActionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      itemId,
    }: {
      meetingId: string;
      itemId: string;
    }) => meetingService.deleteActionItem(meetingId, itemId),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useAddDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      decision,
    }: {
      meetingId: string;
      decision: MeetingDecision;
    }) => meetingService.addDecision(meetingId, decision),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}

export function useUpdateDecisionStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      decisionId,
      status,
    }: {
      meetingId: string;
      decisionId: string;
      status: 'verified' | 'disputed' | 'superseded';
    }) => meetingService.updateDecisionStatus(meetingId, decisionId, status),
    onSuccess: (updatedMeeting) => {
      queryClient.setQueryData(meetingDetailQueryKey(updatedMeeting.id), updatedMeeting);
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    },
  });
}
