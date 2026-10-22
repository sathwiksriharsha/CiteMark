import type { NotebookSession, SourceRecord, ConversationTurn, FrontmatterConfig } from '../../types';

/**
 * Converts bracketed citation indices like [1] to GFM footnote markers [^1].
 * Avoids replacing markdown links [text](url).
 */
export function convertCitationMarkersToFootnotes(text: string): string {
  // Replaces [1], [2], [10] with [^1], [^2], [^10]
  // Negative lookahead (?!\() ensures we don't mangle [link text](url)
  // Negative lookbehind (?<!\[) ensures we don't mangle [[wikilinks]]
  return (text || '').replace(/(?<!\[)\[(\d+)\](?!\()/g, '[^$1]');
}

/**
 * Sanitizes markdown content to avoid executing raw scripts while preserving formatting.
 */
export function sanitizeMarkdownText(text: string): string {
  // Strip dangerous executable HTML tags
  return (text || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

import { generateYamlFrontmatter } from './frontmatter';

/**
 * Formats a NotebookSession into clean, GFM-compliant Markdown for Obsidian/Notion.
 */
export function formatToMarkdown(
  session: NotebookSession,
  options?: { frontmatterConfig?: FrontmatterConfig }
): string {
  const lines: string[] = [];

  // 0. Optional YAML Frontmatter for Obsidian
  const frontmatter = options?.frontmatterConfig || session.frontmatterConfig;
  if (frontmatter && frontmatter.enabled) {
    const yaml = generateYamlFrontmatter(session, frontmatter);
    if (yaml) {
      lines.push(yaml);
      lines.push('');
    }
  }

  // 1. Header
  const title = session.notebookTitle?.trim() || 'Gemini Notebook Research Synthesis';
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> **Exported from Gemini Notebook** | Scanned: ${session.scannedAt || new Date().toISOString()} | Total Turns: ${session.totalTurnsCount}`);
  if (!session.isComplete || session.scanCoverage === 'partial') {
    const reason = session.incompleteReason ? ` (Reason: ${session.incompleteReason.replace(/_/g, ' ')})` : '';
    lines.push(`> ⚠️ **Notice: Partial Scan** — Earlier turns could not be verified.${reason}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // 2. Empty check
  if (!session.turns || session.turns.length === 0) {
    lines.push('_No conversation turns recorded in this session._');
    return lines.join('\n');
  }

  // 3. Map sources by index for quick lookup
  const sourceMap = new Map<number, SourceRecord>();
  session.sources.forEach(source => {
    sourceMap.set(source.index, source);
  });

  // Track all referenced citation indices across the document
  const citedIndices = new Set<number>();

  // 4. Conversation turns in authentic chronological sequence
  session.turns.forEach(turn => {
    const isUser = turn.role === 'user';
    const speakerHeader = isUser 
      ? `### 👤 User (Turn ${turn.turnNumber})`
      : `### 🤖 Gemini Notebook (Turn ${turn.turnNumber})`;

    lines.push(speakerHeader);
    lines.push('');

    let turnContent = sanitizeMarkdownText((turn.text || '').trim());

    if (!isUser) {
      // Find all citation numbers in this assistant turn
      const matches = turnContent.matchAll(/(?<!\[)\[(\d+)\](?!\()/g);
      for (const match of matches) {
        const rawIdx = match[1];
        if (rawIdx) {
          const idx = parseInt(rawIdx, 10);
          if (!isNaN(idx)) {
            citedIndices.add(idx);
          }
        }
      }
      turnContent = convertCitationMarkersToFootnotes(turnContent);
    }

    lines.push(turnContent);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  // 5. Footnote Definitions (GFM Syntax: [^1]: content)
  if (citedIndices.size > 0) {
    const sortedIndices = Array.from(citedIndices).sort((a, b) => a - b);
    lines.push('### 📌 Footnotes & Excerpts');
    lines.push('');

    sortedIndices.forEach(index => {
      const source = sourceMap.get(index);
      if (source) {
        if (source.excerpt && source.excerpt.trim().length > 0) {
          const cleanExcerpt = source.excerpt.replace(/\s+/g, ' ').trim();
          lines.push(`[^${index}]: **${source.title}** — *"${cleanExcerpt}"*`);
        } else {
          // Tier-2 fallback without excerpt
          lines.push(`[^${index}]: **${source.title}**`);
        }
      } else {
        // Untracked fallback
        lines.push(`[^${index}]: **Source ${index}**`);
      }
    });

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // 6. Aggregated Bibliography / Sources list
  if (session.sources && session.sources.length > 0) {
    lines.push('## 📚 Sources Cited');
    lines.push('');

    session.sources
      .slice()
      .sort((a, b) => a.index - b.index)
      .forEach(source => {
        const typeStr = source.type ? ` (${source.type.toUpperCase()})` : '';
        lines.push(`${source.index}. **${source.title}**${typeStr}`);
      });
    lines.push('');
  }

  return lines.join('\n');
}
