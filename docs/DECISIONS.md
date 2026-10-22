# Architectural & Product Decision Log (DECISIONS.md)

**Document Status:** Audited & Approved (Phase 1.5 Gate)  
**Last Updated:** October 2026

---

## Decision 1: Beachhead Wedge Selection — The High-Integrity Research Vault Exporter
- **Status:** Revised & Accepted
- **Context:** Competitor research confirmed that Kortex (~100k users) focuses on web ingestion, ExportKit (~10k users) is a bloated multi-artifact exporter, and BibCit (~15k users) requires navigating to an external SaaS web app. Google's native Docs export only handles single notes and strips citation metadata.
- **Decision:** Build **CiteMark**, an ultra-fast, 100% in-browser extension specifically engineered for PKM researchers (Obsidian, Notion) and analysts. The core differentiator is **complete multi-turn conversation export into clean Markdown with full turn order and verified source document attribution**.
- **Alternatives Rejected:**
  - *Generic Multi-Artifact Swiss-Army Exporter:* High maintenance burden; prone to Google UI regressions.
  - *Full Academic CSL/BibTeX Exporter:* Technically unfeasible from the DOM alone without external APIs (see Decision 8).
- **Consequences:** We focus exclusively on conversation completeness, Obsidian Markdown fidelity, and source attribution.

---

## Decision 2: 100% Client-Side Local Processing for Core Functionality
- **Status:** Accepted
- **Context:** Target users handle proprietary documents, confidential drafts, and client data. Any tool transmitting text to an external server faces immediate rejection. Chrome Web Store policies enforce strict data minimization.
- **Decision:** All scraping, turn reconciliation, source mapping, and file serialization execute **100% locally within the browser sandbox**. Zero remote servers, zero external analytics/telemetry, zero user account creation.
- **Consequences:** User data never leaves their machine. Operating costs for infrastructure remain $0.

---

## Decision 3: Non-Invasive Browser Action Popup UI (No Canvas DOM Defacement)
- **Status:** Accepted
- **Context:** Several competitors inject custom buttons and sidebars directly into the NotebookLM canvas, leading to layout conflicts when Google updates its web application.
- **Decision:** The extension UI lives cleanly and exclusively inside the **standard Chrome toolbar action popup**. It does not inject persistent sidebars or modify Google's canvas DOM.
- **Consequences:** Low maintenance surface; immune to in-page visual regressions.

---

## Decision 4: Progressive Reconciliation Scanner for Lazy-Loaded Chats
- **Status:** Accepted
- **Context:** Conversations spanning 20+ turns are virtualized by modern web apps. Naive single-pass DOM queries silently drop unmounted turns, leading to truncated files.
- **Decision:** Implement a **Progressive Reconciliation Scanner** that traverses conversation scroll containers, reconciles turn IDs into memory, and verifies completeness before unlocking the export button.
- **Consequences:** Eliminates the major defect of prior art (`"Download failed: No content downloaded"`).

---

## Decision 5: Two-Tier Degradation Hierarchy for Citation Attribution
- **Status:** Accepted
- **Context:** Gemini Notebook renders inline citation chips. Excerpt text is often rendered on-demand when clicked.
- **Decision:** Structured degradation hierarchy:
  - **Tier 1 (Optimal):** Footnote includes Source Document Title + Excerpt Quote (when present in loaded DOM state).
  - **Tier 2 (Fallback):** Footnote includes Source Document Title + Citation Index (mapped against the loaded Source Shelf on the left panel).
  - Inline markers are *never* left as dead, unlinked numbers.
- **Consequences:** Resilient citation capture without relying on fragile simulated hover events.

---

## Decision 6: Dual-Format Output (Obsidian GFM Markdown + Print-Ready HTML/PDF)
- **Status:** Accepted
- **Context:** PKM users require clean Markdown, while non-Markdown professionals need clean documents ready for sharing.
- **Decision:** CiteMark provides dual-format output:
  1. `.md` download: Clean GFM format with valid footnotes (`[^1]`), callouts, tables, and frontmatter.
  2. Standalone HTML / Print-Ready View: Typeset with scholarly typography and print CSS for instant native "Save as PDF".
- **Consequences:** Zero external binary dependencies (no Pandoc/Node bloat); instant local generation.

---

## Decision 7: Dual-Branding Discoverability Strategy
- **Status:** Accepted
- **Context:** Google rebranded NotebookLM to Gemini Notebook on July 16, 2026, but community forums and user queries heavily retain "NotebookLM".
- **Decision:** Extension title: *CiteMark for Gemini Notebook (NotebookLM Exporter)*. Keywords cover both terms to capture legacy and forward-looking intent.

---

## Decision 8: Decoupling Citation Feasibility & Bounding Scope (Capabilities A & B vs C)
- **Status:** Accepted (Phase 1.5 Addition)
- **Context:** The Phase 1.5 audit revealed that Gemini Notebook's DOM treats uploaded PDFs/docs as unstructured text chunks and **does not parse or store formal bibliographic schemas (author, publication year, journal, DOI)**.
- **Decision:** CiteMark strictly bounds its scope to **Capability A (Inline Marker Preservation)** and **Capability B (Source Document Name & Excerpt Attribution)**. We explicitly reject fabricating author names or DOIs from the DOM alone. Formal academic bibliography generation (Capability C) is classified as an external capability requiring third-party APIs (Crossref/OpenAlex), which is out of scope for the local MVP.
- **Consequences:** Preserves absolute scientific integrity; avoids false product claims.

---

## Decision 9: Two-Phase Commercial Roadmap — Defer Payment Code from Milestone 1
- **Status:** Accepted (Phase 1.5 Refinement)
- **Context:** The long-term business objective is to generate revenue, but building payment infrastructure before proving core utility creates wasted engineering overhead. Furthermore, early users must adopt the product and trust its export fidelity before evaluating paid upgrades.
- **Decision:** 
  1. **Milestone 1 Excludes Payment Integration:** Milestone 1 delivers a 100% free, un-gated, local exporter. The explicit engineering goal is proving product-market need: active adoption, export completion reliability, repeat usage, and unprompted recommendations.
  2. **Milestone 2 Monetization (Post-Adoption Gate):** If and only if Milestone 1 passes adoption thresholds (>40 active test users, repeat exports, zero critical DOM failures), we will test willingness to pay and integrate a one-time "Pro" lifetime license ($14 via ExtensionPay or LemonSqueezy) for advanced power features (custom Obsidian frontmatter, selective turn filtering, batch studio note bundling).
  3. **Interest vs Purchase Distinction:** Email pre-registrations and landing page waitlists are treated strictly as top-of-funnel interest metrics, *never* as proof of actual purchases. Real willingness to pay is only confirmed when live commercial transactions clear.
- **Consequences:** Eliminates premature billing code; keeps the initial release lightweight, transparent, and focused entirely on core user adoption.

---

## Decision 10: Milestone 2 Architecture — Selective Filtering, Offline ZIP Bundling, and Local Pro Gating
- **Status:** Accepted (Milestone 2 Delivery)
- **Context:** Following Milestone 1 verification, power researchers requested selective turn exports, Obsidian YAML frontmatter, and complete archive downloads (including Studio notes and bibliography).
- **Decision:**
  1. **Selective Turn Filter Re-Indexing:** Filtered turns are strictly re-indexed sequentially `1..M` without numbering gaps, while preserving authentic chronological sequence. Referenced citation indices are dynamically re-calculated from the active subset.
  2. **Zero-Dependency In-Memory ZIP Bundling (`fflate`):** Chose `fflate` (~8KB) over heavy alternatives (JSZip is ~100KB+). Generates multi-artifact research archives (`Conversation.md`, `Conversation.html`, `Sources_Bibliography.md`, `Studio_Notes/*.md`) completely client-side.
  3. **100% Offline Local Pro Model:** Free core exports remain 100% free and un-gated forever. Pro power features (ZIP archiving and advanced frontmatter customization) are validated strictly offline via `chrome.storage.local` with zero external network requests or telemetry. Accepts local test keys (e.g. `CITEMARK-PRO-2026`) and provides a 1-click test toggle.
- **Consequences:** Absolute compliance with user privacy rules and zero network overhead; bundle size remains under 76 kB.
