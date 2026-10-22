# Initial evidence seed (verify all of this during discovery)

**Prepared:** 2026-10-20. This is a starting hypothesis set, not a complete market report. The team must independently revisit the linked pages because the product, competitor capabilities, and sites may change.

## Naming and ecosystem

- Google announced that NotebookLM was renamed **Gemini Notebook** on July 16, 2026. It says the product remains standalone and is expanding across the Gemini app and Google Search. Users may continue using the legacy term, so test search demand and wording for both names. Official source: https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/
- Google’s 2026 upgrades change the product surface; inspect official announcements and the currently accessible app before designing around old screenshots or guessed DOM selectors. Official overview: https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/

## Publicly voiced user pains / feature requests

1. **Whole chat/session to a single usable document.** In an Oct 1, 2025 Reddit post, a user described manually copying each answer, converting it for Google Docs, creating many documents, and combining them. A commenter also wished to export an entire conversation. Link: https://www.reddit.com/r/notebooklm/comments/1nv1sc0/why_do_we_still_lack_any_exporting_options_in/
2. **Many artifact types and destination formats in one workflow.** A Jan 8, 2026 exporter thread described demand for exporting mind maps, quizzes, flashcards, notes, data tables, and other outputs to tools/formats including Obsidian, Anki, PDF, HTML, JSON, Excel/Sheets, and Word/Docs. It later added Google Drive and Notion destinations. This is evidence of user interest but also strong competition. Link: https://www.reddit.com/r/notebooklm/comments/1q7b5om/i_built_an_allinone_almost_export_toolkit_for/
3. **Avoid installing multiple separate extensions.** A Jan 7, 2026 thread described switching between separate extensions for mind maps, flashcards, and PDFs as annoying. Replies also asked for citation-source export and reported confusing labels/steps or an extension blocking notebook access before it was fixed. Do not generalize a few replies into a universal pattern. Link: https://www.reddit.com/r/notebooklm/comments/1q6alec/i_built_an_allinone_export_tool_for_notebooklm_to/
4. **Flashcard formatting survives export into Anki.** A Mar 15, 2026 post reports that the exported cards looked worse after importing into Anki. This is a specific quality gap to investigate with real fixtures (HTML, LaTeX, math, non-English text), but other extensions already advertise Anki export. Link: https://www.reddit.com/r/notebooklm/comments/1ruegy0/notebooklm_flashcard_export_looks_bad_in_anki/
5. **Citation context, not only source titles.** An Apr 2026 thread discussing citations asks for the full chat plus citations and notes that some approaches provide only source names. Link: https://www.reddit.com/r/notebooklm/comments/1stcw2m/how_to_export_all_citations_in_pdf_format/
6. **Keyboard/selection guidance and clear labels matter.** The Jan 7, 2026 all-in-one exporter thread includes requests for Deselect All, clearer download instructions, and a clearer “Download slide images” label. Link: https://www.reddit.com/r/notebooklm/comments/1q6alec/i_built_an_allinone_export_tool_for_notebooklm_to/
7. **Cross-browser support comes up.** A July 2026 sidebar-extension thread has a user asking whether Firefox is supported; the developer said not yet. That is one signal, not enough to prioritize Firefox ahead of a reliable Chromium MVP. Link: https://www.reddit.com/r/notebooklm/comments/1uzmsb3/sidebar_extension_for_notebooklm_folders_inchat/

## Existing competition to verify (do not assume current status from an old post)

- NotebookLM ExportKit: claims multiple artifact types, local export plus Google Drive/Notion; public thread states some features were subscription-gated at launch. https://www.reddit.com/r/notebooklm/comments/1q7b5om/i_built_an_allinone_almost_export_toolkit_for/
- AnkiNLM: public posts describe CSV/JSON flashcard export and attention to LaTeX. https://www.reddit.com/r/notebooklm/comments/1ogkc3p/i_made_a_extension_to_download_flashcards/ and https://www.reddit.com/r/notebooklm/comments/1otk5g4/this_chrome_extension_just_made_notebooklm_10x/
- Web Clipper for NotebookLM: a Jan 2026 update thread lists exports for data tables, flashcards/quizzes, mind maps, and notes. https://www.reddit.com/r/notebooklm/comments/1qdh4pq/export_your_flashcards_quizzes_mind_maps_reports/
- NBDock: a July 2026 thread claims notebook organization, in-chat navigation/bookmarks, chat search, and Markdown/JSON export. https://www.reddit.com/r/notebooklm/comments/1uzmsb3/sidebar_extension_for_notebooklm_folders_inchat/
- NBLMextract: a May 2026 public post claims Markdown/PDF/TXT/JSON/NDJSON/DOCX/Google Docs export, full turn order, metadata and optional citations. Verify repo/store status. https://www.reddit.com/r/notebooklm/comments/1to7g67/open_source_chrome_extensions_auto_prompt_queue/

## Key hypotheses to validate

- “Supports lots of formats” is probably not enough differentiation by itself.
- Reliability/completeness (long conversations, lazy-loaded content, error states), faithful citations and formatting, easy selection/bulk export, and clear private/local processing may be important trust and UX dimensions.
- Anki-specific math/HTML/LaTeX preservation is a concrete possible wedge, but existing competition is present; do not choose it without testing alternatives and speaking to target users.
- Users may want Google Docs/Drive export, but authorization, OAuth, domain change, and permission friction must be studied before adding it.
- The extension must be branded as independent and should avoid implying Google endorsement.

## Required discovery cautions

- Reddit posts often come from extension creators, so promotional posts are biased. Treat user comments and independent complaint threads separately.
- Votes/replies are not representative market-size estimates. Record them only as context.
- Recheck all features, extensions, browser-store policies, site domains, and product terms before implementation.
