import { extractSessionFromDOM, extractTurns } from '../modules/scanner/extractor';
import { reconcileTurnList, verifyCompleteness } from '../modules/scanner/reconciliation';
import { SafeDiagnosticsTracker } from '../modules/scanner/diagnostics';
import type { NotebookSession, ConversationTurn } from '../types';

export default defineContentScript({
  matches: [
    '*://notebook.google.com/*',
    '*://notebooklm.google.com/*',
    '*://*.notebook.google.com/*',
    '*://*.notebooklm.google.com/*',
    '*://notebooklm.google/*',
    '*://*.notebooklm.google/*',
    '*://notebook.google/*',
    '*://*.notebook.google/*'
  ],
  main() {
    console.log('[CiteMark] Content script active on Gemini Notebook.');

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'SCAN_NOTEBOOK') {
        handleScanRequest().then(sendResponse).catch(err => {
          sendResponse({
            success: false,
            error: err instanceof Error ? err.message : String(err)
          });
        });
        return true; // Keep channel open for async response
      }
    });
  }
});

/**
 * Locates the scrollable message container using resilient semantic heuristics.
 */
function findScrollContainer(doc: Document): HTMLElement | null {
  // Strategy 1: Known real NotebookLM container selectors
  const selectors = [
    'div.chat-panel-content',
    '.chat-panel-content',
    'chat-panel',
    '.chat-panel',
    'div[class*="chat-panel"]',
    'div.message-container',
    'cdk-virtual-scroll-viewport',
    'main[role="log"]',
    'main[role="feed"]',
    '[role="log"]',
    '.chat-viewport',
    '.conversation-container',
    '.chat-scroll-container',
    '.infinite-scroll-container'
  ];

  for (const sel of selectors) {
    const el = doc.querySelector<HTMLElement>(sel);
    if (el && el.scrollHeight > el.clientHeight) {
      return el;
    }
  }

  // Strategy 2: Scrollable ancestor of a message row or pair
  const msgEl = doc.querySelector<HTMLElement>(
    'div.chat-message-pair, .chat-message-pair, .from-user-container, .to-user-container, chat-message, .individual-message, .message-row, [role="region"][aria-label*="message" i], .chat-turn, .chat-message'
  );
  if (msgEl) {
    let curr = msgEl.parentElement;
    while (curr && curr !== doc.body && curr !== doc.documentElement) {
      if (curr.scrollHeight > curr.clientHeight) {
        try {
          const overflow = window.getComputedStyle(curr).overflowY;
          if (overflow === 'auto' || overflow === 'scroll') {
            return curr;
          }
        } catch {
          // Ignore style errors in restricted contexts
        }
      }
      curr = curr.parentElement;
    }
  }

  // Strategy 3: Check document scrolling element
  if (doc.scrollingElement && doc.scrollingElement.scrollHeight > doc.scrollingElement.clientHeight) {
    return doc.scrollingElement as HTMLElement;
  }

  return null;
}

/**
 * Executes a progressive scan of the notebook document.
 * Scans sources and progressively scrolls the conversation viewport strictly from top to bottom
 * to hydrate and reconcile any virtualized turns without altering reading sequence.
 */
async function handleScanRequest(): Promise<{ success: boolean; session?: NotebookSession; error?: string }> {
  const diagTracker = new SafeDiagnosticsTracker();

  try {
    // 1. Initial snapshot extraction
    const initialSession = extractSessionFromDOM(document, diagTracker);
    diagTracker.recordEvent('INITIAL_SNAPSHOT', {
      turnsCount: initialSession.turns.length,
      sourcesCount: initialSession.sources.length
    });

    // 2. Locate conversation scroll container
    const scrollContainer = findScrollContainer(document);

    let collectedTurns: ConversationTurn[] = initialSession.turns;
    let scrollReachedTop = false;
    let scrollReachedBottom = false;
    let timedOut = false;

    // 3. Progressive Top-to-Bottom Reconciliation if container is scrollable
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
      diagTracker.setContainerMetrics(
        true,
        scrollContainer.tagName.toLowerCase(),
        scrollContainer.scrollHeight,
        scrollContainer.clientHeight
      );

      const originalScrollTop = scrollContainer.scrollTop;
      const step = Math.max(250, Math.floor(scrollContainer.clientHeight * 0.75));

      // Step A: Jump to top to ensure we discover all earliest turns first
      scrollContainer.scrollTop = 0;
      await new Promise(resolve => setTimeout(resolve, 120));
      scrollReachedTop = scrollContainer.scrollTop <= 15;

      // Extract top turns
      collectedTurns = extractTurns(document);
      diagTracker.incrementScrollPasses(collectedTurns.length, scrollContainer.scrollTop);

      // Step B: Progressively traverse downwards
      const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      let currentTop = 0;
      const startTime = Date.now();
      const MAX_SCAN_DURATION_MS = 6000; // 6s timeout protection

      while (currentTop < maxScrollTop) {
        if (Date.now() - startTime >= MAX_SCAN_DURATION_MS) {
          timedOut = true;
          diagTracker.markIncomplete('progressive_scroll_timeout');
          break;
        }

        currentTop = Math.min(maxScrollTop, currentTop + step);
        scrollContainer.scrollTop = currentTop;
        await new Promise(resolve => setTimeout(resolve, 100));

        const passTurns = extractTurns(document);
        collectedTurns = reconcileTurnList(collectedTurns, passTurns);
        diagTracker.incrementScrollPasses(passTurns.length, scrollContainer.scrollTop);

        if (scrollContainer.scrollTop >= maxScrollTop - 15) {
          scrollReachedBottom = true;
          break;
        }
      }

      // Step C: Restore user's original scroll position
      scrollContainer.scrollTop = originalScrollTop;
    } else {
      diagTracker.setContainerMetrics(false);
      // Container not scrollable: conversation fits entirely in viewport
      scrollReachedTop = true;
      scrollReachedBottom = true;
    }

    // 4. Verify Completeness & Invariants
    const verification = verifyCompleteness(collectedTurns, {
      containerScrollable: !!scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight,
      scrollReachedTop,
      scrollReachedBottom,
      timedOut
    });

    const totalCitations = collectedTurns.reduce((acc, t) => acc + t.citationIndices.length, 0);
    diagTracker.setCounts(collectedTurns.length, initialSession.sources.length, totalCitations);

    if (!verification.isComplete) {
      diagTracker.markIncomplete(verification.reason || 'unverified_coverage');
    }

    const diagnostics = diagTracker.finalize();

    const fullSession: NotebookSession = {
      ...initialSession,
      turns: collectedTurns,
      isComplete: verification.isComplete,
      scanCoverage: verification.coverage,
      incompleteReason: verification.reason,
      totalTurnsCount: collectedTurns.length,
      diagnostics
    };

    return {
      success: true,
      session: fullSession
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown scanning error occurred.';
    diagTracker.recordEvent('SCAN_ERROR', { error: errorMsg });
    return {
      success: false,
      error: errorMsg
    };
  }
}
