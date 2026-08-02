import FormData from 'form-data';
import { env } from '../../config/env.js';
import { ai1, ai2, withAi1, withAi2 } from './resilience.js';
import { toAiError } from './aiError.js';
import { transcribeFixture } from './fixtures/transcribe.fixture.js';
import { summarizeFixture } from './fixtures/summarize.fixture.js';
import { actionItemsFixture } from './fixtures/actionItems.fixture.js';
import { sentimentFixture } from './fixtures/sentiment.fixture.js';
import { identifySpeakersFixture } from './fixtures/identifySpeakers.fixture.js';
import { insightsFixture } from './fixtures/insights.fixture.js';
import { momFixture } from './fixtures/mom.fixture.js';
import { decisionsFixture } from './fixtures/decisions.fixture.js';
import { deadlinesFixture } from './fixtures/deadlines.fixture.js';
import { skillMatchFixture } from './fixtures/skillMatch.fixture.js';
import { effectivenessScoreFixture } from './fixtures/effectivenessScore.fixture.js';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface TranscribeResponse {
  transcript: TranscriptSegment[];
}
export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
}
export interface ActionItemsResponse {
  actionItems: {
    assignee: string;
    task: string;
    dueDate?: string;
    source_span?: { start: number; end: number; text: string };
  }[];
}
export interface SentimentResponse {
  overall: string;
  score: number;
  bySpeaker: Record<string, { sentiment: string; score: number }>;
}
export interface IdentifySpeakersResponse {
  speakerMap: Record<string, { name: string; email: string }>;
}
export interface InsightsResponse {
  insights: {
    speaker: string;
    name: string;
    talkTimeSeconds: number;
    talkTimePercent: number;
    skills: string[];
    suggestions: string[];
  }[];
}
export interface MomResponse {
  agenda: string[];
  discussionPoints: { speaker: string; point: string }[];
  summary: string;
}
export interface DecisionsResponse {
  decisions: { decision: string; madeBy: string; rationale?: string }[];
}
export interface DeadlinesResponse {
  deadlines: {
    description: string;
    assignee: string;
    deadline: string;
    rawText: string;
  }[];
}
export interface SkillMatchResponse {
  requiredSkills: string[];
  matchedUserId: string | null;
  confidence: number;
}
export interface EffectivenessScoreResponse {
  score: number;
  breakdown: {
    decisionsScore: number;
    keyPointsCoverage: number;
    participationBalance: number;
  };
  suggestions: string[];
}

// ── Re-export error types so callers can instanceof-check ─────────────────────
export { AiServiceError } from './aiError.js';

const useMocks = env.AI_USE_MOCKS === 'true';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ai1Post<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    return await withAi1(async () => {
      const { data } = await ai1.post<T>(endpoint, body);
      return data;
    });
  } catch (err) {
    throw toAiError('ai-1', endpoint, err);
  }
}

async function ai2Post<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    return await withAi2(async () => {
      const { data } = await ai2.post<T>(endpoint, body);
      return data;
    });
  } catch (err) {
    throw toAiError('ai-2', endpoint, err);
  }
}

// ── Client methods ────────────────────────────────────────────────────────────

export const transcribeAudio = async (
  fileBuffer: Buffer,
  mimetype: string
): Promise<TranscribeResponse> => {
  if (useMocks) return transcribeFixture;
  try {
    return await withAi1(async () => {
      const form = new FormData();
      form.append('file', fileBuffer, {
        contentType: mimetype,
        filename: 'audio',
      });
      const { data } = await ai1.post<TranscribeResponse>(
        '/internal/ai/transcribe',
        form,
        {
          headers: form.getHeaders(),
        }
      );
      return data;
    });
  } catch (err) {
    throw toAiError('ai-1', '/internal/ai/transcribe', err);
  }
};

export const summarizeMeeting = async (
  transcript: TranscriptSegment[],
  meetingTitle: string
): Promise<SummarizeResponse> => {
  if (useMocks) return summarizeFixture;
  return ai1Post('/internal/ai/summarize', { transcript, meetingTitle });
};

export const extractActionItems = async (
  transcript: TranscriptSegment[]
): Promise<ActionItemsResponse> => {
  if (useMocks) return actionItemsFixture;
  return ai1Post('/internal/ai/action-items', { transcript });
};

export const generateMom = async (
  transcript: TranscriptSegment[],
  meetingTitle: string
): Promise<MomResponse> => {
  if (useMocks) return momFixture;
  return ai1Post('/internal/ai/mom', { transcript, meetingTitle });
};

export const extractDecisions = async (
  transcript: TranscriptSegment[]
): Promise<DecisionsResponse> => {
  if (useMocks) return decisionsFixture;
  return ai1Post('/internal/ai/decisions', { transcript });
};

export const extractDeadlines = async (
  transcript: TranscriptSegment[]
): Promise<DeadlinesResponse> => {
  if (useMocks) return deadlinesFixture;
  return ai1Post('/internal/ai/deadlines', { transcript });
};

export const analyzeSentiment = async (
  transcript: TranscriptSegment[]
): Promise<SentimentResponse> => {
  if (useMocks) return sentimentFixture;
  return ai2Post('/internal/ai/sentiment', { transcript });
};

export const identifySpeakers = async (
  transcript: TranscriptSegment[],
  participants: { name: string; email: string }[]
): Promise<IdentifySpeakersResponse> => {
  if (useMocks) return identifySpeakersFixture;
  return ai2Post('/internal/ai/identify-speakers', {
    transcript,
    participants,
  });
};

export const getMeetingInsights = async (
  transcript: TranscriptSegment[],
  speakerMap: Record<string, { name: string; email: string }>
): Promise<InsightsResponse> => {
  if (useMocks) return insightsFixture;
  return ai2Post('/internal/ai/insights', { transcript, speakerMap });
};

export const matchSkill = async (
  task: string,
  assignee: string,
  participants: { name: string; email: string; skills: string[] }[]
): Promise<SkillMatchResponse> => {
  if (useMocks) return skillMatchFixture;
  return ai2Post('/internal/ai/skill-match', { task, assignee, participants });
};

export const scoreEffectiveness = async (input: {
  decisions: { decision: string; madeBy: string; rationale?: string }[];
  keyPoints: string[];
  talkTime: {
    speaker: string;
    talkTimeSeconds: number;
    talkTimePercent: number;
  }[];
}): Promise<EffectivenessScoreResponse> => {
  if (useMocks) return effectivenessScoreFixture;
  return ai2Post('/internal/ai/effectiveness-score', input);
};
