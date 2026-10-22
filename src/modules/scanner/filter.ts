import type { ConversationTurn } from '../../types';

/**
 * Filters a list of turns based on selected IDs and re-indexes remaining turns sequentially.
 * Preserves authentic chronological reading order.
 */
export function filterTurns(
  turns: ConversationTurn[],
  selectedIds: Set<string> | string[]
): ConversationTurn[] {
  if (!turns || turns.length === 0) {
    return [];
  }

  const idSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);

  // If no IDs selected, return empty
  if (idSet.size === 0) {
    return [];
  }

  // Filter while keeping original chronological order
  const kept = turns.filter(t => idSet.has(t.id));

  // Re-index sequentially from 1 to M
  return kept.map((t, index) => ({
    ...t,
    turnNumber: index + 1
  }));
}

/**
 * Computes all referenced citation numbers across an array of turns.
 */
export function getActiveCitationIndices(turns: ConversationTurn[]): number[] {
  const set = new Set<number>();
  turns.forEach(t => {
    if (t.citationIndices) {
      t.citationIndices.forEach(idx => set.add(idx));
    }
  });
  return Array.from(set).sort((a, b) => a - b);
}
