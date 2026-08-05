import type { SummarizeResponse } from '../aiClient.js';

export const summarizeFixture: SummarizeResponse = {
  summary:
    'The sprint review covered completed work including the auth module and meeting schema. The team discussed progress on the AI integration layer and agreed on next steps for the frontend scaffold.',
  keyPoints: [
    'Auth module with JWT rotation completed',
    'Meeting schema with processingStatus enum implemented',
    'AI client scaffold planned for next sprint',
  ],
};
