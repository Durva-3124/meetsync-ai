import { AnalyticsData, Meeting, MeetingSummaryItem, User, ActionItem } from '../types';

// Connect with Express backend. Supports local proxy (/api) and external backend (http://localhost:5000/api)
let detectedApiBase: string | null = null;

const getApiBaseUrl = (): string => {
  // Check if custom backend URL is configured
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '');
  }
  if (detectedApiBase !== null) {
    return detectedApiBase;
  }
  return '';
};

// Check if external backend at http://localhost:5000 is active when developing locally
if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000') {
  fetch('http://localhost:5000/api/config', { method: 'GET', mode: 'cors' })
    .then((res) => {
      if (res.ok) {
        detectedApiBase = 'http://localhost:5000';
      } else {
        detectedApiBase = '';
      }
    })
    .catch(() => {
      detectedApiBase = '';
    });
}

// Automatically attach Authorization: Bearer <token>
const fetchWithAuth = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  
  // Ensure token exists, default to primary user session if not set
  let token = localStorage.getItem('meetsync_token');
  if (!token) {
    token = 'jwt_user-1_init';
    localStorage.setItem('meetsync_token', token);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export const api = {
  // Backend config
  async getConfig(): Promise<{ aiUseMocks: boolean; smtpHost: string; environment: string }> {
    try {
      const res = await fetchWithAuth('/api/config');
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return { aiUseMocks: true, smtpHost: 'smtp.ethereal.email', environment: 'development' };
  },

  // Ethereal SMTP Reminders
  async dispatchReminder(data: {
    meetingId?: string;
    recipient?: string;
    taskId?: string;
    message?: string;
  }): Promise<{ success: boolean; message: string; smtpHost: string; recipient: string }> {
    const res = await fetchWithAuth('/api/notifications/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to dispatch reminder');
    return res.json();
  },

  // Current user & personas
  async getMe(): Promise<{ user: User; availablePersonas: User[] }> {
    const res = await fetchWithAuth('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string, role?: string): Promise<{ token: string; user: User }> {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  async switchPersona(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetchWithAuth('/api/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch persona');
    return res.json();
  },

  // Analytics KPI
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetchWithAuth('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Meetings
  async getMeetings(): Promise<{ meetings: MeetingSummaryItem[] }> {
    const res = await fetchWithAuth('/api/meetings');
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return res.json();
  },

  async getMeetingById(id: string): Promise<{ meeting: Meeting }> {
    const res = await fetchWithAuth(`/api/meetings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch meeting');
    return res.json();
  },

  async createMeeting(data: {
    title: string;
    department?: string;
    attendees?: string[];
    duration?: string;
    diarizationModel?: string;
  }): Promise<{ meeting: Meeting }> {
    const res = await fetchWithAuth('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create meeting');
    return res.json();
  },

  async deleteMeeting(id: string): Promise<{ success: boolean; deletedId: string }> {
    const res = await fetchWithAuth(`/api/meetings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete meeting');
    return res.json();
  },

  async seedDemoMeeting(title?: string): Promise<{ success: boolean; meeting: Meeting }> {
    const res = await fetchWithAuth('/api/meetings/seed', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to seed meeting');
    return res.json();
  },

  async updateMeetingMOM(
    id: string,
    data: {
      summary?: string;
      keyPoints?: string[];
      addedPoint?: string;
      locked?: boolean;
    }
  ): Promise<{ success: boolean; momDraft: Meeting['momDraft']; status: Meeting['status'] }> {
    const res = await fetchWithAuth(`/api/meetings/${id}/mom`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update MOM');
    return res.json();
  },

  // Tasks
  async getTasks(): Promise<{ tasks: ActionItem[] }> {
    const res = await fetchWithAuth('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async updateTask(id: string, data: Partial<ActionItem>): Promise<{ success: boolean; task: ActionItem }> {
    const res = await fetchWithAuth(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  // AI Summarize
  async summarizeWithAI(data: {
    transcriptText: string;
    instruction?: string;
    meetingTitle?: string;
  }): Promise<{ refinedSummary: string; keyPoints?: string[] }> {
    const res = await fetchWithAuth('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate AI summary');
    return res.json();
  },

  // Export MOM
  async exportMeetingMOM(
    id: string,
    format: 'docx' | 'pdf' | 'json'
  ): Promise<{ success: boolean; downloadUrl: string; filename: string }> {
    const res = await fetchWithAuth(`/api/meetings/${id}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
    if (!res.ok) throw new Error('Failed to export MOM');
    return res.json();
  },
};

