import type { FrontmatterConfig, NotebookSession } from '../../types';

export const DEFAULT_FRONTMATTER_CONFIG: FrontmatterConfig = {
  enabled: true,
  tags: ['gemini-notebook', 'research'],
  includeAliases: true,
  includeDate: true,
  includeUrl: true,
  customFields: {}
};

/**
 * Escapes strings for YAML double-quoted scalar values.
 * Handles backslashes, quotes, newlines, and control characters safely.
 */
export function escapeYamlString(str: string): string {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim();
}

/**
 * Serializes frontmatter configuration into a valid YAML block bounded by `---`.
 */
export function generateYamlFrontmatter(
  session: NotebookSession,
  config: FrontmatterConfig = DEFAULT_FRONTMATTER_CONFIG
): string {
  if (!config.enabled) {
    return '';
  }

  const lines: string[] = ['---'];

  // Title
  const cleanTitle = escapeYamlString(session.notebookTitle || 'Gemini Notebook Research');
  lines.push(`title: "${cleanTitle}"`);

  // Date
  if (config.includeDate) {
    const rawDate = session.scannedAt || new Date().toISOString();
    const dateFormatted = rawDate.split('T')[0] || rawDate;
    lines.push(`date: ${dateFormatted}`);
  }

  // URL
  if (config.includeUrl && session.url) {
    lines.push(`url: "${escapeYamlString(session.url)}"`);
  }

  // Aliases
  if (config.includeAliases) {
    lines.push('aliases:');
    lines.push(`  - "${cleanTitle}"`);
  }

  // Tags
  if (config.tags && config.tags.length > 0) {
    lines.push('tags:');
    config.tags.forEach(t => {
      const cleanTag = t.trim().replace(/^[#\s]+/, '').replace(/[\r\n]+/g, ' ').trim();
      if (!cleanTag) return;
      // If tag is simple slug, output unquoted; if it contains colons, quotes, or special chars, quote safely
      if (/^[a-zA-Z0-9_\-]+$/.test(cleanTag)) {
        lines.push(`  - ${cleanTag}`);
      } else {
        lines.push(`  - "${escapeYamlString(cleanTag)}"`);
      }
    });
  }

  // Quantitative Metadata
  lines.push(`sources_count: ${session.sources?.length || 0}`);
  lines.push(`turns_count: ${session.turns?.length || 0}`);

  // Custom Fields (e.g. status: in-progress)
  if (config.customFields) {
    Object.entries(config.customFields).forEach(([key, val]) => {
      const cleanKey = key.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (cleanKey && val !== undefined) {
        lines.push(`${cleanKey}: "${escapeYamlString(String(val))}"`);
      }
    });
  }

  lines.push('---');
  return lines.join('\n');
}
