# Mission 2: Implement the evidence-backed MVP

Read `AGENTS.md`, `docs/PRD.md`, `research/PRODUCT_THESIS.md`, `docs/DECISIONS.md`, and the installed skills. Do not reopen settled product scope without new evidence. Verify current official API/framework docs first.

Use actual subagents/task groups if available:
- Architect: propose a small MV3/WXT/TypeScript architecture and identify permissions/data-flow risks.
- Test engineer: design synthetic fixtures and tests for the highest-risk extraction/export behavior before implementation.
- UX critic: review task flow, popup interaction, empty/loading/error/success states, accessibility, and permission trust. Do not let this agent rewrite the product scope.
- Skeptical reviewer: inspect the resulting diff and test evidence independently.

Work one vertical slice at a time. Write acceptance criteria and failing tests first where practical; implement the smallest change that satisfies the test. Keep extraction, data model, converters, download packaging, and UI state separate. Respect local-only processing and minimum permissions from `AGENTS.md`.

For every milestone: build/typecheck, run unit tests, run browser checks, inspect the real rendered popup at its shipping dimensions, capture screenshots, dispatch an independent critic, fix evidence-backed P0/P1 and relevant P2 issues, and re-run verification. Run at most three critique/fix rounds per milestone. Never treat a mock/demo preview as proof that live extraction works.

Create/update `research/QA_LOG.md` with exact commands and results. At completion, report known limitations, manual live-site checks that require my authenticated browser, installed/required permissions, and a clear set of release gates. Do not publish, purchase, request new OAuth scopes, or submit to a store without explicit approval.
