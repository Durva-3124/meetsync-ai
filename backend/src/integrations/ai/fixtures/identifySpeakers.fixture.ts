import type { IdentifySpeakersResponse } from '../aiClient.js';

export const identifySpeakersFixture: IdentifySpeakersResponse = {
  speakerMap: {
    SPEAKER_00: { name: 'Alice', email: 'alice@example.com' },
    SPEAKER_01: { name: 'Bob', email: 'bob@example.com' },
    SPEAKER_02: { name: 'Carol', email: 'carol@example.com' },
  },
};
