import type { DeadlinesResponse } from '../aiClient.js';

export const deadlinesFixture: DeadlinesResponse = {
  deadlines: [
    {
      description: 'Submit frontend scaffold PR',
      assignee: 'Alice',
      deadline: '2025-08-04T17:00:00.000Z',
      rawText: 'Alice will submit the frontend scaffold PR by Monday EOD.',
    },
    {
      description: 'Write integration tests for auth routes',
      assignee: 'Bob',
      deadline: '2025-08-01T17:00:00.000Z',
      rawText: 'Bob needs to finish integration tests by end of this week.',
    },
    {
      description: 'Set up Redis caching layer',
      assignee: 'Carol',
      deadline: '2025-08-04T17:00:00.000Z',
      rawText: 'Carol will set up Redis caching by next Monday.',
    },
  ],
};
