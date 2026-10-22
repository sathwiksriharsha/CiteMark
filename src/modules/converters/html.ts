import type { NotebookSession, SourceRecord, ConversationTurn } from '../../types';

/**
 * Escapes unsafe characters for HTML text insertion.
 */
export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/\0/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts inline bracketed citation markers [1] to interactive HTML anchor chips.
 */
export function renderCitationChipsHtml(escapedText: string): string {
  return escapedText.replace(/(?<!\[)\[(\d+)\](?!\()/g, (_match, p1) => {
    return `<sup class="citation-chip"><a href="#fn-${p1}" id="ref-${p1}" title="Jump to Source ${p1} attribution">[${p1}]</a></sup>`;
  });
}

/**
 * Formats a raw turn body into basic safe paragraphs and code blocks.
 */
export function formatTurnBodyHtml(rawText: string, isAssistant: boolean): string {
  // First, safely escape all HTML tags
  const escaped = escapeHtml((rawText || '').trim());

  // Handle citation chips if assistant
  const withChips = isAssistant ? renderCitationChipsHtml(escaped) : escaped;

  // Split by double newlines into paragraphs
  const paragraphs = withChips.split(/\n{2,}/);

  return paragraphs
    .map(p => {
      // If paragraph contains code block
      if (p.startsWith('```')) {
        const clean = p.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
        return `<pre><code>${clean}</code></pre>`;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

/**
 * Formats a NotebookSession into a standalone, publication-ready HTML/Print-to-PDF document.
 */
export function formatToPrintHtml(session: NotebookSession): string {
  const title = session.notebookTitle?.trim() || 'Gemini Notebook Research Synthesis';
  const escapedTitle = escapeHtml(title);
  const scannedDate = session.scannedAt ? new Date(session.scannedAt).toLocaleDateString() : new Date().toLocaleDateString();

  const sourceMap = new Map<number, SourceRecord>();
  session.sources.forEach(s => sourceMap.set(s.index, s));
  const citedIndices = new Set<number>();

  // Turn blocks
  let turnsHtml = '';
  if (!session.turns || session.turns.length === 0) {
    turnsHtml = '<div class="empty-state"><p><em>No conversation turns recorded in this session.</em></p></div>';
  } else {
    turnsHtml = session.turns
      .map(turn => {
        const isUser = turn.role === 'user';
        const roleLabel = isUser ? `User (Turn ${turn.turnNumber})` : `Gemini Notebook (Turn ${turn.turnNumber})`;
        const badgeClass = isUser ? 'badge-user' : 'badge-assistant';

        if (!isUser) {
          const matches = (turn.text || '').matchAll(/(?<!\[)\[(\d+)\](?!\()/g);
          for (const match of matches) {
            const rawIdx = match[1];
            if (rawIdx) {
              const idx = parseInt(rawIdx, 10);
              if (!isNaN(idx)) citedIndices.add(idx);
            }
          }
        }

        const bodyHtml = formatTurnBodyHtml(turn.text || '', !isUser);

        return `
    <article class="turn-card ${turn.role}">
      <header class="turn-header">
        <span class="role-badge ${badgeClass}">${roleLabel}</span>
      </header>
      <div class="turn-body">
        ${bodyHtml}
      </div>
    </article>`;
      })
      .join('\n');
  }

  // Footnotes block
  let footnotesHtml = '';
  if (citedIndices.size > 0) {
    const sortedIndices = Array.from(citedIndices).sort((a, b) => a - b);
    const items = sortedIndices
      .map(idx => {
        const source = sourceMap.get(idx);
        const title = source ? escapeHtml(source.title) : `Source ${idx}`;
        const excerpt = source?.excerpt ? `<blockquote class="fn-quote">&ldquo;${escapeHtml(source.excerpt.trim())}&rdquo;</blockquote>` : '';
        return `
      <li id="fn-${idx}" class="footnote-item">
        <span class="fn-title"><strong>${title}</strong></span>
        ${excerpt}
        <a href="#ref-${idx}" class="back-ref" title="Back to text">&uarr; return to conversation</a>
      </li>`;
      })
      .join('\n');

    footnotesHtml = `
    <section class="footnotes-section">
      <h3>📌 Footnotes &amp; Source Excerpts</h3>
      <ol class="footnotes-list">
        ${items}
      </ol>
    </section>`;
  }

  // Sources inventory block
  let sourcesListHtml = '';
  if (session.sources && session.sources.length > 0) {
    const items = session.sources
      .slice()
      .sort((a, b) => a.index - b.index)
      .map(s => `<li><strong>${escapeHtml(s.title)}</strong> ${s.type ? `(${escapeHtml(s.type.toUpperCase())})` : ''}</li>`)
      .join('\n');

    sourcesListHtml = `
    <section class="sources-section">
      <h3>📚 Sources Available in Notebook</h3>
      <ol class="sources-list">
        ${items}
      </ol>
    </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle} &mdash; Research Synthesis</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #1f2937;
      --text-muted: #4b5563;
      --border: #e5e7eb;
      --accent: #2563eb;
      --user-bg: #f8fafc;
      --assistant-bg: #ffffff;
    }

    * { box-sizing: border-box; }
    body {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      line-height: 1.65;
      color: var(--text);
      background: var(--bg);
      margin: 0;
      padding: 2rem 1rem;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header.doc-header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      line-height: 1.25;
      margin: 0 0 0.5rem 0;
      color: #111827;
    }

    .meta-bar {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .action-bar {
      margin: 1rem 0;
    }

    .btn-print {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--accent);
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .turn-card {
      margin-bottom: 1.75rem;
      padding: 1.25rem 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      page-break-inside: avoid;
    }

    .turn-card.user {
      background: var(--user-bg);
      border-color: #cbd5e1;
    }

    .turn-card.assistant {
      background: var(--assistant-bg);
      border-left: 3px solid var(--accent);
    }

    .turn-header {
      margin-bottom: 0.75rem;
    }

    .role-badge {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .badge-user {
      background: #e2e8f0;
      color: #334155;
    }

    .badge-assistant {
      background: #dbeafe;
      color: #1e40af;
    }

    .turn-body p {
      margin: 0 0 0.85rem 0;
    }
    .turn-body p:last-child {
      margin-bottom: 0;
    }

    pre {
      font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
      background: #f1f5f9;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.875rem;
    }

    .citation-chip a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      padding: 0 0.15rem;
    }

    .footnotes-section, .sources-section {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 2px solid var(--border);
      page-break-before: auto;
    }

    .footnote-item {
      margin-bottom: 1rem;
      padding-left: 0.5rem;
    }

    .fn-quote {
      margin: 0.35rem 0;
      padding-left: 0.75rem;
      border-left: 2px solid #cbd5e1;
      color: var(--text-muted);
      font-size: 0.925rem;
    }

    .back-ref {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.75rem;
      color: var(--accent);
      text-decoration: none;
    }

    .partial-scan-alert {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      margin: 1rem 0;
      font-size: 0.875rem;
      color: #92400e;
    }
    .partial-scan-alert p {
      margin: 0.25rem 0 0 0;
      color: #78350f;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .turn-card { border: none; border-bottom: 1px solid #ccc; padding: 1rem 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="doc-header">
      <h1>${escapedTitle}</h1>
      <div class="meta-bar">
        <span>Gemini Notebook Research Synthesis</span>
        <span>Scanned: ${scannedDate} &bull; ${session.totalTurnsCount} Turns</span>
      </div>
      ${(!session.isComplete || session.scanCoverage === 'partial') ? `
      <div class="partial-scan-alert">
        <strong>⚠️ Notice: Partial Conversation Scan</strong>
        <p>This document contains ${session.totalTurnsCount} turns captured from the visible viewport. Earlier turns could not be verified by the scanner.${session.incompleteReason ? ` (Reason: ${escapeHtml(session.incompleteReason.replace(/_/g, ' '))})` : ''}</p>
      </div>` : ''}
      <div class="action-bar no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>
    </header>

    <main class="conversation-stream">
      ${turnsHtml}
    </main>

    ${footnotesHtml}
    ${sourcesListHtml}
  </div>
</body>
</html>`;
}
