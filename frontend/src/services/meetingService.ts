import { apiClient } from '../lib/api/apiClient';
import { Meeting, ActionItem, MeetingDecision } from '../lib/api/types';

export const meetingService = {
  fetchMeetings: async (): Promise<Meeting[]> => {
    return apiClient.getMeetings();
  },

  fetchMeetingById: async (id: string): Promise<Meeting> => {
    return apiClient.getMeetingById(id);
  },

  updateMeeting: async (id: string, updates: Partial<Meeting>): Promise<Meeting> => {
    return apiClient.updateMeeting(id, updates);
  },

  updateTranscriptSegment: async (
    meetingId: string,
    segmentId: string,
    payload: { text: string; speakerId?: string }
  ): Promise<Meeting> => {
    return apiClient.updateTranscriptSegment(meetingId, segmentId, payload);
  },

  addActionItem: async (
    meetingId: string,
    actionItem: Omit<ActionItem, 'id'>
  ): Promise<Meeting> => {
    return apiClient.addActionItem(meetingId, actionItem);
  },

  toggleActionItem: async (meetingId: string, itemId: string): Promise<Meeting> => {
    return apiClient.toggleActionItem(meetingId, itemId);
  },

  deleteActionItem: async (meetingId: string, itemId: string): Promise<Meeting> => {
    return apiClient.deleteActionItem(meetingId, itemId);
  },

  addDecision: async (meetingId: string, decision: MeetingDecision): Promise<Meeting> => {
    return apiClient.addDecision(meetingId, decision);
  },

  updateDecisionStatus: async (
    meetingId: string,
    decisionId: string,
    status: 'verified' | 'disputed' | 'superseded'
  ): Promise<Meeting> => {
    return apiClient.updateDecisionStatus(meetingId, decisionId, status);
  },
};
