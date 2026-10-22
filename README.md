# CiteMark: Gemini Notebook & NotebookLM Exporter

[![Tests](https://img.shields.io/badge/tests-50%20passed-success)](tests/)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)](wxt.config.ts)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20local-green)](docs/PRIVACY_POLICY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Export your Gemini Notebook & NotebookLM research into your personal knowledge base—with 100% client-side privacy, unbroken footnotes, and complete session archives.**

*Disclaimer: CiteMark is an independent open-source productivity tool. It is not affiliated with, endorsed by, or sponsored by Google LLC or Alphabet Inc.*

---

## The Problem: The "Footnote Graveyard"

Google's Gemini Notebook (formerly NotebookLM) is one of the most powerful tools for synthesizing multi-document research. However, getting your research *out* into personal knowledge vaults like **Obsidian**, **Notion**, or **Logseq** is broken:

1. **Trapped Conversations:** Native exports only save individual Studio notes. Multi-turn exploratory inquiry conversations cannot be exported in full.
2. **Unlinked Citation Chips:** Native Google Docs exports drop citation links, turning them into dead bracketed numbers `[1]` with no reference to the underlying PDF or document.
3. **Cloud Privacy Risks:** Existing multi-tool converters require uploading your research text to third-party cloud servers.

## The Solution: CiteMark

CiteMark runs **100% inside your browser**. In one click, it extracts your complete multi-turn conversation, maps all citation chips to your actual uploaded source document titles, and outputs clean, vault-ready files:

| Feature | Native Google Docs Export | Generic Web Exporters | **CiteMark** |
|---|:---:|:---:|:---:|
| **Full Multi-Turn Chats** | ❌ Studio notes only | ⚠️ Frequent truncation | **✅ Complete verified sequence** |
| **Footnote Attribution** | ❌ Dead unlinked text `[1]` | ⚠️ Often stripped | **✅ GFM Footnotes `[^1]` mapped to sources** |
| **Obsidian YAML Frontmatter** | ❌ None | ❌ None | **✅ Tags, aliases & quantitative counts** |
| **Selective Turn Filter** | ❌ None | ❌ None | **✅ Deselect turns + sequential re-index** |
| **Multi-Artifact ZIP Bundler** | ❌ None | ❌ None | **✅ Chat, HTML, Sources & Studio Notes** |
| **100% Local (Zero Servers)** | ⚠️ Google Cloud | ❌ Transmits to external APIs | **✅ 100% Client-Side Sandbox** |

---

## Before & After Export Example

### In Gemini Notebook (Raw UI):
> *"Attention mechanisms allow models to focus on relevant tokens [1] while scaling efficiently [2]."*

### In Exported Obsidian Markdown:
```markdown
---
title: "Neural Attention & LLM Architectures Research"
date: 2026-10-21
url: "https://notebooklm.google.com/notebook/..."
tags:
  - gemini-notebook
  - research
sources_count: 2
turns_count: 4
---

# Neural Attention & LLM Architectures Research

### 👤 User (Turn 1)
How does multi-head attention scale compared to recurrent networks?

---

### 🤖 Gemini Notebook (Turn 2)
Attention mechanisms allow models to focus on relevant tokens [^1] while scaling efficiently [^2].

---

### 📌 Footnotes & Excerpts
[^1]: **Attention_Is_All_You_Need.pdf** — *"The dominant sequence transduction models are based on complex recurrent or convolutional neural networks."*
[^2]: **FlashAttention_Fast_Memory_Efficient.pdf** — *"FlashAttention scales linearly with sequence length by tiling IO blocks."*

---

## 📚 Sources Cited
1. **Attention_Is_All_You_Need.pdf** (PDF)
2. **FlashAttention_Fast_Memory_Efficient.pdf** (PDF)
```

---

## Key Features

- 📝 **Obsidian GFM Markdown:** Clean GitHub-Flavored Markdown with valid footnote definitions (`[^1]`), sanitized markdown tables, code syntax blocks, and configurable YAML frontmatter.
- 📄 **Print-Ready Publication View:** Beautiful serif scholarly typography formatted with `@media print` rules for instant native Print-to-PDF memos.
- 🎯 **Selective Inquiry Turn Filter:** Filter out irrelevant prompt turns before export. Turns are automatically re-indexed `1..M` with zero numbering gaps.
- 📦 **Complete Research Archive (.zip):** Bundles `Conversation.md`, `Conversation.html`, `Sources_Bibliography.md`, and all `Studio_Notes/*.md` using pure client-side `fflate`.
- 🔒 **100% Zero-Trust Local Architecture:** Zero external servers, zero analytics, zero telemetry, zero account requirements. Your confidential research documents and prompts never leave your browser.

---

## Quick Setup (Load Unpacked in Chrome)

1. Clone or download this repository.
2. Ensure dependencies are installed and the build is generated:
   ```bash
   npm install
   npm run build
   ```
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the `.output/chrome-mv3` folder inside this directory.
6. Navigate to any active [Gemini Notebook](https://notebooklm.google.com) tab and click the **CiteMark** icon in your browser toolbar!

---

## Developer Commands

```bash
# Run all unit tests (50 tests passing across 9 test suites)
npm test

# Run strict TypeScript typecheck
npm run typecheck

# Build Manifest V3 Chrome extension bundle
npm run build
```

---

## Documentation

- [Chrome Web Store Listing Copy & Justifications](docs/CHROME_STORE_LISTING.md)
- [Privacy Policy](docs/PRIVACY_POLICY.md)
- [30-Day Distribution & Validation Plan](docs/DISTRIBUTION_PLAN.md)
- [Architectural Decision Log (DECISIONS.md)](docs/DECISIONS.md)
- [Product Requirements Document (PRD.md)](docs/PRD.md)
- [Quality Assurance & Verification Log (QA_LOG.md)](research/QA_LOG.md)
