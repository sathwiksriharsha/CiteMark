import { describe, it, expect } from 'vitest';
import { formatToPrintHtml, escapeHtml } from '../src/modules/converters/html';
import { syntheticSession } from './fixtures/synthetic-conversation';
import type { NotebookSession } from '../src/types';

describe('Print-Ready HTML Generator (formatToPrintHtml)', () => {
  it('generates a complete valid HTML5 document with title and meta tags', () => {
    const html = formatToPrintHtml(syntheticSession);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Neural Attention &amp; LLM Architectures Research &mdash; Research Synthesis</title>');
    expect(html).toContain('<meta charset="utf-8">');
  });

  it('embeds print-friendly stylesheets with media print rules', () => {
    const html = formatToPrintHtml(syntheticSession);
    expect(html).toContain('@media print');
    expect(html).toContain('window.print()');
  });

  it('renders all conversation turns with distinct role badges and turn numbers', () => {
    const html = formatToPrintHtml(syntheticSession);
    expect(html).toContain('User (Turn 1)');
    expect(html).toContain('Gemini Notebook (Turn 2)');
    expect(html).toContain('User (Turn 3)');
    expect(html).toContain('Gemini Notebook (Turn 4)');
  });

  it('converts citation markers to interactive footnote anchor links', () => {
    const html = formatToPrintHtml(syntheticSession);
    // Should have links pointing to #fn-1, #fn-2, etc.
    expect(html).toContain('href="#fn-1"');
    expect(html).toContain('id="fn-1"');
    expect(html).toContain('Attention_Is_All_You_Need.pdf');
  });

  it('escapes untrusted user and assistant text to prevent XSS', () => {
    const dangerousSession: NotebookSession = {
      notebookTitle: '<script>alert(1)</script>Title',
      url: 'https://notebook.google.com/test',
      scannedAt: '2026-10-20T12:00:00.000Z',
      sources: [],
      turns: [
        {
          id: 'turn-evil',
          turnNumber: 1,
          role: 'user',
          text: '<img src=x onerror=alert(1)> What is this?',
          citationIndices: []
        }
      ],
      isComplete: true,
      totalTurnsCount: 1
    };

    const html = formatToPrintHtml(dangerousSession);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('handles empty session with clear empty state message', () => {
    const emptySession: NotebookSession = {
      notebookTitle: 'Blank Notebook',
      url: 'https://notebook.google.com/empty',
      scannedAt: '2026-10-20T12:00:00.000Z',
      sources: [],
      turns: [],
      isComplete: true,
      totalTurnsCount: 0
    };

    const html = formatToPrintHtml(emptySession);
    expect(html).toContain('Blank Notebook');
    expect(html).toContain('No conversation turns recorded in this session.');
  });

  it('renders a visible partial scan alert when scan coverage is partial', () => {
    const partialSession: NotebookSession = {
      ...syntheticSession,
      isComplete: false,
      scanCoverage: 'partial',
      incompleteReason: 'scroll_traversal_timed_out'
    };
    const html = formatToPrintHtml(partialSession);
    expect(html).toContain('partial-scan-alert');
    expect(html).toContain('Notice: Partial Conversation Scan');
  });

  it('safely renders multi-vector untrusted content in title, sources, excerpts, code blocks, and conversation turns', () => {
    const maliciousSession: NotebookSession = {
      notebookTitle: '<svg onload="alert(\'title\')">',
      url: 'https://notebook.google.com/test',
      scannedAt: '2026-10-20T12:00:00.000Z',
      sources: [
        {
          index: 1,
          title: '<iframe src="evil.com">Source 1</iframe>',
          type: 'pdf',
          excerpt: '<script>alert("excerpt")</script>Key quote'
        }
      ],
      turns: [
        {
          id: 'turn-1',
          turnNumber: 1,
          role: 'user',
          text: '<a href="javascript:alert(1)">Click here</a> and <b onmouseover="alert(2)">hover</b>',
          citationIndices: []
        },
        {
          id: 'turn-2',
          turnNumber: 2,
          role: 'assistant',
          text: 'Here is code:\n```html\n<script>evil()</script>\n```\nAnd cite [1]',
          citationIndices: [1]
        }
      ],
      isComplete: false,
      incompleteReason: '<script>alert("reason")</script>network_error',
      totalTurnsCount: 2
    };

    const html = formatToPrintHtml(maliciousSession);

    // Verify raw tags NEVER appear unescaped anywhere in the document
    expect(html).not.toContain('<svg onload');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('evil()</script>');
    expect(html).not.toContain('<a href="javascript:');
    expect(html).not.toContain('<b onmouseover');

    // Verify properly escaped entities appear
    expect(html).toContain('&lt;svg onload=');
    expect(html).toContain('&lt;iframe src=');
    expect(html).toContain('&lt;script&gt;alert(&quot;excerpt&quot;)&lt;/script&gt;');
    expect(html).toContain('&lt;script&gt;evil()&lt;/script&gt;');
    expect(html).toContain('&lt;a href=&quot;javascript:');
    expect(html).toContain('&lt;b onmouseover=');
  });

  it('validates print stylesheet rules for page breaks and hiding interactive action bars', () => {
    const html = formatToPrintHtml(syntheticSession);
    expect(html).toContain('@media print');
    expect(html).toContain('.no-print { display: none !important; }');
    expect(html).toContain('page-break-inside: avoid');
    expect(html).toContain('class="action-bar no-print"');
  });
});

describe('escapeHtml utility', () => {
  it('escapes &, <, >, ", and single quotes', () => {
    expect(escapeHtml('Tom & Jerry <"cats">')).toBe('Tom &amp; Jerry &lt;&quot;cats&quot;&gt;');
    expect(escapeHtml("It's fine")).toBe('It&#39;s fine');
  });

  it('strips null bytes from untrusted strings', () => {
    expect(escapeHtml('hello\0world')).toBe('helloworld');
  });
});
