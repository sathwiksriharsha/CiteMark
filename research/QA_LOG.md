# Quality Assurance & Verification Log (QA_LOG.md)

**Project:** CiteMark for Gemini Notebook (NotebookLM Exporter)  
**Milestone:** Milestone 1 MVP — Core Adoption Engine (Rigorous QA Pass)  
**Execution Date:** October 20, 2026  
**Environment:** Node.js v24.22.0 | npm 11.19.1 | Windows PowerShell | Chrome Manifest V3 | WXT 0.21.4 | Vitest 2.1.9 | TypeScript 5.6.3

---

## 1. Automated Verification Summary

| Suite / Check | Command | Result | Duration | Notes / Coverage |
|---|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS (Exit 0)** | 1.8s | Strict type safety; 0 type errors across scanner, converters, and UI |
| **Sanity & DOM Globals** | `vitest run tests/sanity.test.ts` | **PASS (2/2)** | 10ms | JSDOM environment, DOM manipulation & global assertions |
| **Synthetic Fixtures** | `vitest run tests/fixtures.test.ts` | **PASS (4/4)** | 4ms | Realistic 20-turn conversation fixtures, source records, mixed citation edge cases |
| **Download Exporter** | `vitest run tests/exporter.test.ts` | **PASS (6/6)** | 4ms | Filename sanitization, illegal char stripping, Windows reserved names (CON/PRN/AUX/NUL), path traversal disarming, length protection, MIME types |
| **Markdown Serializer** | `vitest run tests/markdown-converter.test.ts` | **PASS (8/8)** | 6ms | Chronological turn order, GFM footnotes (`[^1]`), table/code preservation, source attribution, empty state, partial scan disclosure warning |
| **HTML / Print Generator** | `vitest run tests/html-converter.test.ts` | **PASS (9/9)** | 65ms | Standalone HTML5 document, scholarly serif typography, `@media print`, strict XSS escaping, anchor links, null byte stripping, partial scan warning banner |
| **DOM Scanner & Reconciler**| `vitest run tests/scanner.test.ts` | **PASS (9/9)** | 73ms | Semantic selector extraction, source shelf mapping, real NotebookLM chat-message-pair support, stable fingerprinting, nested element deduplication, progressive top-to-bottom scroll reconciliation, boundary completeness invariant, privacy-preserving diagnostics tracker |
| **Total Test Suite** | `npm test` (`vitest run`) | **PASS (38/38)** | 1.0s | **100% test pass rate across 6 test suites** |
| **Production Build** | `npm run build` (`wxt build`) | **PASS (Exit 0)** | 0.4s | Chrome MV3 bundle built cleanly in `.output/chrome-mv3/` |

---

## 2. Integration Defect Audit & Resolution Ledger

During the Phase 1 QA audit and live-site debugging, 10 critical areas were inspected, identified, and corrected:

| Area / Defect | Vulnerability / Symptom | Root Cause | Engineering Correction |
|---|---|---|---|
| **Silent Failure ("Not telling anything")** | Popup stuck on scanning or showing blank/unsupported state without feedback | Content script messaging timeout or unmatched domain URL (`notebooklm.google`) | Added 1500ms safety timeout with automatic fallback to direct in-page script execution via `chrome.scripting.executeScript`, expanded domain matching to `notebooklm.google`, and added live troubleshooting drawer |
| **NotebookLM DOM Selectors Mismatch** | Zero turns extracted from real NotebookLM pages | NotebookLM uses `div.chat-message-pair`, `.from-user-container`, `.to-user-container`, `button.citation-marker` instead of generic chat classes | Added native support for `div.chat-message-pair`, `.message-text-content`, `button.citation-marker`, and structural fallbacks |
| **Notebook Title Input Mismatch** | Extracted title was blank or generic | NotebookLM stores the notebook title in an `<input class="notebook-title">` element where `.textContent` is empty | Added check for `(titleEl as HTMLInputElement).value` |
| **Turn ID Collisions** | Virtualized turns were assigned arbitrary indexes (`turn-1`, `turn-2`), causing turn collisions across scroll passes | `turn-${index + 1}` fallback based on current snapshot slice | Implemented deterministic `generateTurnFingerprint(role, text, explicitId)` hashing role, length, and text snippet |
| **Nested Element Duplication** | Inner content containers inside message rows could be matched twice | Unfiltered `querySelectorAll` matching both outer row and inner element | Implemented hierarchical filtering (`!rawElements.some(other => other.contains(el))`) |
| **Chronological Scramble** | Scrolling up to find earlier turns appended them to bottom turns in `reconcileTurnList` | Naive append order in `Map.set()` | Restructured progressive scrolling to traverse strictly **top-to-bottom** starting at `scrollTop = 0` |
| **Tautological Completeness Check** | `verifyCompleteness` always returned `true` regardless of virtualized drops | Re-indexing turns to `1..N` immediately before checking `turnNumber === i + 1` | Refactored `verifyCompleteness` to inspect physical scroll boundary verification (`scrollReachedTop`, `scrollReachedBottom`, `timedOut`) |
| **Silent Completeness Claims** | Partial exports from interrupted scans appeared identical to complete exports | UI showed no indication of incomplete traversal | Added amber **Partial Scan Detected** warning banner to popup and explicit markdown/HTML header disclosures |
| **Privacy Diagnostic Logging** | No scanner observability without risk of leaking private user notebook text | Lack of dedicated diagnostic instrumentation | Built `SafeDiagnosticsTracker` recording counts, timings, and container metrics with **zero conversation text or source excerpts** |
| **Filesystem Security** | Malicious or accidental filenames could trigger filesystem corruption (e.g. `CON.md`) | Basic regex only checked `<>:"/\\|?*` | Added protection against Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`), path traversal (`..`), null bytes (`\0`), and path length overflow |
| **Permission Minimization** | Heavy `'downloads'` permission triggered scary browser install warning ("Manage your downloads") | Unnecessary usage of `chrome.downloads` API | Replaced with standard DOM Blob `<a download>` triggering; stripped `'downloads'` from `manifest.json` |

---

## 3. Production Bundle Audit (`.output/chrome-mv3`)

```text
WXT 0.21.4
i Building chrome-mv3 for production with Vite 8.3.4
√ Built extension in 269 ms
  ├─ .output\chrome-mv3\manifest.json               1.08 kB 
  ├─ .output\chrome-mv3\popup.html                  6.72 kB 
  ├─ .output\chrome-mv3\background.js               670 B   
  ├─ .output\chrome-mv3\chunks\popup-BUJ6gP40.js    20.57 kB
  ├─ .output\chrome-mv3\content-scripts\content.js  13.26 kB
  ├─ .output\chrome-mv3\assets\popup-DzSwfaPc.css   5.34 kB 
  ├─ .output\chrome-mv3\icon-128.png                690 B   
  ├─ .output\chrome-mv3\icon-16.png                 113 B   
  └─ .output\chrome-mv3\icon-48.png                 223 B   
Σ Total bundle size: 48.67 kB
```

### Manifest V3 Security & Permissions Check:
- **Permissions Requested:** `activeTab`, `scripting`, `storage` (strictly minimum required).
- **Host Permissions:** Strictly bounded to `*://notebook.google.com/*` and `*://notebooklm.google.com/*`.
- **Zero Remote Code / Zero Telemetry:** Zero external script tags, zero `eval`, zero analytics packets. Content Security Policy compliant.
- **Removed Permissions:** `'downloads'` permanently removed. Browser install warning is now completely minimal.

---

## 4. Manual Live-Site Test Protocol (Gemini Notebook / NotebookLM)

Because the headless browser automation subagent failed due to a Playwright CDP protocol issue, **no visual or live-site verification is claimed as passed yet**.

The following test procedure must be executed manually by a human tester in an authenticated Google Chrome session:

### Prerequisites:
1. Open Google Chrome. Navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select:
   `c:\Users\sathw\Desktop\NotebookLM Extractor\.output\chrome-mv3`
4. Open Chrome DevTools (`F12`), switch to the **Console** tab, and preserve logs.

---

### Test Case 1: Inactive Host & Dashboard Guard
- **Procedure:**
  1. Open a new tab on `https://google.com`. Click the CiteMark extension icon.
  2. Navigate to `https://notebook.google.com/` (the dashboard listing all notebooks, without opening one). Click the CiteMark extension icon.
- **Expected Results:**
  - On `google.com`: Popup displays the blue **Gemini Notebook Required** card with a direct link to `notebook.google.com`.
  - On `notebook.google.com/` dashboard: Popup displays the **Open a Notebook** empty card explaining that a specific notebook must be opened.
- **Evidence to Capture:**
  - Screenshot of the popup in each state.

---

### Test Case 2: Short Active Notebook Export (< 5 Turns)
- **Procedure:**
  1. Open an active notebook with 2–4 conversation turns and at least 1 uploaded source document.
  2. Click the CiteMark extension icon.
  3. Verify turn, source, and citation badges.
  4. Select **Obsidian Markdown (.md)** and click **Export Research**.
  5. Select **Print-Ready View (.html / PDF)** and click **Export Research**.
- **Expected Results:**
  - Popup transitions: `scanning` (spinner) &rarr; `ready` (green badges).
  - Metric badges match visible turns and source documents on screen.
  - Downloaded `.md` file opens in a text editor / Obsidian with clean formatting, alternating `### 👤 User` and `### 🤖 Gemini Notebook` headers, and valid footnote anchors `[^1]`.
  - Downloaded `.html` file opens in Chrome with styled scholarly typography, a clickable "🖨️ Print / Save as PDF" button, and footnote jump links.
- **Evidence to Capture:**
  - Exported `.md` file.
  - Exported `.html` file.
  - Console output for `[CiteMark:Diag]`.

---

### Test Case 3: Long Virtualized Conversation & Progressive Lazy-Loading (15+ Turns)
- **Procedure:**
  1. Open or generate a notebook with 15–30 turns (a long exploratory session).
  2. Scroll to the bottom of the conversation in Gemini Notebook.
  3. Open the CiteMark popup.
  4. Observe the scanning state as CiteMark traverses the scroll container from top to bottom.
- **Expected Results:**
  - CiteMark scrolls smoothly to the top, then descends in steps to reconcile virtualized turns.
  - The turn count badge in the popup reflects the full conversation count (not just the 4–5 turns visible in the viewport).
  - The downloaded file starts with Turn 1 (the initial user question) and ends with the final response in strict chronological order.
  - No duplicated or scrambled turns.
- **Evidence to Capture:**
  - Inspect `window.__CITEMARK_LAST_SESSION__.diagnostics` in DevTools Console.
  - Check `scrollPasses`, `initialTurnCount`, and `finalTurnCount`.

---

### Test Case 4: Citation Attribution Verification (Footnote & Bibliography)
- **Procedure:**
  1. Locate an assistant response containing citation chips `[1]` and `[2]`.
  2. Check the Sources shelf on the left panel of Gemini Notebook to identify the exact document names for Source 1 and Source 2.
  3. Inspect the exported `.md` and `.html` files at the corresponding footnote section.
- **Expected Results:**
  - Footnote `[^1]` exactly cites the document filename from Source Shelf item 1.
  - Footnote `[^2]` exactly cites the document filename from Source Shelf item 2.
  - The "📚 Sources Cited" section at the bottom enumerates all uploaded documents with their file types.
  - Zero dead unlinked numbers `[1]`.
- **Evidence to Capture:**
  - Comparison screenshot: left Sources shelf vs exported footnote text.

---

### Test Case 5: Untrusted Text & Code Block Safety
- **Procedure:**
  1. In Gemini Notebook, ask a question that produces code blocks (e.g. Python function) and markdown tables.
  2. Export to both `.md` and `.html`.
- **Expected Results:**
  - Code blocks (` ```python `) are preserved cleanly in both Markdown and HTML (`<pre><code>`).
  - No HTML injection or unescaped tags.
- **Evidence to Capture:**
  - Rendered code snippet in exported HTML.

---

### Test Case 6: Incomplete / Interrupted Scan Safeguard
- **Procedure:**
  1. Open a very long notebook.
  2. Artificially restrict the viewport or interrupt scrolling.
  3. Observe popup behavior.
- **Expected Results:**
  - CiteMark detects that boundaries were unverified (`isComplete: false`).
  - An amber **Partial Scan Detected** banner is rendered in the popup with an option to retry or export partial.
  - The exported file prominently includes the header notice:
    `> ⚠️ **Notice: Partial Scan** — Earlier turns could not be verified.`
  - The product **never** silently claims complete export when coverage is uncertain.
- **Evidence to Capture:**
  - Screenshot of the partial scan amber warning banner in the popup.

---

## 5. Live-Site Verification Outcome (User Verified)

- **Date:** October 21, 2026
- **Test Environment:** Live Google Chrome session running on active Gemini Notebook / NotebookLM tab.
- **Verification Result:** **CONFIRMED WORKING BY USER.**
- **Details:**
  - Direct in-page extraction fallback, real `chat-message-pair` DOM selectors, and expanded `.google` domain matching resolved all previous silent failures.
  - The extension activates cleanly, identifies conversation turns and sources, renders the ready UI, and exports valid files without hangs or silent drops.

---

## 6. Milestone 2 QA: Advanced Workflows & Power Features

**Execution Date:** October 21, 2026  
**Test Suite:** 50 automated tests passing across 9 test suites (`npm test`)  
**TypeScript Typecheck:** 0 errors (`tsc --noEmit`)  
**Production Build:** Clean build in 395ms, total bundle size: **75.27 kB** (`.output/chrome-mv3`)

### Automated Verification Results:
| Test Suite | File | Tests Passing | Key Behaviors Verified |
|---|---|---|---|
| **Selective Turn Filter** | `tests/filter.test.ts` | 4/4 | Filters turns by ID; re-indexes sequentially `1..M`; preserves authentic chronological order; recalculates active citation indices; disallows zero-turn export |
| **Obsidian Frontmatter** | `tests/frontmatter.test.ts` | 5/5 | Generates standard YAML frontmatter bounded by `---`; includes title, date, URL, tags, aliases, quantitative turns/sources counts, and custom key-value pairs; disarms special characters and backslashes |
| **ZIP Bundler** | `tests/zip.test.ts` | 3/3 | Bundles `Conversation.md`, `Conversation.html`, `Sources_Bibliography.md`, and `Studio_Notes/*.md` using pure client-side `fflate.zipSync`; unzips without corruption; preserves custom frontmatter and filtered turns inside the archive |
| **Markdown Converter** | `tests/markdown-converter.test.ts` | 8/8 | Integrates frontmatter options into markdown generator; footnote definitions match source indices; sanitizes unsafe HTML; handles empty and partial scan states |
| **HTML / Print Converter** | `tests/html-converter.test.ts` | 9/9 | Clean serif typography; `@media print` layout; XSS immunity; bibliography index; back-to-top navigation |
| **Scanner & Diagnostics** | `tests/scanner.test.ts` | 9/9 | Real NotebookLM `chat-message-pair` DOM extraction; Studio notes extraction; privacy-safe metrics; zero leakage of conversation text |
| **Exporter & Fixtures** | `tests/exporter.test.ts`, `tests/fixtures.test.ts`, `tests/sanity.test.ts` | 12/12 | Safe filename generation; JSDOM globals; 20-turn realistic research conversation fixtures |

### Milestone 2 User-Facing Acceptance Criteria:
1. **Selective Turn Filter:**
   - [x] Popup UI includes an interactive accordion drawer displaying every inquiry turn with role badge (`User` vs `Gemini`), turn number, snippet, and citation count pill.
   - [x] Checkboxes allow toggling individual turns on and off.
   - [x] Quick "Select All" and "Clear All" buttons allow 1-click batch selection.
   - [x] Summary metrics pills live-update as turns are toggled.
   - [x] If 0 turns are selected, Export and Copy buttons are safely disabled with an amber warning banner.
   - [x] Filtered exports re-index turns `1..M` sequentially without number gaps, while preserving authentic chronological reading order.

2. **Custom Obsidian Frontmatter Engine:**
   - [x] Accordion drawer allows configuring YAML frontmatter tags, aliases, and quantitative counts.
   - [x] Clean YAML serializer outputs standard Obsidian / Logseq frontmatter bounded by `---`.
   - [x] User preferences automatically persist in `chrome.storage.local`.

3. **Complete Research Archive (.zip) Bundler:**
   - [x] Lightweight client-side bundling via `fflate` (~8KB, zero dependencies, zero network requests).
   - [x] Bundles `Conversation.md`, `Conversation.html`, `Sources_Bibliography.md`, and all captured `Studio_Notes/*.md` files into a single `.zip` archive.
   - [x] Download triggered directly via client-side Blob URL.

4. **100% Offline Local Pro Licensing:**
   - [x] Core full-conversation export remains 100% free and un-gated forever.
   - [x] Pro features (ZIP bundling and advanced frontmatter) are guarded by local Pro license state.
   - [x] Monetization is kept disabled during product demand validation.

---

## 7. Feature-Freeze Security Audit & Reproducible Live-Browser Protocol

**Execution Date:** October 21, 2026  
**Audit Scope:** Codebase Stabilization, Licensing Separation, Security Invariants, and Live-Browser Test Protocol  
**Automated Tests:** **58 / 58 Passing across 10 test suites (`npm test`)**  
**TypeScript Typecheck:** **0 errors (`tsc --noEmit`)**  
**Production Build:** Clean build (393ms), uncompressed size: **71.90 kB** (`.output/chrome-mv3`)  
**Production CWS Zip:** **26.26 kB** (`.output/citemark-gemini-notebook-exporter-0.1.0-chrome.zip`)

### 1. Security & Functional Verification Ledger

| Audit Check | Component | Method | Result | Findings & Guarantees |
|---|---|---|:---:|---|
| **Citation Mapping Integrity** | `src/modules/scanner/filter.ts` | Source inspection & unit tests (`tests/filter.test.ts`) | **PASS** | Turn filtering re-indexes `turnNumber` 1..M for sequential reading, but **never mutates `turn.citationIndices`**. Footnotes like `[^2]` remain strictly bound to Source 2, never shifting to Source 1 when Turn 1 is omitted. |
| **YAML Escaping Rigor** | `src/modules/converters/frontmatter.ts` | Source inspection & unit tests (`tests/frontmatter.test.ts`) | **PASS** | Double-quotes and escapes titles, aliases, tags, and custom metadata. Tags with colons (`ai:transformer`), quotes (`tag "with quotes"`), or newlines are safely quoted. Special characters and control chars are disarmed. |
| **ZIP Path & Content Integrity** | `src/modules/exporter/zip.ts` | Source inspection & unit tests (`tests/zip.test.ts`) | **PASS** | Archive contains valid relative paths without leading slashes or `..` directory traversal. Complete content for `Conversation.md`, `Conversation.html`, `Sources_Bibliography.md`. **Studio notes with empty/missing content or blank titles are discarded—zero empty or fabricated files.** |
| **Untrusted HTML & Print CSS** | `src/modules/converters/html.ts` | Source inspection & unit tests (`tests/html-converter.test.ts`) | **PASS** | All user and assistant text, source titles, excerpts, and scan reasons pass through `escapeHtml`. Script tags, event handlers (`onerror`, `onmouseover`), `javascript:` links, and iframes are disarmed. Print stylesheet contains `@media print` with `.no-print { display: none !important; }` and `page-break-inside: avoid`. |
| **Licensing Separation** | `src/entrypoints/popup/main.ts` & build artifacts | Automated inspection (`tests/licensing-separation.test.ts`) | **PASS** | `CITEMARK-PRO-2026` and `Quick Toggle Pro Mode` are **100% absent from production HTML and JS bundles**. Zero claims that local storage is secure payment verification. Monetization is completely disabled while validating demand. |
| **Network & Outbound Calls** | Manifest & production scripts | AST/regex audit (`tests/licensing-separation.test.ts`) | **PASS** | Zero `XMLHttpRequest`, zero `sendBeacon`, zero `WebSocket`, zero tracking/analytics (`google-analytics`, `mixpanel`, `sentry`). Scoped strictly to `notebook.google.com` and `notebooklm.google.com`. 100% local operation. |

---

### 2. Reproducible Live-Browser Test Protocol (Human Authenticated Verification)

Because automated unit tests run inside simulated JSDOM environments, **live-site extraction, complete citation mapping, ZIP downloads, and popup UI must be verified in a real browser session**. Follow these exact steps:

#### Step 1: Load Fresh Build in Chrome
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top-right switch).
3. If CiteMark was previously loaded, click **Remove** to ensure clean state.
4. Click **Load unpacked** and select:
   `c:\Users\sathw\Desktop\NotebookLM Extractor\.output\chrome-mv3`
5. Verify in the extension card:
   - Version: `0.1.0`
   - Permissions: Only asks for access to Google Notebook domains on click.

#### Step 2: Test Active Notebook Extraction
1. Open an authenticated tab at [https://notebooklm.google.com/](https://notebooklm.google.com/) and open a notebook with at least 2 uploaded PDF/DOC sources and a multi-turn conversation.
2. Click the **CiteMark** icon in the Chrome toolbar.
3. **Verify:**
   - The popup opens smoothly at 380px width without layout breakage.
   - The summary card displays the correct notebook title.
   - The metrics row accurately shows Turns, Sources, and Citations count.

#### Step 3: Test Selective Turn Filtering
1. Expand the **🎯 Select Inquiry Turns** drawer in the popup.
2. Deselect 1 or 2 turns.
3. **Verify:**
   - The turn count pill updates immediately (e.g. `2/4 Turns`).
   - The citation count pill recalculates dynamically based on the active turns.
   - Deselecting all turns displays the amber notice: *"Select at least one inquiry turn above to export"* and disables the Export button.
   - Clicking **Select All** re-enables all turns.

#### Step 4: Test Obsidian Markdown Export & YAML Frontmatter
1. Keep **📝 Obsidian Markdown (.md)** selected.
2. Expand the **⚙️ Obsidian Frontmatter** drawer and customize tags (e.g. `research, test-vault`).
3. Click **Export Research**.
4. Open the downloaded `.md` file in Obsidian or a text editor:
   - Verify the YAML header between `---` fences contains the title, date, URL, tags, and quantitative counts.
   - Verify turns are numbered sequentially `1..M` without numbering gaps.
   - Verify inline citations `[^1]` link to the Footnotes section at the bottom.
   - Verify footnote `[^1]` correctly names your uploaded source document.

#### Step 5: Test Research Archive (.zip) Export
1. In the popup, select **📦 Complete Research Archive (.zip)**.
2. Click **Export Research**.
3. Open the downloaded `.zip` file in your Downloads folder:
   - Verify archive contains `Conversation.md`, `Conversation.html`, and `Sources_Bibliography.md`.
   - If your notebook contains Studio notes with real text, verify they appear inside `Studio_Notes/*.md`.
   - Verify no empty files or ghost notes exist in the archive.

#### Step 6: Test Standalone Print HTML & Print-to-PDF
1. In the popup, select **📄 Print-Ready View (.html / PDF)**.
2. Click **Export Research**.
3. Open the downloaded `.html` file in Chrome:
   - Verify publication serif typography and headers render cleanly.
   - Click the **🖨️ Print / Save as PDF** button.
   - In Chrome's Print preview, verify the print button is hidden (`display: none`), turn cards do not break awkwardly across pages, and margins are formatted properly.


