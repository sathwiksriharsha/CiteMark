# CiteMark Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the verified Milestone 1 MVP of CiteMark for Gemini Notebook: a 100% client-side Manifest V3 browser extension that reliably extracts multi-turn research conversations with verified source document attribution into clean Obsidian Markdown and Print-Ready HTML/PDF.

**Architecture:** A modular WXT/TypeScript extension with strict separation between DOM extraction (`scanner`), conversion engines (`markdown`, `html`), download delivery (`exporter`), and accessible UI state (`popup`). All core transformations are unit-tested against synthetic conversation and source fixtures before UI integration.

**Tech Stack:** WXT 0.21+ (Manifest V3), TypeScript 5+, Vitest (unit test runner), Vanilla CSS with high-density accessible tokens.

**Spec:** [docs/PRD.md](file:///c:/Users/sathw/Desktop/NotebookLM%20Extractor/docs/PRD.md) and [docs/DECISIONS.md](file:///c:/Users/sathw/Desktop/NotebookLM%20Extractor/docs/DECISIONS.md)

## Global Constraints
- Manifest V3 compliant; no remote code, no eval, no external network requests.
- Zero billing/payment code in Milestone 1 (strictly deferred to Milestone 2).
- Zero user data transmission; 100% on-device processing.
- Minimum permissions: `activeTab`, `scripting`, `storage`, `downloads` scoped strictly to `*://notebook.google.com/*` and `*://notebooklm.google.com/*`.
- Do not fabricate author names or DOIs; citations are bounded strictly to Source Document Titles and loaded verbatim excerpts (Capabilities A & B).
- Resilient semantic selectors (`role="region"`, `role="log"`, `aria-label`) rather than generated class names (`.mat-mdc-*`).

## Review Focus
1. **Lazy-loaded / Virtualized turns:** Conversation containers with >20 turns must not silently drop early turns during extraction.
2. **Untrusted text escaping:** Page text containing `<script>`, markdown control characters, or unclosed HTML tags must not execute or break formatting.
3. **Missing excerpts / unmounted sources:** Footnote generator must gracefully handle citations where excerpt text is deferred, mapping reliably to the Source Document Title without crashing.
4. **Inactive / Wrong Tab State:** When opened on a non-notebook tab or an empty notebook, popup must clearly indicate the state and disable export buttons with actionable guidance.
5. **Obsidian Compatibility:** Generated Markdown must strictly follow GFM footnote syntax (`[^1]: Title — quote`) and render valid footnotes in standard markdown parsers.

---

### Task 1: Project Scaffolding & Test Harness Setup

**Files:**
- Create: `package.json`
- Create: `wxt.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Test: `tests/sanity.test.ts`

**Interfaces:**
- Consumes: Node.js 24 LTS, npm 11
- Produces: Runnable build environment (`npm run build`), test suite (`npm test`), and typechecking (`npm run typecheck`).

- [ ] **Step 1: Create `package.json` with dependencies** (wxt, typescript, vitest, jsdom)
- [ ] **Step 2: Create `tsconfig.json`, `wxt.config.ts`, and `vitest.config.ts`**
- [ ] **Step 3: Write sanity test in `tests/sanity.test.ts` to verify Vitest and TypeScript harness**
- [ ] **Step 4: Run `npm install` and verify `npm test` passes**

---

### Task 2: Core Data Types & Synthetic Fixtures

**Files:**
- Create: `src/types/index.ts`
- Create: `tests/fixtures/synthetic-conversation.ts`
- Create: `tests/fixtures/sample-dom.html`
- Test: `tests/fixtures.test.ts`

**Interfaces:**
- Produces: `ConversationTurn`, `SourceRecord`, `NotebookSession`, `ExtractionResult`, and typed synthetic fixtures representing a 20-turn Gemini Notebook research session with 4 uploaded PDF sources.

- [ ] **Step 1: Define TypeScript interfaces in `src/types/index.ts`**
- [ ] **Step 2: Create realistic synthetic conversation fixtures in `tests/fixtures/synthetic-conversation.ts`**
- [ ] **Step 3: Write test asserting fixture validity and completeness invariants**
- [ ] **Step 4: Run `npm test` and verify passing**

---

### Task 3: Markdown Serializer with Source Attribution

**Files:**
- Create: `src/modules/converters/markdown.ts`
- Test: `tests/markdown-converter.test.ts`

**Interfaces:**
- Consumes: `ConversationTurn[]`, `SourceRecord[]`, `notebookTitle: string`
- Produces: `formatToMarkdown(session: NotebookSession): string`

- [ ] **Step 1: Write failing test in `tests/markdown-converter.test.ts`**
  - Asserts turn chronology (User vs Assistant)
  - Asserts GFM table and code block preservation
  - Asserts inline citation chips convert to `[^1]`
  - Asserts footnotes compile to `[^1]: [Document_Name.pdf] — "excerpt quote"`
  - Asserts aggregated `## Sources Cited` bibliography section
  - Asserts XSS/HTML tag escaping
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `formatToMarkdown` in `src/modules/converters/markdown.ts`**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 4: Standalone Print-Ready HTML Generator

**Files:**
- Create: `src/modules/converters/html.ts`
- Test: `tests/html-converter.test.ts`

**Interfaces:**
- Consumes: `ConversationTurn[]`, `SourceRecord[]`, `notebookTitle: string`
- Produces: `formatToPrintHtml(session: NotebookSession): string`

- [ ] **Step 1: Write failing test in `tests/html-converter.test.ts`**
  - Asserts standalone self-contained HTML document structure
  - Asserts embedded scholarly typography and `@media print` rules
  - Asserts strict HTML escaping of untrusted message text
  - Asserts footnote anchor links (`#fn-1`) and back-links (`#ref-1`)
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `formatToPrintHtml` in `src/modules/converters/html.ts`**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 5: DOM Extraction Engine & Progressive Reconciliation Scanner

**Files:**
- Create: `src/modules/scanner/extractor.ts`
- Create: `src/modules/scanner/reconciliation.ts`
- Test: `tests/scanner.test.ts`

**Interfaces:**
- Consumes: JSDOM / Browser Document container
- Produces: `extractSessionFromDOM(doc: Document): NotebookSession` and `reconcileTurnList(existingTurns, newTurns): ConversationTurn[]`

- [ ] **Step 1: Write failing test in `tests/scanner.test.ts` using synthetic HTML DOM fixture**
  - Tests extraction of notebook title
  - Tests extraction of Source Shelf document names
  - Tests extraction of User and Assistant message turns
  - Tests parsing of inline citation chips and indices
  - Tests progressive reconciliation when nodes are chunked
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement extraction and reconciliation logic in `src/modules/scanner/`**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 6: Content Script & Background Messaging

**Files:**
- Create: `src/entrypoints/content.ts`
- Create: `src/entrypoints/background.ts`
- Create: `src/modules/exporter/download.ts`
- Test: `tests/exporter.test.ts`

**Interfaces:**
- Consumes: Chrome Extension Runtime & Tabs API
- Produces: Bidirectional message protocol between popup and active tab (`SCAN_NOTEBOOK`, `EXTRACT_SESSION`, `EXECUTE_DOWNLOAD`).

- [ ] **Step 1: Implement download utility and filename sanitizer in `src/modules/exporter/download.ts`**
- [ ] **Step 2: Write tests for filename sanitization (illegal characters, dates, empty titles)**
- [ ] **Step 3: Implement `src/entrypoints/content.ts` and `src/entrypoints/background.ts`**
- [ ] **Step 4: Run tests to verify passing**

---

### Task 7: Operational Popup Interface & Accessible States

**Files:**
- Create: `src/entrypoints/popup/index.html`
- Create: `src/entrypoints/popup/main.ts`
- Create: `src/entrypoints/popup/style.css`

**Interfaces:**
- Consumes: Extraction engine & user actions
- Produces: Accessible 360px popup with distinct operational states:
  - Inactive / Wrong Host (`Please open notebook.google.com`)
  - Empty Notebook (`No conversation turns found`)
  - Scanning with progress indicator
  - Ready to Export (showing exact counts: turns, citations, sources)
  - Success with direct download trigger
  - Error with actionable retry guidance

- [ ] **Step 1: Implement popup HTML structure with semantic elements and ARIA landmarks**
- [ ] **Step 2: Implement compact, high-contrast, accessible CSS (WCAG AA, light/dark responsive)**
- [ ] **Step 3: Implement popup controller in `main.ts` managing real-time tab state**
- [ ] **Step 4: Run `npm run build` and verify clean extension bundling**

---

### Task 8: End-to-End Verification, Browser Inspection & QA Log

**Files:**
- Create: `research/QA_LOG.md`
- Inspect: Live build output and rendered popup via browser test

- [ ] **Step 1: Run full automated verification suite (`npm test`, `npm run typecheck`, `npm run build`)**
- [ ] **Step 2: Inspect built extension popup in browser using `browser_subagent` and capture screenshot**
- [ ] **Step 3: Perform independent QA review of diff, permissions, accessibility, and error handling**
- [ ] **Step 4: Fix any P0/P1/P2 issues and record final status in `research/QA_LOG.md`**
