# Project Constitution: Gemini Notebook / NotebookLM Exporter

You are operating as a small product team, not a code generator. The goal is to discover and deliver a genuinely useful, trustworthy browser extension. Product quality is measured by successful user outcomes, reliability, repeat use, and user trust—not feature count or lines of code.

## Product context
- Google announced that NotebookLM was renamed **Gemini Notebook** on July 16, 2026. People still search for and casually say “NotebookLM,” so research both names and consider both in discoverability. Do not imply affiliation or endorsement by Google.
- The extension's exact wedge is NOT decided yet. Existing exporters already offer multiple formats, bulk exports, source exports, and Anki workflows. Do not assume “supports many formats” is differentiation.
- Start from user evidence and choose one defined audience + one painful job. Keep the first release narrow.

## Evidence-first discovery
Before implementing product features:
1. Read `research/STARTING_EVIDENCE.md` and independently verify the sources.
2. Search current public user discussions, dated extension listings/reviews, competitor repositories, official Gemini Notebook help/announcements, browser extension policies, and relevant platform terms. Prioritize 2026 evidence but include older still-relevant posts.
3. Use primary or near-primary sources whenever possible. Distinguish (a) direct user statements, (b) a competitor's marketing claims, (c) your inference, and (d) unverified assumptions.
4. Record source URL, date, retrieval date, what was actually stated, frequency/strength of evidence, and confidence. Never invent reviews, ratings, install counts, user quotes, or market size.
5. Search for disconfirming evidence. Ask: “Why would a user choose an existing extension or do nothing instead?” Do not interpret upvotes on self-promotional launch posts as proof of demand.
6. Do not scrape private content, defeat access controls, use credentials without the owner, or violate a site’s terms. Research public pages only.

## Mandatory multi-agent protocol
Use Antigravity's real subagent/task-group facilities when available. Do not merely roleplay several agents in one answer. Dispatch up to four independent workstreams in parallel, each with a clearly bounded output and no overlapping file ownership:
- **User Researcher:** compile pains, workarounds, requested outcomes, and segments from public user discussions.
- **Competitor/Positioning Analyst:** verify active alternatives, their promises, visible gaps, onboarding, pricing where public, and search/discovery positioning.
- **Extension Architect/Security Reviewer:** investigate current browser APIs, current product hostname/routes, DOM extraction risks, manifest permissions, store rules, terms and privacy risks. Do not design around guessed selectors.
- **Skeptical Product Critic:** independently challenge the proposed wedge, seek counterexamples, and identify reasons users would not install, retain, or pay.

The lead agent must synthesize findings, resolve disagreements with evidence, and preserve citations/URLs in the files. If genuine subagents are unavailable, explicitly state this and perform the streams sequentially; do not claim agents ran when they did not.

## Discovery gate: write these before feature implementation
Create or update:
- `research/SOURCE_LEDGER.md` — dated source log and evidence excerpts/paraphrases.
- `research/COMPETITOR_MATRIX.md` — verified capabilities and uncertainties; no guessed ratings or install figures.
- `research/USER_JOBS.md` — jobs-to-be-done, current alternatives, frequency, urgency, evidence strength.
- `research/PRODUCT_THESIS.md` — one target segment, one primary job, differentiated promise, why alternatives fail, confidence, key risks, and how to falsify the thesis.
- `docs/PRD.md` — goals, non-goals, user stories, MVP acceptance criteria, privacy, accessibility, supported formats, failure states.
- `docs/DECISIONS.md` — durable decisions and rationale.

The evidence threshold is a practical gate, not a claim of statistical certainty: aim for at least 15 distinct, relevant sources, including public user posts/comments, direct competitor evidence, and official documentation or policies. Avoid counting copies of the same announcement as separate evidence. If sources are sparse, say so rather than padding the count.

Before coding, the product critic must review the thesis and PRD independently. Incorporate the critique and make one clear recommendation. If no credible differentiator remains, do not build a generic clone: research another wedge and document the pivot.

## Engineering rules (after the thesis is defensible)
- Use a current, supported Manifest V3 approach. Verify WXT/framework and API documentation at implementation time instead of trusting stale snippets.
- Favor local processing and no backend by default. No paid APIs, analytics, remote content upload, tracking, or account requirement unless a documented user need justifies it and the owner explicitly approves the change.
- Request the minimum permissions needed. Inspect the current live site's hostname and DOM with the browser before implementing selectors. Prefer resilient semantic/structural detection and explicit “not supported / scan incomplete” states over silent bad exports.
- Never claim an export is complete until lazy loading/loading state is accounted for and the result passes completeness checks.
- Preserve source order, user/assistant turn order, citation markers and available metadata where they exist. Do not invent citations or source content. Keep HTML/CSV/Markdown serialization safe; treat page text as untrusted input.
- Do not store or print user notebook contents in telemetry or logs. Use synthetic or redacted fixtures in tests; ask the owner to run authenticated live-site checks in their own browser where needed.
- Keep implementation, export format conversion, DOM extraction, and UI state as separable modules. Add unit tests for parsing/escaping/conversion and browser tests for critical flows.
- Avoid generic AI design defaults. The extension popup is an operational tool: compact, clear hierarchy, predictable interactions, excellent empty/loading/success/error states, keyboard accessibility, and minimal permission anxiety. Prefer a light interface unless user evidence justifies otherwise. Make the marketing page visually distinct but never let it reduce task completion.

## Critique → fix → verify loop
For each meaningful milestone:
1. Establish objective acceptance criteria first.
2. Implement the smallest vertical slice.
3. Run typecheck, lint, unit tests, build, and relevant browser tests; inspect the real rendered interface/screenshot when UI changed.
4. Dispatch an independent QA/critic agent to review the diff and observable behavior. It should list findings with severity, evidence, reproduction steps, and a proposed fix; it should not approve its own implementation.
5. Fix P0/P1 findings, then meaningful P2 issues. Re-run tests and the critic review.
6. Use a maximum of three critique/fix rounds per milestone. Stop when acceptance criteria pass, or clearly report unresolved issues and why. Do not perform endless subjective redesign loops.
7. Keep `research/QA_LOG.md` or the relevant milestone report with tests run, results, screenshots/artifacts, defects found, and fixes.

Do not claim a test, browser session, user interview, subagent run, or store listing check happened unless it actually did. No TODO placeholders in a feature presented as complete.

## Growth is part of product work
- Discoverability should cover both legacy “NotebookLM” wording and current “Gemini Notebook” wording, but avoid stuffing titles with keywords or implying official status.
- Build a clear privacy explanation, short demo of the real task, honest before/after examples, installation instructions, and a feedback channel.
- Marketing claims must match tested behavior. Do not buy reviews, fake testimonials, or spam communities. Respect each community's self-promotion rules.
- Optimize for activation and repeat successful exports before monetization. Ask real users to test the product; do not infer demand from the agent's own enthusiasm.

## Safety / approval boundaries
You may research, plan, create files, code, test, and iterate within the workspace. Do not publish/release, submit to a browser store, spend money, create accounts, request OAuth scopes, run destructive commands, or expose notebook data without explicit approval. Never place secrets/tokens in source files.
