/**
 * Privacy-Preserving Diagnostic Logger for CiteMark
 * 
 * INVARIANT: NEVER log conversation text, user queries, assistant responses,
 * source document text excerpts, or sensitive query parameters.
 * Only record numeric counts, state transitions, container metrics, and error codes.
 */

import type { DiagnosticEntry, ScanDiagnostics } from '../../types';

export class SafeDiagnosticsTracker {
  private diag: ScanDiagnostics;

  constructor() {
    this.diag = {
      startTime: Date.now(),
      initialTurnCount: 0,
      finalTurnCount: 0,
      sourceCount: 0,
      citationCount: 0,
      scrollPasses: 0,
      containerDetected: false,
      isComplete: true,
      events: []
    };
    this.recordEvent('INIT', { timestamp: new Date().toISOString() });
  }

  /**
   * Records a diagnostic milestone with safe non-content metrics.
   */
  public recordEvent(phase: string, metrics: Record<string, number | boolean | string> = {}): void {
    const entry: DiagnosticEntry = {
      timestamp: new Date().toISOString(),
      phase,
      metrics
    };
    this.diag.events.push(entry);

    // Development console log with [CiteMark:Diag] prefix
    // Strictly logs numbers, booleans, and structural tokens
    try {
      console.debug('[CiteMark:Diag]', phase, metrics);
    } catch {
      // Ignore if console is restricted
    }
  }

  public setContainerMetrics(detected: boolean, tag?: string, scrollHeight?: number, clientHeight?: number): void {
    this.diag.containerDetected = detected;
    if (tag) this.diag.containerTag = tag;
    if (scrollHeight !== undefined) this.diag.scrollHeight = scrollHeight;
    if (clientHeight !== undefined) this.diag.clientHeight = clientHeight;

    this.recordEvent('CONTAINER_METRICS', {
      detected,
      tag: tag || 'none',
      scrollHeight: scrollHeight || 0,
      clientHeight: clientHeight || 0
    });
  }

  public incrementScrollPasses(turnsInPass: number, currentScrollTop: number): void {
    this.diag.scrollPasses++;
    this.recordEvent('SCROLL_PASS', {
      passNumber: this.diag.scrollPasses,
      turnsInPass,
      scrollTop: currentScrollTop
    });
  }

  public setCounts(turns: number, sources: number, citations: number): void {
    this.diag.finalTurnCount = turns;
    this.diag.sourceCount = sources;
    this.diag.citationCount = citations;
    this.recordEvent('COUNTS_RESOLVED', {
      turns,
      sources,
      citations
    });
  }

  public markIncomplete(reason: string): void {
    this.diag.isComplete = false;
    this.diag.incompleteReason = reason;
    this.recordEvent('INCOMPLETE_FLAGGED', { reason });
  }

  public finalize(): ScanDiagnostics {
    this.diag.endTime = Date.now();
    this.diag.durationMs = this.diag.endTime - this.diag.startTime;
    this.recordEvent('SCAN_FINALIZED', {
      durationMs: this.diag.durationMs,
      totalTurns: this.diag.finalTurnCount,
      isComplete: this.diag.isComplete
    });
    return { ...this.diag };
  }
}
