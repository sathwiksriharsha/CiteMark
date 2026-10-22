# Chrome Web Store Listing Package: CiteMark

**Product Name:** CiteMark for Gemini Notebook (NotebookLM Exporter)  
**Package Status:** Production Ready (Manifest V3)  
**Target Category:** Productivity / Workflow & Planning  
**Target Chrome Web Store Policy Version:** 2026 Developer Program Policies

---

## 1. Store Title & Identity

### Store Title (Limit: 45 characters)
```text
CiteMark: Gemini Notebook & NotebookLM Exporter
```
*(Character count: 45 / 45)*

*Policy Rationale:* Complies strictly with Google's Trademark & Developer Program Guidelines. Avoids false affiliation by using the standard format *"CiteMark: [Service] Exporter"*. Covers both the official brand *"Gemini Notebook"* and legacy search query *"NotebookLM"* without keyword stuffing.

### Short Summary Description (Limit: 132 characters)
```text
Export Gemini Notebook & NotebookLM chats to Obsidian Markdown with real footnotes, print-ready HTML, and complete research ZIPs.
```
*(Character count: 128 / 132)*

---

## 2. Detailed Store Description (Plain Text Formatted for CWS)

```text
Export your Gemini Notebook (NotebookLM) research into your personal knowledge base—with 100% local privacy and unbroken citation attributions.

[Notice: CiteMark is an independent open-source productivity tool and is not affiliated with, endorsed by, or sponsored by Google LLC or Alphabet Inc.]

Google's Gemini Notebook is incredible for querying research papers, documents, and notes. But getting multi-turn inquiries out into Obsidian, Notion, or printable documents has been broken:
• Native Google Docs exports drop conversation turns and only export single notes.
• Citation chips get flattened into dead unlinked numbers [1] with no link to the underlying source document.
• Virtualized conversations get cut off or truncated.

CiteMark solves this in one click—100% locally on your machine with zero data transmission.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 1. OBSIDIAN-READY GFM MARKDOWN
• Full multi-turn conversation export in authentic chronological sequence.
• Real GitHub-Flavored Markdown footnotes ([^1]) mapped directly to your uploaded source document titles and excerpts.
• Fully customizable YAML Frontmatter (tags, aliases, date, quantitative turn/source metadata) ready for Obsidian and Logseq.

📄 2. PUBLICATION-GRADE PRINT & PDF VIEW
• Formatted with scholarly serif typography, elegant headers, and high-readability margins.
• Native @media print styling for instant 1-click "Save as PDF" briefings ready to share with clients or colleagues.

🎯 3. SELECTIVE INQUIRY TURN FILTER
• Interactive turn drawer lets you select only the specific prompts and answers you want.
• Automatically re-indexes turns sequentially (1..M) with no numbering gaps.
• Dynamic citation count calculation ensures only referenced sources are included.

📦 4. COMPLETE RESEARCH ARCHIVE (.ZIP)
• Bundles your entire research session into a clean ZIP archive:
  - Conversation.md (Full markdown with YAML frontmatter)
  - Conversation.html (Print-ready publication layout)
  - Sources_Bibliography.md (Dedicated source index with excerpts)
  - Studio_Notes/*.md (Individual markdown files for all Studio notes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRIVACY BY DESIGN — 100% LOCAL PROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your research is private, proprietary, and confidential. CiteMark is built with a zero-trust local-only architecture:
• 100% client-side execution in your browser sandbox.
• ZERO remote servers or backend infrastructure.
• ZERO telemetry, analytics packets, or tracking scripts.
• ZERO user account requirements.
• ZERO AI API keys required.
• Your notebook text, documents, prompts, and notes NEVER leave your device.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERMISSION JUSTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CiteMark requests the absolute minimum permissions required to function:
• activeTab: Used solely to read the current tab when you explicitly click the CiteMark extension icon.
• scripting: Used to reconcile lazy-loaded chat turns and source document names from the active notebook.
• storage: Used exclusively to save your export format preference and frontmatter settings locally on your machine.

CiteMark does NOT read your browsing history, run on arbitrary websites, or access external tabs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CiteMark is an independent, open-source productivity tool developed to support researchers. CiteMark is not affiliated with, endorsed by, or sponsored by Google LLC or Alphabet Inc. "Gemini", "NotebookLM", and "Google" are trademarks of Google LLC.
```

---

## 3. Single-Purpose & Permissions Justification (For CWS Review Team)

When submitting to the Chrome Web Store Developer Dashboard, the reviewer requires an explicit explanation for every requested permission. Use the following exact justifications:

### Single Purpose Description:
> "CiteMark has a single, dedicated purpose: to allow researchers to locally extract and format their own multi-turn inquiry conversations and source document citations from Gemini Notebook (NotebookLM) into Markdown, HTML, and ZIP archives on their local device."

### Permission Justification Declarations:
1. **`activeTab`**:
   > *"Required to detect the user's active Gemini Notebook URL and initiate extraction only when the user explicitly clicks the extension action icon in the toolbar. The extension never runs in the background on inactive tabs."*
2. **`scripting`**:
   > *"Required to inspect the DOM of the active Gemini Notebook tab to reconcile conversation turns, source shelf document titles, and citation chips into structured export formats. All processing occurs locally within the tab sandbox."*
3. **`storage`**:
   > *"Required solely to store the user's export preferences (preferred format: Markdown/HTML/ZIP, and Obsidian YAML frontmatter settings) locally in `chrome.storage.local`. No personal data or notebook contents are stored."*
4. **Host Permissions (`*://notebook.google.com/*`, `*://notebooklm.google.com/*`)**:
   > *"Strictly scoped to the official web domains of Gemini Notebook / NotebookLM. The extension cannot run or inspect content on any other website."*

---

## 4. Visual Store Assets Specifications

| Asset | Dimensions | Requirement / Guidelines | File Location / Spec |
|---|---|---|---|
| **Small Tile Icon** | 128 x 128 px | Transparent PNG, crisp high-res brand icon | `public/icon-128.png` |
| **Store Marquee Tile** | 440 x 280 px | High-contrast showcase graphic, 1 clear value proposition | `docs/assets/store-promo-440x280.png` |
| **Screenshot 1: The Core Solution** | 1280 x 800 px | Split-view: Active Gemini Notebook chat alongside exported Obsidian Markdown showing footnotes | `docs/assets/screenshot-1-obsidian-export.png` |
| **Screenshot 2: Selective Turn Filter** | 1280 x 800 px | Popup open on real chat with interactive checkboxed turns and live citation pills | `docs/assets/screenshot-2-turn-filter.png` |
| **Screenshot 3: Print-Ready HTML & PDF** | 1280 x 800 px | Publication-grade serif styling with formatted bibliography | `docs/assets/screenshot-3-print-html.png` |
| **Screenshot 4: Research Archive (.zip)** | 1280 x 800 px | Unzipped folder structure: Conversation, Sources, and Studio Notes | `docs/assets/screenshot-4-zip-archive.png` |
| **Screenshot 5: 100% Local Privacy** | 1280 x 800 px | Privacy graphic: zero telemetry, zero servers, local-only processing | `docs/assets/screenshot-5-privacy-local.png` |
