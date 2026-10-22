import { describe, it, expect } from 'vitest';
import { sanitizeFilename, getMimeType } from '../src/modules/exporter/download';

describe('Download Exporter Utility (sanitizeFilename)', () => {
  it('sanitizes illegal characters from notebook title', () => {
    const rawTitle = 'What is Quantum Computing? / An Overview: Part 1 * <Draft>';
    const filename = sanitizeFilename(rawTitle, 'md', new Date('2026-10-20T12:00:00Z'));
    expect(filename).not.toMatch(/[<>:"/\\|?*]/);
    expect(filename).toContain('2026-10-20.md');
    expect(filename).toContain('What_is_Quantum_Computing');
  });

  it('handles empty or whitespace-only titles with fallback', () => {
    const filename = sanitizeFilename('   ', 'html', new Date('2026-10-20T12:00:00Z'));
    expect(filename).toContain('Gemini_Notebook_Research_2026-10-20.html');
  });

  it('disarms Windows reserved device filenames like CON, PRN, AUX, NUL', () => {
    const conFilename = sanitizeFilename('CON', 'md', new Date('2026-10-20T12:00:00Z'));
    expect(conFilename).toBe('Note_CON_2026-10-20.md');

    const auxFilename = sanitizeFilename('aux', 'html', new Date('2026-10-20T12:00:00Z'));
    expect(auxFilename).toBe('Note_aux_2026-10-20.html');

    const com1Filename = sanitizeFilename('COM1', 'md', new Date('2026-10-20T12:00:00Z'));
    expect(com1Filename).toBe('Note_COM1_2026-10-20.md');
  });

  it('disarms path traversal and control characters', () => {
    const traversal = sanitizeFilename('../../../etc/passwd\0', 'md', new Date('2026-10-20T12:00:00Z'));
    expect(traversal).not.toContain('..');
    expect(traversal).not.toContain('\0');
    expect(traversal).toContain('etcpasswd_2026-10-20.md');
  });

  it('truncates excessively long titles to protect MAX_PATH', () => {
    const longTitle = 'A'.repeat(200);
    const filename = sanitizeFilename(longTitle, 'md', new Date('2026-10-20T12:00:00Z'));
    expect(filename.length).toBeLessThanOrEqual(100);
    expect(filename.endsWith('_2026-10-20.md')).toBe(true);
  });

  it('provides correct MIME types for Markdown and HTML', () => {
    expect(getMimeType('md')).toBe('text/markdown;charset=utf-8');
    expect(getMimeType('html')).toBe('text/html;charset=utf-8');
  });
});
