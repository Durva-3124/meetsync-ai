import type { ActionItemsResponse } from '../aiClient.js';

export const actionItemsFixture: ActionItemsResponse = {
  actionItems: [
    {
      assignee: 'Alice',
      task: 'Scaffold the frontend project',
      dueDate: 'Next Monday',
      source_span: {
        start: 12.4,
        end: 18.7,
        text: 'Alice will scaffold the frontend project by next Monday.',
      },
    },
    {
      assignee: 'Bob',
      task: 'Write integration tests for auth routes',
      dueDate: 'End of week',
      source_span: {
        start: 45.1,
        end: 52.3,
        text: 'Bob, can you write integration tests for the auth routes by end of week?',
      },
    },
    {
      assignee: 'Carol',
      task: 'Set up Redis caching layer',
      dueDate: 'Next Monday',
      source_span: {
        start: 78.9,
        end: 84.2,
        text: 'Carol will set up the Redis caching layer by next Monday.',
      },
    },
  ],
};
