import type { MomResponse } from '../aiClient.js';

export const momFixture: MomResponse = {
  agenda: [
    'Sprint review',
    'Demo of completed features',
    'Retrospective',
    'Next sprint planning',
  ],
  discussionPoints: [
    {
      speaker: 'SPEAKER_00',
      point: 'Auth module with JWT rotation was completed and tested.',
    },
    {
      speaker: 'SPEAKER_01',
      point: 'Meeting schema with processingStatus enum is live.',
    },
    {
      speaker: 'SPEAKER_02',
      point: 'AI client scaffold with mock fixtures is ready for integration.',
    },
  ],
  summary:
    'The team completed the auth module, meeting schema, and AI client scaffold. Next sprint will focus on the frontend and Redis caching layer.',
};
