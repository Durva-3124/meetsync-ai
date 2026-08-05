import type { SentimentResponse } from '../aiClient.js';

export const sentimentFixture: SentimentResponse = {
  overall: 'positive',
  score: 0.82,
  bySpeaker: {
    SPEAKER_00: { sentiment: 'positive', score: 0.85 },
    SPEAKER_01: { sentiment: 'positive', score: 0.79 },
    SPEAKER_02: { sentiment: 'neutral', score: 0.61 },
  },
};
