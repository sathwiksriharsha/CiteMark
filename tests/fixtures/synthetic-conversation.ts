import type { NotebookSession, SourceRecord, ConversationTurn } from '../../src/types';

export const syntheticSources: SourceRecord[] = [
  {
    index: 1,
    title: 'Attention_Is_All_You_Need.pdf',
    type: 'pdf',
    excerpt: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.'
  },
  {
    index: 2,
    title: 'BERT_Pretraining_Deep_Bidirectional_Transformers.pdf',
    type: 'pdf',
    excerpt: 'BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context.'
  },
  {
    index: 3,
    title: 'FlashAttention_Fast_and_Memory_Efficient.pdf',
    type: 'pdf',
    excerpt: 'FlashAttention computes exact attention with fewer memory accesses by tiling the softmax computation across SRAM.'
  },
  {
    index: 4,
    title: 'Scaling_Laws_for_Neural_Language_Models.pdf',
    type: 'pdf'
    // Intentionally no excerpt to test Tier-2 fallback!
  }
];

export const syntheticTurns: ConversationTurn[] = [
  {
    id: 'turn-1',
    turnNumber: 1,
    role: 'user',
    text: 'What are the core architectural differences between standard Recurrent Neural Networks and Transformer models?',
    citationIndices: []
  },
  {
    id: 'turn-2',
    turnNumber: 2,
    role: 'assistant',
    text: 'Standard Recurrent Neural Networks (RNNs) process sequences sequentially, passing hidden states from one token to the next. In contrast, the Transformer architecture replaces recurrence entirely with multi-head self-attention mechanisms [1].\n\nThis yields two major benefits:\n1. **Parallelization:** Computation across tokens occurs simultaneously during training.\n2. **Reduced Path Length:** Signals can travel directly between any two positions in constant O(1) operations [1].',
    citationIndices: [1]
  },
  {
    id: 'turn-3',
    turnNumber: 3,
    role: 'user',
    text: 'How does bidirectional context improve upon earlier autoregressive representations?',
    citationIndices: []
  },
  {
    id: 'turn-4',
    turnNumber: 4,
    role: 'assistant',
    text: 'Traditional autoregressive language models (like GPT) constrain representations to left-to-right unidirectional self-attention. BERT overcomes this limitation by utilizing masked language modeling (MLM), enabling the network to fuse both left and right context simultaneously across all layers [2].\n\n| Model | Directionality | Pretraining Objective |\n|---|---|---|\n| Standard RNN | Unidirectional | Next Token Prediction |\n| GPT-1 | Left-to-Right | Causal LM |\n| BERT | Bidirectional | Masked LM & NSP [2] |',
    citationIndices: [2]
  },
  {
    id: 'turn-5',
    turnNumber: 5,
    role: 'user',
    text: 'What memory bottlenecks occur when scaling attention to 128k context lengths?',
    citationIndices: []
  },
  {
    id: 'turn-6',
    turnNumber: 6,
    role: 'assistant',
    text: 'The fundamental bottleneck is quadratic memory complexity: standard self-attention requires storing an $N \\times N$ attention matrix in GPU HBM [1]. FlashAttention alleviates this by reordering computations to tile the softmax matrix within high-speed GPU SRAM without materializing large intermediate matrices [3].\n\n```python\n# Standard Attention Memory: O(N^2)\n# FlashAttention IO Complexity: O(N^2 / SRAM_Size)\ndef tiled_attention(Q, K, V):\n    return fast_tile_kernel(Q, K, V)\n```\n\nFurthermore, scaling laws indicate that model compute and parameter count must scale in proportion to dataset token count [4].',
    citationIndices: [1, 3, 4]
  }
];

export const syntheticSession: NotebookSession = {
  notebookTitle: 'Neural Attention & LLM Architectures Research',
  url: 'https://notebook.google.com/notebook/8f92a10b-synthetic',
  scannedAt: '2026-10-20T12:00:00.000Z',
  sources: syntheticSources,
  turns: syntheticTurns,
  isComplete: true,
  totalTurnsCount: syntheticTurns.length
};
