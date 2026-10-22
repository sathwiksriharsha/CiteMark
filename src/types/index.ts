/**
 * CiteMark Core Types
 * Defines data structures for conversation turns, source records, and export sessions.
 */

export interface SourceRecord {
  /** Numeric 1-based index corresponding to Gemini Notebook's citation chip */
  index: number;
  /** Name of the uploaded document or source (e.g. "Attention_Mechanisms.pdf") */
  title: string;
  /** File or source type */
  type?: 'pdf' | 'doc' | 'web' | 'text' | 'unknown';
  /** Verbatim excerpt text quote if loaded in DOM state */
  excerpt?: string;
  /** Internal document ID or URL if available */
  id?: string;
}

export interface ConversationTurn {
  /** Unique identifier for the turn */
  id: string;
  /** Sequential 1-based turn number */
  turnNumber: number;
  /** Role of the speaker */
  role: 'user' | 'assistant';
  /** Text content of the turn (untrusted raw text or innerText) */
  text: string;
  /** Citation indices referenced within this turn (e.g. [1, 2, 4]) */
  citationIndices: number[];
  /** Optional turn timestamp */
  timestamp?: string;
}

export interface DiagnosticEntry {
  timestamp: string;
  phase: string;
  metrics: Record<string, number | boolean | string>;
}

export interface ScanDiagnostics {
  startTime: number;
  endTime?: number;
  durationMs?: number;
  initialTurnCount: number;
  finalTurnCount: number;
  sourceCount: number;
  citationCount: number;
  scrollPasses: number;
  containerDetected: boolean;
  containerTag?: string;
  scrollHeight?: number;
  clientHeight?: number;
  isComplete: boolean;
  incompleteReason?: string;
  events: DiagnosticEntry[];
}

export interface StudioNote {
  /** Unique ID of the Studio note */
  id: string;
  /** Title of the note or guide */
  title: string;
  /** Markdown or text body content if loaded */
  content?: string;
  /** Note type: e.g. 'note', 'briefing_doc', 'study_guide', 'audio_overview' */
  type?: string;
  /** Optional creation or edit timestamp */
  timestamp?: string;
}

export interface FrontmatterConfig {
  /** Whether to output YAML frontmatter at top of markdown */
  enabled: boolean;
  /** Tags to append to frontmatter */
  tags: string[];
  /** Whether to include note aliases */
  includeAliases: boolean;
  /** Whether to include ISO date */
  includeDate: boolean;
  /** Whether to include original notebook URL */
  includeUrl: boolean;
  /** Custom key-value pairs (e.g. status: draft) */
  customFields?: Record<string, string>;
}

export interface ProLicenseState {
  /** Whether Pro workflows are unlocked */
  isProActive: boolean;
  /** Optional activated license key */
  licenseKey?: string;
  /** ISO date when license was verified/activated */
  verifiedAt?: string;
}

export interface NotebookSession {
  /** Title of the active notebook */
  notebookTitle: string;
  /** Active page URL */
  url: string;
  /** ISO timestamp when extraction was performed */
  scannedAt: string;
  /** Uploaded source records discovered in the notebook */
  sources: SourceRecord[];
  /** Chronologically ordered conversation turns */
  turns: ConversationTurn[];
  /** Studio notes and synthesized artifacts */
  studioNotes?: StudioNote[];
  /** True only if lazy-loading verification passed with zero dropped turns */
  isComplete: boolean;
  /** Level of verified coverage */
  scanCoverage?: 'complete' | 'partial' | 'uncertain';
  /** Reason if scan was marked partial or incomplete */
  incompleteReason?: string;
  /** Total count of turns found */
  totalTurnsCount: number;
  /** Privacy-safe diagnostic telemetry */
  diagnostics?: ScanDiagnostics;
  /** Active frontmatter configuration */
  frontmatterConfig?: FrontmatterConfig;
}

export type ExportFormat = 'md' | 'html' | 'zip';

export type ScannerState = 
  | 'idle' 
  | 'scanning' 
  | 'ready' 
  | 'success' 
  | 'error' 
  | 'unsupported_host' 
  | 'empty_notebook';

export interface ScannerProgress {
  scannedTurns: number;
  totalTurns: number;
  percent: number;
}

export interface ScannerMessage {
  type: 'PING' | 'SCAN_REQUEST' | 'SCAN_PROGRESS' | 'SCAN_COMPLETE' | 'SCAN_ERROR';
  payload?: any;
}
