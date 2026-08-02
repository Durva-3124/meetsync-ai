import type { SkillMatchResponse } from '../aiClient.js';

export const skillMatchFixture: SkillMatchResponse = {
  requiredSkills: ['TypeScript', 'React', 'API integration'],
  matchedUserId: null,
  confidence: 0.78,
};
