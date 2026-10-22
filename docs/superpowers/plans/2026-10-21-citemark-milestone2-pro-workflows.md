# Implementation Plan: CiteMark Milestone 2 — Pro Workflows & Power Exports

**Document Status:** Approved Plan  
**Target Milestone:** Version 0.2.0 (Milestone 2)  
**Goal:** Deliver high-utility power researcher workflows: Selective Turn Filtering, Custom Obsidian YAML Frontmatter Engine, Studio Notes Batch ZIP Bundler, and a local Pro license manager.

---

## 1. Feature Specifications & Acceptance Criteria

### Feature 1: Selective Turn Filtering (Turn Pruning)
- **Goal:** Researchers often have conversational fluff, tangents, or re-prompts they do not want polluting their final Obsidian vault note.
- **Acceptance Criteria:**
  1. The popup includes an interactive "Select Turns" expandable section displaying all captured turns with role indicator and text snippet.
  2. "Select All" and "Clear All" toggle buttons allow rapid bulk adjustments.
  3. Deselecting turns excludes them from `.md`, `.html`, and Clipboard exports.
  4. Remaining exported turns are re-indexed seamlessly from 1 to M in chronological order without numbering gaps.
  5. Metrics pills (Turns, Citations) dynamically update when turns are toggled.

### Feature 2: Custom Obsidian YAML Frontmatter Engine
- **Goal:** Obsidian PKM users rely on structured frontmatter (YAML) for Dataview queries, note tags, aliases, and backlinks.
- **Acceptance Criteria:**
  1. Configurable YAML frontmatter generator supporting tags, aliases, date stamp, notebook URL, and source counts.
  2. Frontmatter is prepended at the very top of `.md` files between `---` fences.
  3. All values are escaped to prevent malformed YAML (quoted strings, valid YAML lists).
  4. Configuration is stored and remembered in `chrome.storage.local`.

### Feature 3: Studio Notes Scraper & Batch ZIP Bundler
- **Goal:** Gemini Notebook users generate notes, summaries, and guides in the "Studio" panel. Exporting them one by one is tedious.
- **Acceptance Criteria:**
  1. Scraper detects Studio notes (`artifact-library-note`, `.studio-panel`, `.artifact-stretched-button`).
  2. New export option: **📦 Complete Research Archive (.zip)**.
  3. Uses `fflate` client-side zip creation with zero external server upload.
  4. ZIP archive structure:
     - `Conversation.md` (with frontmatter & footnotes)
     - `Conversation_Print.html` (print-ready styling)
     - `Sources_Bibliography.md` (annotated list of uploaded papers)
     - `Studio_Notes/` (individual Markdown files for each Studio note)

### Feature 4: Pro Settings Drawer & Local License Manager
- **Goal:** Provide a local Pro settings panel allowing users to unlock and test power features without external billing overhead in the initial testing phase.
- **Acceptance Criteria:**
  1. Settings drawer in popup showing license status (`Standard` vs `⭐ CiteMark Pro Active`).
  2. Instant toggle / test key validation (`CITEMARK-PRO-2026`) stored in `chrome.storage.local`.
  3. Pro features (Batch ZIP & Custom Frontmatter) are clearly badged with ⭐ Pro indicator.
  4. Core conversation export remains 100% free and un-gated forever.

---

## 2. Architecture & File Manifest

| File | Role / Change |
|---|---|
| `src/types/index.ts` | Add `StudioNote`, `FrontmatterConfig`, `ProLicenseState`, update `NotebookSession` |
| `src/modules/converters/frontmatter.ts` | YAML serializer for Obsidian with token replacement and list handling |
| `src/modules/scanner/filter.ts` | Turn pruning and sequential re-indexing utility |
| `src/modules/exporter/zip.ts` | Multi-file ZIP bundler using `fflate` |
| `src/modules/converters/markdown.ts` | Integrate frontmatter options into Markdown serializer |
| `src/entrypoints/popup/index.html` | Add Turn filter list, Frontmatter editor, ZIP format option, and Pro drawer |
| `src/entrypoints/popup/style.css` | Styles for turn checklist, badges, settings drawer, and toggle switches |
| `src/entrypoints/popup/main.ts` | Wire up filtering, frontmatter config, zip generation, and license state |
| `tests/frontmatter.test.ts` | Unit tests for YAML generation, syntax validity, and token replacement |
| `tests/filter.test.ts` | Unit tests for turn filtering, re-indexing, and citation preservation |
| `tests/zip.test.ts` | Unit tests for client-side ZIP packaging and file structure |
