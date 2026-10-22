# Mission 1: Find the wedge before writing code

Read `AGENTS.md`, `research/STARTING_EVIDENCE.md`, and the installed skills. This is an end-to-end product-discovery mission. Do not create implementation code yet.

## Use real agents
Use Antigravity's actual subagent/task-group facilities to run these streams in parallel, with distinct output ownership:
1. **User evidence:** locate and analyze public user complaints, workarounds, feature requests, questions, and bug reports about NotebookLM / Gemini Notebook export. Prioritize 2026; search both names. Distinguish independent users from extension creators promoting their own products.
2. **Competitors / discoverability:** inspect currently available extensions, GitHub repositories, store listings/reviews when visible, feature claims, permissions/privacy statements, update recency, onboarding, and public pricing. Explore how people discover them and which search terms users actually use. Do not invent metrics.
3. **Technical and policy feasibility:** verify current official Google product/site documentation, Manifest V3/browser-store rules, permissions, current hostnames, extraction constraints and privacy implications. Identify what can be safely done locally. Do not guess selectors from old screenshots.
4. **Skeptical product critic:** independently look for counterevidence, substitutes, policy risks, maintenance burden, and reasons users would not install, keep, or pay for another exporter.

If actual subagents or web/browser access are unavailable, clearly say so and use a sequential fallback; do not claim they ran.

## Research standard
- Use at least 15 distinct, relevant sources if available, with direct links and dates. Prefer public user posts/comments, active competitor products/repositories, official docs and store policies. Do not pad the count with copies of the same story.
- For every key insight, quote or paraphrase only what the source supports; record the source date, current verification status, signal strength, and caveat.
- Search for failure reports and “doesn't work” feedback, not only feature requests and launch posts.
- Include both legacy term “NotebookLM” and current “Gemini Notebook”; verify the renaming date from Google.
- Explicitly compare common candidates: complete chat export, merged clean documents, citation/source context, faithful Markdown/HTML/LaTeX/Anki output, math/format preservation, bulk exports, privacy/permissions, cross-browser support, and stability with long/lazy-loaded content. Add/remove candidates based on evidence.

## Deliverables
Create/update:
- `research/SOURCE_LEDGER.md`
- `research/COMPETITOR_MATRIX.md`
- `research/USER_JOBS.md`
- `research/PRODUCT_THESIS.md`
- `research/RESEARCH_CRITIQUE.md` (the independent critic's counterarguments and the lead's resolution)
- `docs/PRD.md` (only after the thesis survives critique)
- `docs/DECISIONS.md`

Recommend a single beachhead audience and primary job, explain how the best alternatives fail at that job, show the evidence strength, define an MVP of no more than three core capabilities, list explicit non-goals, and propose a 7-day validation experiment. The thesis must be falsifiable. If evidence doesn't support a unique enough wedge, recommend pivoting or not building rather than dressing up a clone.

## Iteration requirement
Run one independent critique of the evidence synthesis and another of the proposed thesis/PRD. Fix source mistakes and unsupported claims, re-check the most important sources, and update the docs. Maximum three rounds; keep a brief change log.

## Stop condition
Stop after the research pack and product thesis are complete and internally critiqued. Do not write extension source code, scaffold the app, install npm packages, add OAuth, or submit anything to a browser store. Return a concise decision memo that answers: “What should we build first, for whom, why will they switch, what will we deliberately not build, and what evidence would prove us wrong?”
