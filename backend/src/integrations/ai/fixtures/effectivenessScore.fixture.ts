import type { EffectivenessScoreResponse } from '../aiClient.js';

export const effectivenessScoreFixture: EffectivenessScoreResponse = {
  score: 78,
  breakdown: {
    decisionsScore: 85,
    keyPointsCoverage: 72,
    participationBalance: 76,
  },
  suggestions: [
    'Encourage quieter participants to contribute earlier',
    'Document rationale for all decisions, not just major ones',
    'Reduce monologue segments to improve participation balance',
  ],
};
