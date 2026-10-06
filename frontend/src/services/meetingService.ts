import { apiClient } from '../lib/api/apiClient';
import { TranscriptSegment, ActionItem } from '../lib/api/types';

export const meetingService = {
  getMeetings: async () => {
    const response = await apiClient.get('/meetings');
    return response.data;
  },
  getTranscript: async (id: string): Promise<TranscriptSegment[]> => {
    const response = await apiClient.get(/meetings//transcript);
    return response.data;
  },
  getMom: async (id: string) => {
    const response = await apiClient.get(/meetings//mom);
    return response.data;
  },
  getDecisions: async (id: string) => {
    const response = await apiClient.get(/meetings//decisions);
    return response.data;
  },
};
