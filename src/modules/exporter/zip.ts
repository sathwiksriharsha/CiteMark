import { zipSync, strToU8 } from 'fflate';
import type { NotebookSession } from '../../types';
import { formatToMarkdown } from '../converters/markdown';
import { formatToPrintHtml } from '../converters/html';
import { sanitizeFilename } from './download';

/**
 * Formats a clean Sources Bibliography markdown document.
 */
export function formatSourcesMarkdown(session: NotebookSession): string {
  const lines: string[] = [];
  lines.push(`# Sources Bibliography & References`);
  lines.push('');
  lines.push(`> **Notebook:** ${session.notebookTitle || 'Gemini Notebook'}`);
  lines.push(`> **Exported:** ${session.scannedAt || new Date().toISOString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (!session.sources || session.sources.length === 0) {
    lines.push('_No uploaded source records found in this notebook._');
    return lines.join('\n');
  }

  session.sources
    .slice()
    .sort((a, b) => a.index - b.index)
    .forEach(source => {
      lines.push(`### [${source.index}] ${source.title}`);
      lines.push(`- **Type:** ${source.type ? source.type.toUpperCase() : 'DOCUMENT'}`);
      if (source.excerpt) {
        lines.push(`- **Key Excerpt:**`);
        lines.push(`  > "${source.excerpt.trim()}"`);
      }
      lines.push('');
    });

  return lines.join('\n');
}

/**
 * Builds a multi-artifact ZIP archive containing the conversation, print HTML, sources, and Studio notes.
 */
export function buildResearchZipArchive(session: NotebookSession): Uint8Array {
  const zipTree: Record<string, Uint8Array> = {};

  // 1. Full Conversation Markdown
  const mdContent = formatToMarkdown(session);
  zipTree['Conversation.md'] = strToU8(mdContent);

  // 2. Print-Ready HTML Document
  const htmlContent = formatToPrintHtml(session);
  zipTree['Conversation.html'] = strToU8(htmlContent);

  // 3. Dedicated Sources & References Index
  const sourcesContent = formatSourcesMarkdown(session);
  zipTree['Sources_Bibliography.md'] = strToU8(sourcesContent);

  // 4. Studio Notes Directory: only include genuine notes with valid titles and non-empty content
  if (session.studioNotes && session.studioNotes.length > 0) {
    const usedFilenames = new Set<string>();

    session.studioNotes.forEach((note, index) => {
      const rawTitle = (note.title || '').trim();
      const rawContent = (note.content || '').trim();

      // STRICT INTEGRITY: Discard notes with empty title or empty content (no empty or fabricated notes)
      if (!rawTitle || !rawContent) {
        return;
      }

      // Sanitize filename strictly against directory traversal (..), forbidden characters, and path separators
      const sanitizedBase = rawTitle
        .replace(/[\0\r\n]/g, '')
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\.{2,}/g, '_') // Disarm directory traversal (..)
        .replace(/\s+/g, '_') // Normalize spaces to underscores
        .replace(/^[\s._]+|[\s._]+$/g, '')
        .slice(0, 80) || `Studio_Note_${index + 1}`;

      let filename = `${sanitizedBase}.md`;
      let counter = 1;
      while (usedFilenames.has(filename)) {
        counter++;
        filename = `${sanitizedBase}_${counter}.md`;
      }
      usedFilenames.add(filename);

      const noteMd = `# ${rawTitle}\n\n${rawContent}\n`;
      zipTree[`Studio_Notes/${filename}`] = strToU8(noteMd);
    });
  }

  // Synchronously compress files
  return zipSync(zipTree, { level: 6 });
}

/**
 * Triggers client-side download of the bundled ZIP archive.
 */
export function triggerZipDownload(session: NotebookSession): string {
  const zipBuffer = buildResearchZipArchive(session);
  const rawBase = sanitizeFilename(session.notebookTitle, 'html').replace(/\.html$/, '');
  const zipFilename = `${rawBase}_Archive.zip`;

  const blob = new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = zipFilename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  return zipFilename;
}
