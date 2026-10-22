import { describe, it, expect } from 'vitest';
import { filterTurns, getActiveCitationIndices } from '../src/modules/scanner/filter';
import type { ConversationTurn } from '../src/types';

describe('Selective Turn Filter (filterTurns & getActiveCitationIndices)', () => {
  const sampleTurns: ConversationTurn[] = [
    { id: 't-1', turnNumber: 1, role: 'user', text: 'Prompt 1', citationIndices: [] },
    { id: 't-2', turnNumber: 2, role: 'assistant', text: 'Answer 1 with cite [1]', citationIndices: [1] },
    { id: 't-3', turnNumber: 3, role: 'user', text: 'Irrelevant chit-chat', citationIndices: [] },
    { id: 't-4', turnNumber: 4, role: 'assistant', text: 'Chit-chat response', citationIndices: [] },
    { id: 't-5', turnNumber: 5, role: 'user', text: 'Core question 2', citationIndices: [] },
    { id: 't-6', turnNumber: 6, role: 'assistant', text: 'Deep answer with cite [2, 3]', citationIndices: [2, 3] }
  ];

  it('filters out deselected turns and re-indexes remaining turns sequentially 1..M', () => {
    // Keep only turns 1, 2, 5, 6 (prune turns 3 and 4)
    const selected = new Set(['t-1', 't-2', 't-5', 't-6']);
    const filtered = filterTurns(sampleTurns, selected);

    expect(filtered.length).toBe(4);
    expect(filtered.map(t => t.id)).toEqual(['t-1', 't-2', 't-5', 't-6']);
    expect(filtered.map(t => t.turnNumber)).toEqual([1, 2, 3, 4]); // Seamless numbering!
    expect(filtered[2]?.text).toBe('Core question 2');
    expect(filtered[2]?.turnNumber).toBe(3);
  });

  it('returns empty array if no turns are selected', () => {
    const filtered = filterTurns(sampleTurns, new Set());
    expect(filtered).toEqual([]);
  });

  it('computes active citation indices across filtered turns', () => {
    // Only keep t-1 and t-2 (only citation 1 is active)
    const filtered = filterTurns(sampleTurns, ['t-1', 't-2']);
    const activeCitations = getActiveCitationIndices(filtered);
    expect(activeCitations).toEqual([1]);
  });

  it('returns all citations when all assistant turns are kept', () => {
    const activeCitations = getActiveCitationIndices(sampleTurns);
    expect(activeCitations).toEqual([1, 2, 3]);
  });

  it('guarantees selective turn filtering NEVER corrupts source indices or citation-to-source mappings', () => {
    // Turn 2 cites Source 1 ([1]), Turn 6 cites Source 2 and 3 ([2, 3])
    // If we deselect Turn 1 and Turn 2 (which cited Source 1)
    const filtered = filterTurns(sampleTurns, ['t-5', 't-6']);
    
    expect(filtered.length).toBe(2);
    // User prompt is re-indexed to Turn 1
    expect(filtered[0]?.turnNumber).toBe(1);
    expect(filtered[0]?.id).toBe('t-5');
    
    // Assistant response is re-indexed to Turn 2
    expect(filtered[1]?.turnNumber).toBe(2);
    expect(filtered[1]?.id).toBe('t-6');
    
    // CRITICAL: The citation numbers must remain EXACTLY [2, 3] pointing to Source 2 & 3!
    // They must NEVER be shifted to [1, 2], which would corrupt attribution to the wrong paper.
    expect(filtered[1]?.citationIndices).toEqual([2, 3]);

    // Active citations across the filtered subset must only report [2, 3]
    const activeCitations = getActiveCitationIndices(filtered);
    expect(activeCitations).toEqual([2, 3]);
    expect(activeCitations).not.toContain(1);
  });
});
