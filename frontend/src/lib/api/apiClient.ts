import { Meeting, ActionItem, MeetingDecision, ApiError } from './types';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let details: unknown = null;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errorMessage = errJson.message;
      } else if (errJson && errJson.error) {
        errorMessage = errJson.error;
      }
      details = errJson;
    } catch {
      // Body not JSON
    }
    throw new ApiError(response.status, errorMessage, details);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  async getMeetings(): Promise<Meeting[]> {
    return request<Meeting[]>('/api/meetings');
  },

  async getMeetingById(id: string): Promise<Meeting> {
    return request<Meeting>(`/api/meetings/${encodeURIComponent(id)}`);
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    return request<Meeting>(`/api/meetings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateTranscriptSegment(
    meetingId: string,
    segmentId: string,
    payload: { text: string; speakerId?: string }
  ): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/transcript/${encodeURIComponent(segmentId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  async addActionItem(
    meetingId: string,
    actionItem: Omit<ActionItem, 'id'>
  ): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/action-items`,
      {
        method: 'POST',
        body: JSON.stringify(actionItem),
      }
    );
  },

  async toggleActionItem(meetingId: string, itemId: string): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/action-items/${encodeURIComponent(itemId)}/toggle`,
      {
        method: 'PATCH',
      }
    );
  },

  async deleteActionItem(meetingId: string, itemId: string): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/action-items/${encodeURIComponent(itemId)}`,
      {
        method: 'DELETE',
      }
    );
  },

  async addDecision(
    meetingId: string,
    decision: MeetingDecision
  ): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/decisions`,
      {
        method: 'POST',
        body: JSON.stringify(decision),
      }
    );
  },

  async updateDecisionStatus(
    meetingId: string,
    decisionId: string,
    status: 'verified' | 'disputed' | 'superseded'
  ): Promise<Meeting> {
    return request<Meeting>(
      `/api/meetings/${encodeURIComponent(meetingId)}/decisions/${encodeURIComponent(decisionId)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },
};
