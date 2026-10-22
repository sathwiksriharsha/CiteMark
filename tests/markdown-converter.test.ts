import { describe, it, expect } from 'vitest';
import { formatToMarkdown } from '../src/modules/converters/markdown';
import { syntheticSession, syntheticSources } from './fixtures/synthetic-conversation';
import type { NotebookSession } from '../src/types';

describe('Markdown Serializer (formatToMarkdown)', () => {
  it('includes the notebook title and metadata header', () => {
    const md = formatToMarkdown(syntheticSession);
    expect(md).toContain('# Neural Attention & LLM Architectures Research');
    expect(md).toContain('Exported from Gemini Notebook');
    expect(md).toContain('Total Turns: 6');
  });

  it('renders alternating user prompts and assistant responses in chronological order', () => {
    const md = formatToMarkdown(syntheticSession);
    const userIndex1 = md.indexOf('### 👤 User (Turn 1)');
    const assistantIndex1 = md.indexOf('### 🤖 Gemini Notebook (Turn 2)');
    const userIndex2 = md.indexOf('### 👤 User (Turn 3)');
    const assistantIndex2 = md.indexOf('### 🤖 Gemini Notebook (Turn 4)');

    expect(userIndex1).toBeGreaterThan(-1);
    expect(assistantIndex1).toBeGreaterThan(userIndex1);
    expect(userIndex2).toBeGreaterThan(assistantIndex1);
    expect(assistantIndex2).toBeGreaterThan(userIndex2);
  });

  it('converts bracketed citation numbers in assistant text to GFM footnote syntax', () => {
    const md = formatToMarkdown(syntheticSession);
    // [1] in text should become [^1]
    expect(md).toContain('[^1]');
    expect(md).toContain('[^2]');
    expect(md).toContain('[^3]');
    expect(md).toContain('[^4]');
  });

  it('compiles footnote definitions with source document title and excerpt quote', () => {
    const md = formatToMarkdown(syntheticSession);
    // Tier 1 citation with excerpt
    expect(md).toContain('[^1]: **Attention_Is_All_You_Need.pdf**');
    expect(md).toContain('The dominant sequence transduction models');

    // Tier 2 fallback citation without excerpt
    expect(md).toContain('[^4]: **Scaling_Laws_for_Neural_Language_Models.pdf**');
  });

  it('generates an aggregated Sources Cited reference list at the end of the document', () => {
    const md = formatToMarkdown(syntheticSession);
    expect(md).toContain('## 📚 Sources Cited');
    expect(md).toContain('1. **Attention_Is_All_You_Need.pdf**');
    expect(md).toContain('2. **BERT_Pretraining_Deep_Bidirectional_Transformers.pdf**');
    expect(md).toContain('3. **FlashAttention_Fast_and_Memory_Efficient.pdf**');
    expect(md).toContain('4. **Scaling_Laws_for_Neural_Language_Models.pdf**');
  });

  it('preserves code blocks and markdown tables inside turns', () => {
    const md = formatToMarkdown(syntheticSession);
    expect(md).toContain('| Model | Directionality | Pretraining Objective |');
    expect(md).toContain('```python');
    expect(md).toContain('def tiled_attention(Q, K, V):');
  });

  it('handles empty sessions gracefully without crashing', () => {
    const emptySession: NotebookSession = {
      notebookTitle: 'Empty Notebook',
      url: 'https://notebook.google.com/empty',
      scannedAt: '2026-10-20T12:00:00.000Z',
      sources: [],
      turns: [],
      isComplete: true,
      totalTurnsCount: 0
    };
    const md = formatToMarkdown(emptySession);
    expect(md).toContain('# Empty Notebook');
    expect(md).toContain('_No conversation turns recorded in this session._');
  });

  it('explicitly warns if export is from a partial scan', () => {
    const partialSession: NotebookSession = {
      ...syntheticSession,
      isComplete: false,
      scanCoverage: 'partial',
      incompleteReason: 'progressive_scroll_timeout'
    };
    const md = formatToMarkdown(partialSession);
    expect(md).toContain('> ⚠️ **Notice: Partial Scan**');
    expect(md).toContain('progressive scroll timeout');
  });
});
