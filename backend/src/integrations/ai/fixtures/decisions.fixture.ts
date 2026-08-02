import type { DecisionsResponse } from '../aiClient.js';

export const decisionsFixture: DecisionsResponse = {
  decisions: [
    {
      decision: 'Adopt Redis for session caching starting next sprint',
      madeBy: 'SPEAKER_00',
      rationale:
        'Reduces DB load for token lookups and improves response times.',
    },
    {
      decision: 'Frontend scaffold to use Next.js 14 with App Router',
      madeBy: 'SPEAKER_01',
      rationale:
        'Aligns with team expertise and supports SSR for meeting detail pages.',
    },
    {
      decision:
        'All AI endpoints to remain mocked until Python service is deployed',
      madeBy: 'SPEAKER_00',
      rationale:
        'Unblocks frontend development without waiting for AI service readiness.',
    },
  ],
};
