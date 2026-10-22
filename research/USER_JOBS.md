# User Jobs-To-Be-Done (JTBD) & Feasibility-Bounded Analysis

**Document Status:** Audited & Feasibility-Bounded (Phase 1.5 Gate)  
**Evidence Grounding:** Derived from audited Reddit discussions, GitHub issue trackers, and technical DOM verification of Gemini Notebook.

---

## 1. Targeted User Segments

### Segment 1: PKM Power Users & Knowledge Workers (Obsidian / Notion / Logseq)
- **Primary Need:** Move multi-turn research inquiries from Gemini Notebook into an Obsidian research vault or Notion database with zero manual cleanup.
- **Critical Requirements:** Clean GitHub-Flavored Markdown (GFM), structured turn order (User vs Assistant), preserved tables/code blocks, and valid footnote syntax (`[^1]`).
- **Privacy Sensitivity:** High. Refuses cloud-synced extensions that require account creation or broad permissions.

### Segment 2: Academic Researchers, PhDs & Postgrads
- **Primary Need:** Synthesize 10–50 uploaded papers and export the synthesis with full source traceability.
- **Pain Point:** Gemini Notebook's native Docs export turns citations into unlinked numbers `[1]`, stripping source document titles and excerpt quotes.
- **Crucial Feasibility Boundary:** While researchers desire full APA/BibTeX reference lists (Capability C), Gemini Notebook's DOM does not contain author, year, or DOI metadata. What can be authentically provided from the DOM is **traceable source document attribution** (Source File Name, Section/Chunk Index, and Excerpt Quote).

### Segment 3: Executive Analysts & Technical Writers
- **Primary Need:** Export a multi-turn deep dive as a self-contained, publication-ready research memo or PDF to share with team members who do not have access to the private notebook.
- **Critical Requirements:** Clean typography, print-friendly stylesheet, and clear turn-by-turn dialogue structure.

---

## 2. Decoupled Citation Feasibility Framework (A vs B vs C)

To ensure technical integrity, user jobs must distinguish between three distinct technical capabilities:

```
[ Capability A: Marker Preservation ]  ==>  Extract inline [1] as [^1]
             │
             ▼
[ Capability B: Source Record Mapping ]  ==>  Map [^1] to "Source Title.pdf" + loaded excerpt quote
             │
             ▼
[ Capability C: Scholarly Bibliography ] ==>  Generate APA/MLA/BibTeX with Author, Year, DOI
                                              (REQUIRES EXTERNAL API - NOT IN DOM)
```

### Capability A: Preserving Original Inline Citation Markers
- **Definition:** Detecting inline citation chips/pills in assistant responses and converting them into standard Markdown footnotes (`[^1]`) or HTML superscripts (`<sup>[1]</sup>`).
- **Technical Feasibility:** **100% Feasible.** Inline chips are rendered as interactive buttons with numeric labels directly in the assistant turn DOM.
- **Value:** Prevents citation numbers from merging into body text as ambiguous numbers; establishes standard syntax for Markdown previewers.

### Capability B: Mapping Markers to Notebook Source Records
- **Definition:** Mapping each citation marker `1` to its corresponding uploaded source document (e.g. `Attention_Is_All_You_Need.pdf`) and the specific text excerpt referenced.
- **Technical Feasibility:** **Feasible (with constraints).**
  - *Source Document Titles:* 100% available via the notebook's Sources shelf (`role="region"` / source item containers).
  - *Excerpt Text:* Visible when a user views or snaps to a citation chunk. Can be extracted where present in the DOM cache.
  - *Fallback:* When excerpt text is deferred or unmounted, the system maps the citation directly to the Source Document Title and Index.
- **Value:** Eliminates the "Footnote Graveyard". The user immediately knows *which* uploaded paper or document generated the insight.

### Capability C: Producing Formal Scholarly Bibliographies (Authors, Dates, DOIs, BibTeX/APA)
- **Definition:** Synthesizing formal citation strings (e.g. `Vaswani, A. et al. (2017). Attention is All You Need. NeurIPS. https://doi.org/...`).
- **Technical Feasibility:** **NOT FEASIBLE FROM THE DOM ALONE.**
  - Gemini Notebook does not parse or store bibliographic metadata fields (author, year, DOI) in its DOM or client state.
  - Generating Capability C requires either:
    1. Calling third-party academic APIs (Crossref, Semantic Scholar, OpenAlex), which introduces network latency, rate limits, API keys, and privacy leakage; OR
    2. Parsing structured filenames provided by the user (e.g., `Author_Year_Title.pdf`); OR
    3. LLM hallucination (strictly unacceptable for academic rigor).
- **Architectural Boundary Decision:** The MVP **strictly bounds its promise to Capability A and Capability B**. We will explicitly describe footnotes as **Source Document Attributions** (`[^1]: Attention_Is_All_You_Need.pdf — "excerpt quote"`), and will NOT make false claims of generating full automated APA bibliographies with DOIs from the DOM alone.

---

## 3. Audited Jobs-to-be-Done (JTBD)

### Job 1: The High-Integrity Research Vault Exporter (Primary Winning Job)
> **When I** finish an intensive 15–30 turn research inquiry in Gemini Notebook across my uploaded documents,  
> **I want to** export the complete conversation into a clean Obsidian-ready Markdown note with all inline citations compiled into attributed document footnotes (`[^1]: [Document Name] — "excerpt"`),  
> **So that I can** immediately drop the synthesis into my second brain without losing conversational turn order or having to manually cross-reference which document each claim came from.

- **Urgency:** High (Experienced after every long research session).
- **Frequency:** Multiple times per week.
- **Current Alternatives:** 
  - Google Docs export (Only exports single notes; leaves citations unlinked).
  - Manual copy-pasting (Strips formatting, breaks turn order).
  - BibCit (Forces user to navigate to external SaaS website).
  - ExportKit (Cluttered UI, reports of lazy-load failures on long chats).
- **Why Alternatives Fall Short:** No existing tool offers a fast, 100% local, one-click in-tab export specifically engineered for clean Markdown vaults and verified source attribution.

### Job 2: The Executive Research Dossier (Secondary Job)
> **When I** need to share findings from a proprietary research notebook with colleagues who lack access,  
> **I want to** export a clean, publication-styled HTML/PDF report that clearly separates prompts from grounded syntheses and appends a verified source document index,  
> **So that I can** send a professional briefing document without manual formatting in Google Docs or Word.

- **Urgency:** Medium.
- **Frequency:** Weekly / milestone-driven.
- **Current Alternatives:** Stitching multiple Google Docs manually; raw browser printing (which prints UI buttons and sidebars).
- **Why Alternatives Fall Short:** Native browser print captures messy web application chrome; existing extensions produce raw unstyled dumps.
