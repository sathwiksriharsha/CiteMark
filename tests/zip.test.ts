import { describe, it, expect } from 'vitest';
import { unzipSync } from 'fflate';
import { buildResearchZipArchive, formatSourcesMarkdown } from '../src/modules/exporter/zip';
import { syntheticSession } from './fixtures/synthetic-conversation';
import type { NotebookSession } from '../src/types';

describe('Research Archive ZIP Bundler (buildResearchZipArchive)', () => {
  it('formats standalone Sources Bibliography markdown', () => {
    const sourcesMd = formatSourcesMarkdown(syntheticSession);
    expect(sourcesMd).toContain('# Sources Bibliography & References');
    expect(sourcesMd).toContain('[1] Attention_Is_All_You_Need.pdf');
    expect(sourcesMd).toContain('[2] BERT_Pretraining_Deep_Bidirectional_Transformers.pdf');
    expect(sourcesMd).toContain('The dominant sequence transduction models');
  });

  it('builds a valid, uncorrupted ZIP archive containing conversation, HTML, and sources', () => {
    const sessionWithNotes: NotebookSession = {
      ...syntheticSession,
      studioNotes: [
        {
          id: 'note-1',
          title: 'Executive Briefing Memo',
          content: 'This note synthesizes key takeaways from the attention papers.'
        },
        {
          id: 'note-2',
          title: 'FlashAttention Benchmarks',
          content: 'Detailed timing and memory metrics.'
        }
      ]
    };

    const zipBuffer = buildResearchZipArchive(sessionWithNotes);
    expect(zipBuffer).toBeInstanceOf(Uint8Array);
    expect(zipBuffer.length).toBeGreaterThan(500);

    // Unzip the generated buffer to verify internal file structure
    const unzipped = unzipSync(zipBuffer);
    const filenames = Object.keys(unzipped);

    expect(filenames).toContain('Conversation.md');
    expect(filenames).toContain('Conversation.html');
    expect(filenames).toContain('Sources_Bibliography.md');
    expect(filenames).toContain('Studio_Notes/Executive_Briefing_Memo.md');
    expect(filenames).toContain('Studio_Notes/FlashAttention_Benchmarks.md');

    // Verify unzipped content matches
    const decompressedMd = new TextDecoder().decode(unzipped['Conversation.md']);
    expect(decompressedMd).toContain('Neural Attention & LLM Architectures Research');

    const decompressedNote = new TextDecoder().decode(unzipped['Studio_Notes/Executive_Briefing_Memo.md']);
    expect(decompressedNote).toContain('This note synthesizes key takeaways');
  });

  it('bundles filtered turns and custom YAML frontmatter seamlessly inside the archive', () => {
    const filteredSession: NotebookSession = {
      ...syntheticSession,
      turns: [syntheticSession.turns[0]!, syntheticSession.turns[1]!],
      frontmatterConfig: {
        enabled: true,
        tags: ['deep-learning', 'transformers'],
        includeAliases: true,
        includeDate: true,
        includeUrl: true
      }
    };

    const zipBuffer = buildResearchZipArchive(filteredSession);
    const unzipped = unzipSync(zipBuffer);
    const decompressedMd = new TextDecoder().decode(unzipped['Conversation.md']);

    expect(decompressedMd).toContain('---');
    expect(decompressedMd).toContain('tags:');
    expect(decompressedMd).toContain('- deep-learning');
    expect(decompressedMd).toContain('turns_count: 2');
    expect(decompressedMd).not.toContain('Turn 3');
  });

  it('guarantees valid relative paths, complete content, and excludes empty or fabricated Studio notes', () => {
    const sessionWithMixedNotes: NotebookSession = {
      ...syntheticSession,
      studioNotes: [
        {
          id: 'note-valid',
          title: 'Genuine Verified Findings',
          content: 'This note has real research content extracted from the notebook.'
        },
        {
          id: 'note-empty-content',
          title: 'Empty Ghost Note',
          content: '' // Empty content -> MUST NOT be in ZIP
        },
        {
          id: 'note-whitespace-content',
          title: 'Whitespace Note',
          content: '   \n  \t  ' // Whitespace only -> MUST NOT be in ZIP
        },
        {
          id: 'note-undefined-content',
          title: 'Unloaded Placeholder Note'
          // undefined content -> MUST NOT be in ZIP
        },
        {
          id: 'note-blank-title',
          title: '   ',
          content: 'Some orphaned body text' // Blank title -> MUST NOT be in ZIP
        },
        {
          id: 'note-traversal',
          title: '../../traversal_test',
          content: 'Attempting directory traversal escaping'
        }
      ]
    };

    const zipBuffer = buildResearchZipArchive(sessionWithMixedNotes);
    const unzipped = unzipSync(zipBuffer);
    const filenames = Object.keys(unzipped);

    // 1. All paths must be valid relative paths (no leading slashes, no absolute paths)
    filenames.forEach(fn => {
      expect(fn.startsWith('/')).toBe(false);
      expect(fn.startsWith('\\')).toBe(false);
      expect(fn.includes('..')).toBe(false); // No directory traversal!
    });

    // 2. Verified complete content files at root
    expect(filenames).toContain('Conversation.md');
    expect(filenames).toContain('Conversation.html');
    expect(filenames).toContain('Sources_Bibliography.md');

    // 3. Valid note is included
    expect(filenames).toContain('Studio_Notes/Genuine_Verified_Findings.md');
    const validContent = new TextDecoder().decode(unzipped['Studio_Notes/Genuine_Verified_Findings.md']);
    expect(validContent).toContain('This note has real research content');

    // 4. Empty and fabricated notes MUST NOT exist in archive
    expect(filenames).not.toContain('Studio_Notes/Empty_Ghost_Note.md');
    expect(filenames).not.toContain('Studio_Notes/Whitespace_Note.md');
    expect(filenames).not.toContain('Studio_Notes/Unloaded_Placeholder_Note.md');

    // 5. Directory traversal title is sanitized safely inside Studio_Notes/
    expect(filenames.some(fn => fn.includes('traversal_test'))).toBe(true);
    const traversalFilename = filenames.find(fn => fn.includes('traversal_test'));
    expect(traversalFilename?.startsWith('Studio_Notes/')).toBe(true);
    expect(traversalFilename?.includes('..')).toBe(false);
  });
});
