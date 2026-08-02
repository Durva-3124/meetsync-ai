import type { TranscribeResponse } from '../aiClient.js';

export const transcribeFixture: TranscribeResponse = {
  transcript: [
    { speaker: 'SPEAKER_00', start: 0.0, end: 4.5, text: 'Welcome to the sprint review.' },
    { speaker: 'SPEAKER_01', start: 4.6, end: 9.2, text: 'Thanks everyone for joining today.' },
    { speaker: 'SPEAKER_00', start: 9.3, end: 15.1, text: "Let's go through what we completed this week." },
    { speaker: 'SPEAKER_02', start: 15.2, end: 22.0, text: 'I finished the auth module and the meeting schema.' },
  ],
};
