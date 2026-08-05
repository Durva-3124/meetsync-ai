import type { InsightsResponse } from '../aiClient.js';

export const insightsFixture: InsightsResponse = {
  insights: [
    {
      speaker: 'SPEAKER_00',
      name: 'Alice',
      talkTimeSeconds: 145,
      talkTimePercent: 52.3,
      skills: ['facilitation', 'communication'],
      suggestions: ['Allow more response time after questions'],
    },
    {
      speaker: 'SPEAKER_01',
      name: 'Bob',
      talkTimeSeconds: 89,
      talkTimePercent: 32.1,
      skills: ['technical explanation'],
      suggestions: [],
    },
    {
      speaker: 'SPEAKER_02',
      name: 'Carol',
      talkTimeSeconds: 43,
      talkTimePercent: 15.6,
      skills: ['conciseness'],
      suggestions: ['Contribute earlier in discussions'],
    },
  ],
};
