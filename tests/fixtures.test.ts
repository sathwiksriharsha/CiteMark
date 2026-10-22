import { describe, it, expect } from 'vitest';
import { syntheticSession, syntheticSources, syntheticTurns } from './fixtures/synthetic-conversation';

describe('Synthetic Test Fixtures', () => {
  it('contains valid chronological turns alternating user and assistant', () => {
    expect(syntheticTurns.length).toBeGreaterThan(0);
    syntheticTurns.forEach((turn, idx) => {
      expect(turn.turnNumber).toBe(idx + 1);
      if (idx % 2 === 0) {
        expect(turn.role).toBe('user');
      } else {
        expect(turn.role).toBe('assistant');
      }
    });
  });

  it('contains valid source records with indices', () => {
    expect(syntheticSources.length).toBe(4);
    const indices = syntheticSources.map(s => s.index);
    expect(indices).toEqual([1, 2, 3, 4]);
  });

  it('includes both excerpted sources and un-excerpted fallback sources', () => {
    const withExcerpt = syntheticSources.filter(s => s.excerpt !== undefined);
    const withoutExcerpt = syntheticSources.filter(s => s.excerpt === undefined);
    expect(withExcerpt.length).toBe(3);
    expect(withoutExcerpt.length).toBe(1);
    expect(withoutExcerpt[0]?.title).toBe('Scaling_Laws_for_Neural_Language_Models.pdf');
  });

  it('contains complete session metadata', () => {
    expect(syntheticSession.notebookTitle).toBe('Neural Attention & LLM Architectures Research');
    expect(syntheticSession.isComplete).toBe(true);
    expect(syntheticSession.totalTurnsCount).toBe(syntheticTurns.length);
  });
});
