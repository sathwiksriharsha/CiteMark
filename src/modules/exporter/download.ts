/**
 * Download Exporter Utilities
 * Handles filename sanitization, MIME types, and triggering local browser downloads.
 */

const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Returns the MIME type corresponding to the export format.
 */
export function getMimeType(format: 'md' | 'html'): string {
  return format === 'md' ? 'text/markdown;charset=utf-8' : 'text/html;charset=utf-8';
}

/**
 * Sanitizes a title into a safe, valid filesystem filename with a date token.
 * Disarms path traversal, Windows reserved names, control characters, and illegal punctuation.
 */
export function sanitizeFilename(rawTitle: string, format: 'md' | 'html', dateInput?: Date): string {
  const date = dateInput || new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // 1. Normalize unicode and remove null bytes / control characters
  let clean = (rawTitle || '')
    .normalize('NFKC')
    .replace(/[\x00-\x1f\x7f]/g, '')
    // 2. Disarm path traversal attempts
    .replace(/\.{2,}/g, '')
    // 3. Strip illegal filesystem characters: < > : " / \ | ? *
    .replace(/[<>:"/\\|?*]/g, '')
    // 4. Replace whitespace and underscores with a single underscore
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    // 5. Strip leading and trailing periods, spaces, and underscores
    .replace(/^[.\s_]+|[.\s_]+$/g, '')
    .trim();

  // 6. Check for empty or Windows reserved names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  if (!clean || clean.length === 0) {
    clean = 'Gemini_Notebook_Research';
  } else if (WINDOWS_RESERVED_NAMES.test(clean)) {
    clean = `Note_${clean}`;
  }

  // 7. Truncate to reasonable max length (80 chars) to prevent MAX_PATH overflow
  if (clean.length > 80) {
    clean = clean.substring(0, 80).replace(/^[.\s_]+|[.\s_]+$/g, '');
  }

  return `${clean}_${dateStr}.${format}`;
}

/**
 * Triggers a client-side file download via standard Blob URL and anchor click.
 * Operates without requiring elevated 'downloads' permissions.
 */
export function triggerFileDownload(content: string, filename: string, format: 'md' | 'html'): void {
  const mimeType = getMimeType(format);
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke object URL after a short timeout to prevent memory leak
  setTimeout(() => {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Ignore in mocked environments
    }
  }, 10000);
}
