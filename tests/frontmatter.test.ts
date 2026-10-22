import { describe, it, expect } from 'vitest';
import { generateYamlFrontmatter, DEFAULT_FRONTMATTER_CONFIG } from '../src/modules/converters/frontmatter';
import { formatToMarkdown } from '../src/modules/converters/markdown';
import { syntheticSession } from './fixtures/synthetic-conversation';
import type { NotebookSession, FrontmatterConfig } from '../src/types';

describe('Obsidian YAML Frontmatter Engine (generateYamlFrontmatter)', () => {
  it('generates valid YAML frontmatter block with tags and metadata', () => {
    const yaml = generateYamlFrontmatter(syntheticSession, DEFAULT_FRONTMATTER_CONFIG);

    expect(yaml.startsWith('---\n')).toBe(true);
    expect(yaml.endsWith('\n---')).toBe(true);
    expect(yaml).toContain('title: "Neural Attention & LLM Architectures Research"');
    expect(yaml).toContain('date: 2026-10-20');
    expect(yaml).toContain('url: "https://notebook.google.com/notebook/8f92a10b-synthetic"');
    expect(yaml).toContain('tags:\n  - gemini-notebook\n  - research');
    expect(yaml).toContain('aliases:\n  - "Neural Attention & LLM Architectures Research"');
    expect(yaml).toContain('sources_count: 4');
    expect(yaml).toContain('turns_count: 6');
  });

  it('escapes quotes in notebook title to prevent YAML parsing errors', () => {
    const sessionWithQuotes: NotebookSession = {
      ...syntheticSession,
      notebookTitle: 'Research on "Attention" & Transformers: A Guide'
    };
    const yaml = generateYamlFrontmatter(sessionWithQuotes, DEFAULT_FRONTMATTER_CONFIG);
    expect(yaml).toContain('title: "Research on \\"Attention\\" & Transformers: A Guide"');
  });

  it('honors config flags and omits disabled fields', () => {
    const minimalConfig: FrontmatterConfig = {
      enabled: true,
      tags: [],
      includeAliases: false,
      includeDate: false,
      includeUrl: false
    };
    const yaml = generateYamlFrontmatter(syntheticSession, minimalConfig);
    expect(yaml).not.toContain('tags:');
    expect(yaml).not.toContain('aliases:');
    expect(yaml).not.toContain('date:');
    expect(yaml).not.toContain('url:');
    expect(yaml).toContain('title: "Neural Attention & LLM Architectures Research"');
  });

  it('returns empty string when frontmatter is disabled', () => {
    const disabledConfig: FrontmatterConfig = {
      ...DEFAULT_FRONTMATTER_CONFIG,
      enabled: false
    };
    const yaml = generateYamlFrontmatter(syntheticSession, disabledConfig);
    expect(yaml).toBe('');
  });

  it('integrates with formatToMarkdown to output YAML block at top of file', () => {
    const md = formatToMarkdown(syntheticSession, {
      frontmatterConfig: DEFAULT_FRONTMATTER_CONFIG
    });

    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toContain('title: "Neural Attention & LLM Architectures Research"');
    expect(md).toContain('# Neural Attention & LLM Architectures Research');
    // Ensure YAML fence closes before markdown header
    const firstHeaderIdx = md.indexOf('# Neural Attention');
    const yamlEndIdx = md.indexOf('---\n\n# Neural Attention');
    expect(yamlEndIdx).toBeGreaterThan(0);
    expect(yamlEndIdx).toBeLessThan(firstHeaderIdx);
  });

  it('safely escapes tags, aliases, titles, and custom fields containing colons, quotes, newlines, and special characters', () => {
    const complexSession: NotebookSession = {
      ...syntheticSession,
      notebookTitle: 'Analysis: "Deep Learning" & Transformers\nPart 2: What\'s Next?',
      sources: syntheticSession.sources,
      turns: syntheticSession.turns
    };

    const complexConfig: FrontmatterConfig = {
      enabled: true,
      tags: [
        'ai:transformer', // Contains colon
        'tag with "quotes"', // Contains quotes
        'multiline\ntag\r\nhere', // Contains newlines
        '#standard-slug', // Leading hash to strip
        'c++ / system' // Special characters
      ],
      includeAliases: true,
      includeDate: true,
      includeUrl: true,
      customFields: {
        'project:id': 'proj-123:alpha', // Key with colon (disarmed to underscore) and value with colon
        'notes': 'Line 1\nLine 2 with "double quotes" and \\backslashes\\'
      }
    };

    const yaml = generateYamlFrontmatter(complexSession, complexConfig);

    // Title should be double-quoted with escaped quotes and collapsed newlines
    expect(yaml).toContain('title: "Analysis: \\"Deep Learning\\" & Transformers Part 2: What\'s Next?"');
    // Aliases should match title escaping
    expect(yaml).toContain('aliases:\n  - "Analysis: \\"Deep Learning\\" & Transformers Part 2: What\'s Next?"');
    // Tags containing colons or quotes must be double-quoted
    expect(yaml).toContain('- "ai:transformer"');
    expect(yaml).toContain('- "tag with \\"quotes\\""');
    expect(yaml).toContain('- "multiline tag here"');
    expect(yaml).toContain('- standard-slug');
    expect(yaml).toContain('- "c++ / system"');
    // Custom field key with colon disarmed to valid identifier
    expect(yaml).toContain('project_id: "proj-123:alpha"');
    expect(yaml).toContain('notes: "Line 1 Line 2 with \\"double quotes\\" and \\\\backslashes\\\\"');
  });
});
