---
name: bounded-agent-loop
description: Orchestrates real subagents for research, implementation, critique, and iterative verification using objective acceptance criteria and a fixed maximum number of review rounds.
---

# Bounded agent loop

## Before parallel work
- Define the question, deliverables, and acceptance criteria.
- Dispatch at most four real independent subagents. Give each agent one stream and a distinct output file; avoid concurrent edits to the same file.
- Ask at least one reviewer to challenge the plan independently, not defend the implementation.

## For every milestone
1. Plan against testable criteria.
2. Implement the smallest useful slice.
3. Run automated checks and inspect the rendered behavior when UI changed.
4. Ask a separate critic to review code, security, accessibility, user experience, and acceptance criteria. Require evidence and reproduction steps for each finding.
5. Rank findings: P0 blocker/data loss/security, P1 core flow failure, P2 substantial UX/correctness issue, P3 polish.
6. Fix P0/P1 and relevant P2 issues, then run checks again.
7. Repeat for no more than three critique/fix rounds per milestone. Stop only when criteria pass or disclose blockers.
8. Keep a QA log of initial findings, changes, and retest results.

Never say an agent ran, test passed, screenshot was inspected, or website was tested unless it actually happened. Never keep looping for subjective taste after acceptance criteria pass. Do not perform external side effects without explicit approval.
