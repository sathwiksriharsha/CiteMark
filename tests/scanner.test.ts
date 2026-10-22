import { describe, it, expect, beforeEach } from 'vitest';
import { extractSessionFromDOM, generateTurnFingerprint } from '../src/modules/scanner/extractor';
import { reconcileTurnList, verifyCompleteness } from '../src/modules/scanner/reconciliation';
import { SafeDiagnosticsTracker } from '../src/modules/scanner/diagnostics';
import type { ConversationTurn } from '../src/types';

describe('DOM Extraction Engine (extractSessionFromDOM)', () => {
  let doc: Document;

  beforeEach(() => {
    // Construct a synthetic JSDOM mimicking Gemini Notebook layout
    doc = document.implementation.createHTMLDocument('Quantum Computing Survey - Gemini Notebook');
    doc.body.innerHTML = `
      <header>
        <div role="heading" aria-level="1" aria-label="Notebook title" contenteditable="false">
          Quantum Computing Survey
        </div>
      </header>

      <!-- Sources Shelf / Panel on left -->
      <aside role="region" aria-label="Sources" class="source-panel">
        <div class="source-card" data-source-index="1">
          <span class="source-title">Nielsen_Chuang_Quantum_Computation.pdf</span>
          <span class="source-type">PDF</span>
        </div>
        <div class="source-card" data-source-index="2">
          <span class="source-title">Shor_Algorithm_Factoring.pdf</span>
          <span class="source-type">PDF</span>
        </div>
      </aside>

      <!-- Main Conversation Log -->
      <main role="log" aria-label="Conversation history" class="chat-viewport">
        <!-- Turn 1 (User) -->
        <div class="message-row user" role="region" aria-label="User message" data-turn-id="t-1">
          <div class="message-content">
            How does Shor's algorithm achieve exponential speedup over classical factoring?
          </div>
        </div>

        <!-- Turn 2 (Assistant) -->
        <div class="message-row assistant" role="region" aria-label="Gemini Notebook response" data-turn-id="t-2">
          <div class="message-content">
            Shor's algorithm reduces factoring to order-finding using the Quantum Fourier Transform (QFT) [2]. 
            Unlike classical number field sieves that run in sub-exponential time, the QFT computes the period of modular exponentiation in polynomial time [1] [2].
          </div>
          <!-- Citation chips in DOM -->
          <button class="citation-chip" data-citation-index="1" aria-label="Source 1: Nielsen_Chuang_Quantum_Computation.pdf">1</button>
          <button class="citation-chip" data-citation-index="2" aria-label="Source 2: Shor_Algorithm_Factoring.pdf">2</button>
        </div>
      </main>
    `;
  });

  it('extracts the clean notebook title without product suffix', () => {
    const session = extractSessionFromDOM(doc);
    expect(session.notebookTitle).toBe('Quantum Computing Survey');
  });

  it('extracts source document records from the Sources panel', () => {
    const session = extractSessionFromDOM(doc);
    expect(session.sources.length).toBe(2);
    expect(session.sources[0]?.title).toBe('Nielsen_Chuang_Quantum_Computation.pdf');
    expect(session.sources[0]?.index).toBe(1);
    expect(session.sources[1]?.title).toBe('Shor_Algorithm_Factoring.pdf');
    expect(session.sources[1]?.index).toBe(2);
  });

  it('extracts conversation turns preserving role, text, and citation indices', () => {
    const session = extractSessionFromDOM(doc);
    expect(session.turns.length).toBe(2);
    
    expect(session.turns[0]?.role).toBe('user');
    expect(session.turns[0]?.turnNumber).toBe(1);
    expect(session.turns[0]?.text).toContain("How does Shor's algorithm achieve exponential speedup");

    expect(session.turns[1]?.role).toBe('assistant');
    expect(session.turns[1]?.turnNumber).toBe(2);
    expect(session.turns[1]?.text).toContain("Quantum Fourier Transform");
    expect(session.turns[1]?.citationIndices).toContain(1);
    expect(session.turns[1]?.citationIndices).toContain(2);
  });

  it('prevents nested selector turn duplication', () => {
    // Add nested message elements
    const nestedDoc = document.implementation.createHTMLDocument();
    nestedDoc.body.innerHTML = `
      <div class="message-row user" data-turn-id="outer-1">
        <div class="message-content chat-turn" data-turn-id="inner-1">
          Nested content that should only be counted once
        </div>
      </div>
    `;
    const session = extractSessionFromDOM(nestedDoc);
    expect(session.turns.length).toBe(1);
  });

  it('extracts real NotebookLM chat-message-pair structure and citation-marker buttons', () => {
    const pairDoc = document.implementation.createHTMLDocument('NotebookLM Chat');
    pairDoc.body.innerHTML = `
      <input class="notebook-title" value="Climate Change Mitigation">
      <div class="chat-panel-content">
        <div class="chat-message-pair">
          <div class="from-user-container">
            <div class="message-text-content">What are the top three carbon capture methods?</div>
          </div>
          <div class="to-user-container">
            <div class="message-text-content">
              Direct air capture [1] and point-source bioenergy with CCS [2] are two primary methods.
              <button class="citation-marker" data-citation-index="1">1</button>
              <button class="citation-marker" data-citation-index="2">2</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const session = extractSessionFromDOM(pairDoc);
    expect(session.notebookTitle).toBe('Climate Change Mitigation');
    expect(session.turns.length).toBe(2);
    expect(session.turns[0]?.role).toBe('user');
    expect(session.turns[0]?.text).toContain('What are the top three carbon capture methods?');
    expect(session.turns[1]?.role).toBe('assistant');
    expect(session.turns[1]?.citationIndices).toEqual([1, 2]);
  });

  it('generates consistent fingerprints across repeated scroll renders', () => {
    const fp1 = generateTurnFingerprint('user', 'What is Shor algorithm?');
    const fp2 = generateTurnFingerprint('user', 'What is Shor algorithm?');
    const fpDiff = generateTurnFingerprint('assistant', 'What is Shor algorithm?');

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fpDiff);
  });
});

describe('Progressive Reconciliation Scanner (reconcileTurnList & verifyCompleteness)', () => {
  it('deduplicates turns and preserves top-to-bottom order', () => {
    const pass1Turns: ConversationTurn[] = [
      { id: 'turn-1', turnNumber: 1, role: 'user', text: 'Prompt 1', citationIndices: [] },
      { id: 'turn-2', turnNumber: 2, role: 'assistant', text: 'Answer 1', citationIndices: [1] }
    ];

    const pass2Turns: ConversationTurn[] = [
      { id: 'turn-2', turnNumber: 2, role: 'assistant', text: 'Answer 1 with expanded text', citationIndices: [1, 2] },
      { id: 'turn-3', turnNumber: 3, role: 'user', text: 'Prompt 2', citationIndices: [] }
    ];

    const merged = reconcileTurnList(pass1Turns, pass2Turns);
    expect(merged.length).toBe(3);
    expect(merged.map(t => t.id)).toEqual(['turn-1', 'turn-2', 'turn-3']);
    expect(merged.map(t => t.turnNumber)).toEqual([1, 2, 3]);
    // Verifies citation enrichment on overlapping turns
    expect(merged[1]?.citationIndices).toEqual([1, 2]);
    expect(merged[1]?.text).toContain('expanded text');
  });

  it('verifies completeness invariant and flags boundary failures', () => {
    const completeTurns: ConversationTurn[] = [
      { id: 't-1', turnNumber: 1, role: 'user', text: 'A', citationIndices: [] },
      { id: 't-2', turnNumber: 2, role: 'assistant', text: 'B', citationIndices: [] }
    ];
    
    // Normal complete verification
    const completeRes = verifyCompleteness(completeTurns, {
      containerScrollable: true,
      scrollReachedTop: true,
      scrollReachedBottom: true
    });
    expect(completeRes.isComplete).toBe(true);
    expect(completeRes.coverage).toBe('complete');

    // Failure: top boundary unreached
    const unreachedTopRes = verifyCompleteness(completeTurns, {
      containerScrollable: true,
      scrollReachedTop: false,
      scrollReachedBottom: true
    });
    expect(unreachedTopRes.isComplete).toBe(false);
    expect(unreachedTopRes.coverage).toBe('partial');
    expect(unreachedTopRes.reason).toBe('top_boundary_unreached_earlier_turns_may_be_missing');

    // Failure: timed out
    const timeoutRes = verifyCompleteness(completeTurns, {
      timedOut: true
    });
    expect(timeoutRes.isComplete).toBe(false);
    expect(timeoutRes.reason).toBe('scroll_traversal_timed_out');
  });
});

describe('SafeDiagnosticsTracker (Privacy Invariant)', () => {
  it('records counts and scanner transitions without storing message or excerpt text', () => {
    const tracker = new SafeDiagnosticsTracker();
    tracker.setContainerMetrics(true, 'main', 2400, 800);
    tracker.incrementScrollPasses(5, 300);
    tracker.setCounts(10, 4, 12);
    const diag = tracker.finalize();

    expect(diag.containerDetected).toBe(true);
    expect(diag.scrollPasses).toBe(1);
    expect(diag.finalTurnCount).toBe(10);
    expect(diag.sourceCount).toBe(4);
    expect(diag.citationCount).toBe(12);

    // Verify privacy invariant: serialization contains zero text keys
    const json = JSON.stringify(diag);
    expect(json).not.toContain('How does Shor');
    expect(json).not.toContain('Quantum Fourier');
    expect(json).not.toContain('excerpt');
  });
});
