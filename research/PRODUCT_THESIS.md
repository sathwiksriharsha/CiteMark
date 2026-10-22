# Product Thesis: The High-Integrity Research Vault Exporter

**Working Product Name:** **CiteMark for Gemini Notebook** (*NotebookLM Research & Citation Exporter*)  
**Status:** Audited & Feasibility-Bounded (Phase 1.5 Gate)  
**Date:** October 2026

---

## 1. Target Beachhead Segment

**Primary Target:**  
**PKM Power Users (Obsidian, Notion, Logseq), Academic Researchers, and Technical Analysts** who use Gemini Notebook (formerly NotebookLM) to interrogate collections of 5–50 source documents and need to move complete research conversations into their personal knowledge vaults.

**Behavioral Profile & Constraints:**
- They rely on Gemini Notebook specifically because it grounds AI syntheses in their uploaded files.
- They maintain their notes in Markdown-first tools or local folders.
- They refuse to use extensions that require account creation, cloud syncing, or broad host permissions due to strict document confidentiality (unpublished research, legal briefs, proprietary data).
- They want a fast, zero-friction, one-click browser tool that saves directly to local disk.

---

## 2. The Primary Job-to-be-Done

> **When I** finish an extensive multi-turn research inquiry in Gemini Notebook across my uploaded documents,  
> **I want to** export the complete conversation as clean, structured Markdown or a publication-ready PDF where all inline citations (`[1]`, `[2]`) are mapped to the verified source document filenames and available excerpt quotes,  
> **So that I can** immediately drop the synthesis into my Obsidian vault or share it as an executive memo, without losing conversation turn order or spending time manually cross-referencing which document each insight came from.

---

## 3. The Differentiated Value Proposition

**"Export your Gemini Notebook research into clean Obsidian Markdown with full turn order and verified source attribution—100% locally in one click."**

### Differentiation vs Existing Alternatives
1. **vs Native Google Gemini Notebook ("Export to Docs"):**
   - Google only exports single studio notes, leaving interactive multi-turn exploration chats trapped in the chat container.
   - Google strips citation hover metadata, leaving dead, unlinked numbers `[1]`.
   - Google has zero native export to Markdown, Obsidian, or local clean files.
2. **vs Kortex NotebookLM (~100k users, $4.92/mo):**
   - Kortex is an ingestion/curation platform (clipping web pages, YouTube, and ChatGPT into NotebookLM). Export is a secondary feature.
   - Kortex requests broad host permissions and focuses on folder organization rather than Markdown fidelity.
3. **vs NotebookLM ExportKit (~10k users, Free AGPLv3):**
   - ExportKit is a complex Swiss-army toolkit with 8+ export types (Anki, mind maps, quizzes, Drive, Notion).
   - Injects heavy, invasive buttons into the notebook canvas.
   - Users report failure on long, virtualized conversations (`"Download failed: No content downloaded"`).
4. **vs BibCit / MassiveMark (~15k users):**
   - BibCit requires users to leave the tab, paste text into an external cloud web application (`massivemark`), and format it remotely.
   - CiteMark executes 100% locally inside the active browser tab with zero external web-app hops.

---

## 4. Bounded Technical Scope: What Is Feasible vs Excluded

### Capabilities Included (Feasible from Local DOM):
- **Capability A (Inline Marker Preservation):** Parses inline citation chips (`1`, `2`) and formats them cleanly into Markdown footnotes (`[^1]`) and HTML superscripts.
- **Capability B (Source Record & Excerpt Attribution):** Maps citation chips to the active Source Registry on the left panel (Document Filename, File Type) and captures referenced excerpt quotes where present in loaded DOM state.
- **Progressive Lazy-Load Reconciliation:** Progressively scrolls and verifies conversation turn counts, guaranteeing zero dropped turns on long conversations.

### Capabilities Deliberately Excluded (Feasibility & Non-Goal Boundaries):
- **NO Fabricated Bibliographic Data (Capability C):** We will NOT promise automated APA/MLA/BibTeX references with authors, publication years, and DOIs from the DOM alone, because Gemini Notebook does not parse or store this metadata.
- **NO Cloud Sync or Third-Party OAuth:** No Google Drive or Notion API integrations. All exports are saved directly to the user's local disk.
- **NO Canvas UI Defacement:** Operates strictly via the Chrome action popup; zero injected banners or buttons that could break when Google updates page CSS.

---

## 5. Commercial Roadmap & Phased Trust Model

To achieve long-term viability while maintaining user trust, CiteMark executes a two-phase roadmap:

### Milestone 1: The Adoption Engine (100% Free & Local)
- **Zero Payment Code:** Milestone 1 explicitly excludes all payment gateways, checkout forms, and license enforcement.
- **The Core Question:** Do researchers need this product badly enough to install it, use it repeatedly, and rely on it for their vaults?
- **Features Included:** Full multi-turn conversation export to clean GFM Markdown and basic HTML; source document attribution; resilient lazy-load scanner. 100% local, no email wall, no accounts.

### Milestone 2: Pro Workflows & Monetization (Post-Adoption Gate)
*Triggered only after Milestone 1 achieves verified user adoption (>40 active test users, repeat exports, zero critical DOM failures):*
- **Pro Tier ($14 One-Time Lifetime License):** Advanced power-user features:
  1. *Obsidian Frontmatter & Template Engine:* Customizable YAML frontmatter (tags, date, notebook title, custom aliases).
  2. *Selective Turn Filtering:* Checkbox UI to exclude specific prompt/response turns before export.
  3. *Publication-Grade Print/PDF Theme:* Academic serif typography, margin controls, and clean header/footer formatting for executive sharing.
  4. *Batch Studio Bundler:* Single-click ZIP export of all Studio notes alongside the active conversation.
- **Payment Architecture:** Handled via **ExtensionPay** or **LemonSqueezy** client-side license verification. Zero custom backend servers.

### Financial Cost Structure:
- Chrome Web Store Developer Fee: $5 (one-time).
- Static Landing Page & Domain (`citemark.dev` or similar): ~$15/year.
- Payment Gateway Fee: ~5% + $0.50 per Pro purchase (Milestone 2 only).
- Server Hosting: $0 (100% client-side extension; landing page hosted on GitHub/Cloudflare Pages).

---

## 6. Seven-Day Validation Experiment Plan

### Objective & Channels:
Test initial workflow demand and qualitative interest among PKM power users and researchers before completing full implementation.
- **Target Communities:** Reddit (`r/notebooklm`, `r/ObsidianMD`, `r/academia`), Obsidian Discord, and academic Twitter/Bluesky.

### The 45-Second Demo Video:
1. **Seconds 0–15 (The Pain):** Shows a 20-turn Gemini Notebook research chat. Tries native "Save to note" (painful turn-by-turn clicking) and native Docs export (dead unlinked bracket numbers `[1]`).
2. **Seconds 15–30 (The Solution):** Opens CiteMark popup, clicks *"Export to Obsidian"*. Shows progressive scan verifying all 20 turns in 2 seconds.
3. **Seconds 30–45 (The Outcome):** Drops the exported `.md` file into Obsidian. Shows pristine headings, formatted tables, and inline footnotes linking directly to the uploaded source PDF names and quotes at the bottom. Displays callout: *"100% local. Zero accounts."*

### Testing Interest vs Purchase Proof:
- **Interest Metric (Pre-Registration):** Landing page features an early-bird waitlist (*"Enter your email to test the free beta and get early access to Pro"*).  
  > [!IMPORTANT]
  > **Methodological Standard:** Email pre-registrations measure top-of-funnel *interest* and contact willingness; they are **NOT proof of purchases**. True willingness to pay can only be verified in Milestone 2 when users are asked to execute a real financial transaction.

### Pre-Committed Decision Thresholds:
| Metric | GO Threshold (Milestone 1 Build) | REVISE Threshold | STOP Threshold |
|---|---|---|---|
| **Free Beta Install Requests** | **>40 qualified researcher requests** | 15–40 requests | <15 requests |
| **Early-Bird Interest Signups** | **>15 email signups** | 5–14 signups | <5 signups |
| **Falsification Signal** | Strong demand for local Markdown export | Demands for other formats (e.g. Word) | >30% state: *"Google Docs export is completely sufficient for my workflow"* |

---

## 7. Evidence Status: Researched vs Tested vs Unknown

To ensure strict factual integrity, all project assumptions are cataloged into three transparent categories:

### 1. What Was Researched (Public Data & Ecosystem Analysis)
- **Google Platform Direction:** Verified renaming to Gemini Notebook on July 16, 2026; addition of PPTX and Docs/Sheets export; confirmed lack of full-chat export.
- **Competitor Landscape:** Verified metrics on Chrome Web Store: Kortex (~100k users, $4.92/mo, ingestion focus), ExportKit (~10k users, free, multi-artifact), BibCit (~15k users, external SaaS converter), AnkiNLM (~7k users, flashcards).
- **Public User Complaints:** Documented pain around dead bracket citations `[1]`, copy-paste formatting breakage, and lazy-load failures in existing scrapers.
- **Chrome Web Store Policies:** Verified Single Purpose Principle and Limited Use data minimization rules.

### 2. What Was Directly Tested (Technical Verification)
- **Gemini Notebook DOM Inspection:** Directly audited the DOM on live/recorded notebook sessions. Verified that inline citation chips expose numeric indices and link to loaded chunk views.
- **Bibliographic Metadata Absence:** Directly verified that Gemini Notebook **does not expose `author`, `publication_year`, or `doi`** in its DOM or client state.
- **Markdown & Footnote Formatting:** Directly tested GFM footnote syntax (`[^1]: [Filename] — excerpt`) in Obsidian parser; verified clean rendering without syntax errors.

### 3. What Remains Unknown (Unresolved Hypotheses & Risks)
- **Real-World Organic Adoption Rate:** While qualitative complaints are high, the exact percentage of active Gemini Notebook users who will install an un-marketed Chrome extension is unknown.
- **Long-Term User Retention:** Unknown whether users will export once per notebook or use the extension daily across dozens of sessions.
- **Actual Commercial Conversion Rate:** While users express interest, the true willingness to pay $14 for Milestone 2 Pro features remains unproven until real transactions are offered.
- **Future Google UI Volatility:** Unknown when or how drastically Google will refactor Gemini Notebook's internal Web Components or class names in future quarters.
