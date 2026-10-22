import type { ConversationTurn } from '../../types';

export interface CompletenessVerificationResult {
  isComplete: boolean;
  coverage: 'complete' | 'partial' | 'uncertain';
  reason?: string;
}

/**
 * Reconciles and deduplicates conversation turns collected across progressive top-to-bottom scroll passes.
 * Preserves top-to-bottom chronological sequence and updates citations if newer passes contain more detail.
 */
export function reconcileTurnList(
  existingTurns: ConversationTurn[],
  newTurns: ConversationTurn[]
): ConversationTurn[] {
  const turnMap = new Map<string, ConversationTurn>();

  // Add existing turns in top-to-bottom order
  for (const turn of existingTurns) {
    turnMap.set(turn.id, { ...turn });
  }

  // Merge new turns (appends new turns or enriches existing turns with citations)
  for (const turn of newTurns) {
    if (!turnMap.has(turn.id)) {
      turnMap.set(turn.id, { ...turn });
    } else {
      // If already present, merge citations if new turn has additional citations
      const existing = turnMap.get(turn.id)!;
      if (turn.citationIndices && turn.citationIndices.length > 0) {
        const mergedCitations = Array.from(
          new Set([...existing.citationIndices, ...turn.citationIndices])
        ).sort((a, b) => a - b);
        existing.citationIndices = mergedCitations;
      }
      // If new text is longer/more complete (e.g. hydrated late)
      if (turn.text && turn.text.length > existing.text.length) {
        existing.text = turn.text;
      }
    }
  }

  // Re-index sequentially 1..N based on top-to-bottom order
  const list = Array.from(turnMap.values());
  return list.map((turn, index) => ({
    ...turn,
    turnNumber: index + 1
  }));
}

/**
 * Verifies the completeness invariant for extracted conversation turns.
 * Assesses whether the scan verified all boundaries (top, bottom, scroll continuity).
 */
export function verifyCompleteness(
  turns: ConversationTurn[],
  context?: {
    containerScrollable?: boolean;
    scrollReachedTop?: boolean;
    scrollReachedBottom?: boolean;
    timedOut?: boolean;
    errorEncountered?: boolean;
  }
): CompletenessVerificationResult {
  if (!turns || turns.length === 0) {
    return {
      isComplete: false,
      coverage: 'uncertain',
      reason: 'no_turns_detected'
    };
  }

  if (context?.errorEncountered) {
    return {
      isComplete: false,
      coverage: 'partial',
      reason: 'scanner_exception_occurred'
    };
  }

  if (context?.timedOut) {
    return {
      isComplete: false,
      coverage: 'partial',
      reason: 'scroll_traversal_timed_out'
    };
  }

  // If container was scrollable, check if both top and bottom boundaries were reached
  if (context?.containerScrollable) {
    if (context.scrollReachedTop === false) {
      return {
        isComplete: false,
        coverage: 'partial',
        reason: 'top_boundary_unreached_earlier_turns_may_be_missing'
      };
    }
    if (context.scrollReachedBottom === false) {
      return {
        isComplete: false,
        coverage: 'partial',
        reason: 'bottom_boundary_unreached_later_turns_may_be_missing'
      };
    }
  }

  // All invariants passed
  return {
    isComplete: true,
    coverage: 'complete'
  };
}
