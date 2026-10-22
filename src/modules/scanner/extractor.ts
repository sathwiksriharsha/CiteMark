import type { NotebookSession, SourceRecord, ConversationTurn, StudioNote } from '../../types';
import type { SafeDiagnosticsTracker } from './diagnostics';

/**
 * Generates a stable deterministic fingerprint for a turn.
 * Uses explicit DOM attributes if present, otherwise creates a hash from role + content.
 */
export function generateTurnFingerprint(
  role: 'user' | 'assistant',
  text: string,
  explicitId?: string | null
): string {
  if (explicitId && explicitId.trim()) {
    return explicitId.trim();
  }

  // Create a stable deterministic hash from role + normalized text snippet + text length
  const cleanSnippet = (text || '')
    .trim()
    .slice(0, 120)
    .replace(/\s+/g, ' ');
  const len = (text || '').trim().length;

  let hash = 0;
  const str = `${role}::${len}::${cleanSnippet}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return `turn-fp-${Math.abs(hash).toString(36)}`;
}

/**
 * Extracts the notebook title from the DOM.
 * Handles inputs (using .value), headings, and document.title.
 */
export function extractNotebookTitle(doc: Document): string {
  // Strategy 1: Explicit title input or heading in NotebookLM
  const titleEl = doc.querySelector<HTMLElement>(
    'input.notebook-title, input[aria-label*="title" i], [aria-label="Notebook title"], [role="heading"][aria-level="1"], .notebook-title, [class*="notebook-name"]'
  );
  if (titleEl) {
    if ('value' in titleEl && typeof (titleEl as HTMLInputElement).value === 'string' && (titleEl as HTMLInputElement).value.trim()) {
      return (titleEl as HTMLInputElement).value.trim();
    }
    if (titleEl.textContent?.trim()) {
      return titleEl.textContent.trim();
    }
  }

  // Strategy 2: Document title tag
  if (doc.title) {
    const cleanTitle = doc.title
      .replace(/\s*[-|&]\s*Gemini Notebook\s*$/i, '')
      .replace(/\s*[-|&]\s*NotebookLM\s*$/i, '')
      .trim();
    if (cleanTitle) {
      return cleanTitle;
    }
  }

  return 'Untitled Gemini Notebook';
}

/**
 * Extracts uploaded source document records from the Sources panel.
 */
export function extractSources(doc: Document): SourceRecord[] {
  const sources: SourceRecord[] = [];

  // Look for source card containers in the left panel / shelf
  const rawCards = Array.from(doc.querySelectorAll<HTMLElement>(
    'source-library-item, artifact-library-note, .source-item, .source-card, [data-source-index], aside[role="region"] [role="listitem"], .source-chip, [data-source-id], aside [role="button"][aria-label*="source" i], [class*="source-item"], [class*="source-card"]'
  ));

  // Discard nested container matches
  const sourceCards = rawCards.filter(el => {
    return !rawCards.some(other => other !== el && other.contains(el));
  });

  if (sourceCards.length > 0) {
    sourceCards.forEach((card, idx) => {
      const indexAttr = card.getAttribute('data-source-index');
      const parsedIndex = indexAttr ? parseInt(indexAttr, 10) : idx + 1;
      const index = !isNaN(parsedIndex) ? parsedIndex : idx + 1;

      const titleEl = card.querySelector<HTMLElement>('.source-title, [class*="source-title"], [class*="title"], [role="heading"], .name');
      const title = titleEl?.textContent?.trim() || card.textContent?.trim() || `Source ${index}`;

      const typeEl = card.querySelector<HTMLElement>('.source-type, [class*="type"], .chip');
      const typeStr = typeEl?.textContent?.trim().toLowerCase() || title.toLowerCase();
      let type: SourceRecord['type'] = 'unknown';
      if (typeStr.includes('pdf')) type = 'pdf';
      else if (typeStr.includes('doc')) type = 'doc';
      else if (typeStr.includes('web')) type = 'web';
      else if (typeStr.includes('text') || typeStr.includes('txt')) type = 'text';

      sources.push({
        index,
        title,
        type
      });
    });
  }

  return sources;
}

/**
 * Extracts citations referenced inside an assistant message node.
 */
function extractCitationsFromNode(node: HTMLElement, text: string): number[] {
  const citationIndices: number[] = [];

  // 1. From NotebookLM citation chips / marker buttons
  const chipEls = node.querySelectorAll<HTMLElement>(
    'button.citation-marker, .citation-marker, sup.citation-marker, [class*="citation-marker"], .citation-chip, [data-citation-index], [class*="citation"], button[aria-label*="citation" i]'
  );

  chipEls.forEach(chip => {
    const idxAttr = chip.getAttribute('data-citation-index');
    const raw = idxAttr || chip.textContent?.trim() || '';
    const num = parseInt(raw.replace(/[^\d]/g, ''), 10);
    if (!isNaN(num) && !citationIndices.includes(num)) {
      citationIndices.push(num);
    }
  });

  // 2. From text matches [1], [2] if not caught in chips
  const textMatches = (text || '').matchAll(/(?<!\[)\[(\d+)\](?!\()/g);
  for (const match of textMatches) {
    const rawNum = match[1];
    if (rawNum) {
      const num = parseInt(rawNum, 10);
      if (!isNaN(num) && !citationIndices.includes(num)) {
        citationIndices.push(num);
      }
    }
  }

  return citationIndices.sort((a, b) => a - b);
}

/**
 * Extracts conversational turns from the main message viewport.
 * Supports both real NotebookLM chat-message-pair layout and individual row fallbacks.
 */
export function extractTurns(doc: Document): ConversationTurn[] {
  const turns: ConversationTurn[] = [];

  // Strategy 1: Real NotebookLM Chat Message Pairs (div.chat-message-pair)
  const chatPairs = doc.querySelectorAll<HTMLElement>('div.chat-message-pair, .chat-message-pair');
  if (chatPairs.length > 0) {
    let turnCount = 0;
    chatPairs.forEach((pair, pairIdx) => {
      // 1. User Turn inside pair
      const userContainer = pair.querySelector<HTMLElement>(
        '.from-user-container, [class*="from-user"], .user-message, [data-role="user"]'
      );
      if (userContainer) {
        const textEl = userContainer.querySelector<HTMLElement>('.message-text-content, .text-body, p') || userContainer;
        const text = textEl.textContent?.trim() || '';
        if (text) {
          turnCount++;
          turns.push({
            id: generateTurnFingerprint('user', text, userContainer.id || `pair-${pairIdx}-user`),
            turnNumber: turnCount,
            role: 'user',
            text,
            citationIndices: []
          });
        }
      }

      // 2. Assistant Turn inside pair
      const aiContainer = pair.querySelector<HTMLElement>(
        '.to-user-container, [class*="to-user"], .assistant-message, [data-role="assistant"]'
      );
      if (aiContainer) {
        const textEl = aiContainer.querySelector<HTMLElement>('.message-text-content, .text-body') || aiContainer;
        const text = textEl.textContent?.trim() || '';
        if (text) {
          turnCount++;
          const citationIndices = extractCitationsFromNode(aiContainer, text);
          turns.push({
            id: generateTurnFingerprint('assistant', text, aiContainer.id || `pair-${pairIdx}-ai`),
            turnNumber: turnCount,
            role: 'assistant',
            text,
            citationIndices
          });
        }
      }
    });

    if (turns.length > 0) {
      return turns;
    }
  }

  // Strategy 2: Individual message row elements across semantic and structural fallbacks
  const rawElements = Array.from(doc.querySelectorAll<HTMLElement>(
    'chat-message, .individual-message, .message-row, [role="region"][aria-label*="message" i], [role="region"][aria-label*="response" i], .chat-turn, .chat-message, [data-message-author], [data-turn-id], [data-message-id], .query-container, .response-container, mat-card.chat-bubble, div[class*="message-content"], .from-user-container, .to-user-container'
  ));

  // Filter out elements that are ancestors or descendants of another matched element to prevent duplication
  const messageRows = rawElements.filter(el => {
    return !rawElements.some(other => other !== el && other.contains(el));
  });

  messageRows.forEach((row, index) => {
    const explicitId = row.getAttribute('data-turn-id') || row.getAttribute('data-message-id') || row.id;

    // Determine role (User vs Assistant)
    const isUserClass = row.classList.contains('user') || 
      row.classList.contains('query') || 
      row.classList.contains('user-query') ||
      row.classList.contains('from-user-container') ||
      row.className.includes('from-user');
    const ariaLabel = row.getAttribute('aria-label')?.toLowerCase() || '';
    const authorAttr = row.getAttribute('data-message-author')?.toLowerCase() || '';
    const isUserLabel = ariaLabel.includes('user') || ariaLabel.includes('query') || authorAttr === 'user';

    const role: 'user' | 'assistant' = (isUserClass || isUserLabel) ? 'user' : 'assistant';

    // Extract text content
    const contentEl = row.querySelector<HTMLElement>('.message-text-content, .message-content, [class*="content"], .model-response-text, .user-query-text') || row;
    const text = contentEl.textContent?.trim() || '';

    // Generate stable turn ID
    const turnId = generateTurnFingerprint(role, text, explicitId);

    // Extract citation numbers
    const citationIndices = role === 'assistant' ? extractCitationsFromNode(row, text) : [];

    turns.push({
      id: turnId,
      turnNumber: index + 1,
      role,
      text,
      citationIndices
    });
  });

  return turns;
}

/**
 * Extracts Studio notes from the Studio / Artifacts panel.
 */
export function extractStudioNotes(doc: Document): StudioNote[] {
  const notes: StudioNote[] = [];
  const rawElements = Array.from(doc.querySelectorAll<HTMLElement>(
    'artifact-library-note, artifact-library-item, .studio-panel .artifact-item, [class*="artifact-stretched-button"]'
  ));

  const noteEls = rawElements.filter(el => {
    return !rawElements.some(other => other !== el && other.contains(el));
  });

  noteEls.forEach((el, idx) => {
    const titleEl = el.querySelector<HTMLElement>('.artifact-title, [class*="title"], h3, h4, .name') || el;
    const title = titleEl.textContent?.trim() || `Studio Note ${idx + 1}`;
    const id = el.getAttribute('data-artifact-id') || `studio-note-${idx + 1}`;

    // Skip non-text audio overview items
    if (title.toLowerCase().includes('audio overview') || title.toLowerCase().includes('deep dive')) {
      return;
    }

    notes.push({
      id,
      title,
      type: 'note'
    });
  });

  return notes;
}

/**
 * Extracts a complete NotebookSession from the provided DOM document.
 */
export function extractSessionFromDOM(
  doc: Document,
  diagnosticsTracker?: SafeDiagnosticsTracker
): NotebookSession {
  const notebookTitle = extractNotebookTitle(doc);
  const sources = extractSources(doc);
  const turns = extractTurns(doc);
  const studioNotes = extractStudioNotes(doc);

  const totalCitations = turns.reduce((acc, t) => acc + t.citationIndices.length, 0);

  if (diagnosticsTracker) {
    diagnosticsTracker.recordEvent('DOM_SNAPSHOT_EXTRACTED', {
      turnsCount: turns.length,
      sourcesCount: sources.length,
      citationsCount: totalCitations,
      studioNotesCount: studioNotes.length
    });
  }

  return {
    notebookTitle,
    url: doc.location?.href || 'https://notebook.google.com',
    scannedAt: new Date().toISOString(),
    sources,
    turns,
    studioNotes,
    isComplete: true, // Baseline for snapshot; reconciliation can downgrade to false
    scanCoverage: 'complete',
    totalTurnsCount: turns.length
  };
}
