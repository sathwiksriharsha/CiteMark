# Microsoft Edge Add-ons Listing Package: CiteMark

**Product Name:** CiteMark: Gemini Notebook & NotebookLM Exporter  
**Version:** 0.1.0  
**Target Portal:** [Microsoft Partner Center (Edge Add-ons)](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)  
**Registration Cost:** **FREE** (No registration fee required)  
**Package File:** `.output/citemark-gemini-notebook-exporter-0.1.0-edge.zip` (or `.output/citemark-gemini-notebook-exporter-0.1.0-chrome.zip`)

---

## 1. Store Identity & Metadata

### Extension Name (45 characters)
```text
CiteMark: Gemini Notebook & NotebookLM Exporter
```

### Short Description (Max 150 characters)
```text
Export Gemini Notebook & NotebookLM chats to Obsidian Markdown with real footnotes, print-ready HTML, and complete research ZIPs.
```
*(Character count: 128 / 150)*

### Category
* Primary Category: **Productivity**

### Links
* **Support URL:** `https://github.com/sathwiksriharsha/CiteMark/issues`
* **Privacy Policy URL:** `https://github.com/sathwiksriharsha/CiteMark/blob/main/docs/PRIVACY_POLICY.md`
* **Website URL:** `https://github.com/sathwiksriharsha/CiteMark`

### Search Keywords / Tags (Up to 21 tags)
```text
notebooklm, gemini notebook, obsidian, markdown exporter, footnotes, citation export, research tool, pkm, logseq, print pdf, google notebook, citations, academic export, research archive, local privacy
```

---

## 2. Detailed Store Description (Plain Text for Microsoft Edge Add-ons)

```text
Export your Gemini Notebook (NotebookLM) research into your personal knowledge base—with 100% local privacy and unbroken citation attributions.

[Notice: CiteMark is an independent open-source productivity tool and is not affiliated with, endorsed by, or sponsored by Google LLC or Microsoft Corporation.]

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

CiteMark is an independent, open-source productivity tool developed to support researchers. CiteMark is not affiliated with, endorsed by, or sponsored by Google LLC or Microsoft Corporation. "Gemini", "NotebookLM", and "Google" are trademarks of Google LLC.
```

---

## 3. Notes for Certification (Reviewer Justifications for Microsoft Review Team)

When submitting in Microsoft Partner Center under **"Notes for certification"**, paste the following text:

```text
CiteMark is a privacy-first research productivity extension designed exclusively for researchers using Google Gemini Notebook / NotebookLM.

Single Purpose:
Allow researchers to locally extract and format their own multi-turn inquiry conversations and source citations into Obsidian Markdown, print-ready HTML, and research ZIP archives on their local machine.

Permissions Justification:
1. activeTab: Required to detect the active Gemini Notebook tab only when the user clicks the extension action icon.
2. scripting: Required to read the DOM nodes of the active notebook tab to extract user prompts, responses, and citations. All processing occurs locally within the tab sandbox.
3. storage: Required solely to save user export settings (preferred format, frontmatter configuration) locally in browser storage.
4. Host Permissions: Restricted to https://notebook.google.com/* and https://notebooklm.google.com/*. Does not run on any other domains.

Zero Telemetry / Privacy:
This extension has no external servers, makes zero network requests, contains no analytics or tracking code, and never transmits user notebook data anywhere. Full open-source audit is available at https://github.com/sathwiksriharsha/CiteMark.
```

---

## 4. Visual Store Assets

| Asset | Dimensions | Requirement | File Location |
|---|---|---|---|
| **Extension Store Logo** | 128 x 128 px | Transparent PNG | `public/icon-128.png` |
| **Promotional Tile (Optional)** | 440 x 280 px | PNG Showcase banner | `docs/assets/store-promo-440x280.png` |
| **Screenshots** | 1280 x 800 px (or 640x400) | Up to 10 screenshots | Browser screenshots of popup & exported markdown |
