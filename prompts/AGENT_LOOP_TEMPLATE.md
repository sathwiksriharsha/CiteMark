# Reusable critique-and-iterate prompt

Use real independent subagents when the environment supports them. State the acceptance criteria first. Do not ask a builder agent to approve its own work.

1. Builder: implement the smallest change that meets these criteria: [paste criteria].
2. Test agent: devise/run checks independently and report exact commands, failures, and output.
3. Critic: inspect the diff and live rendered behavior; report only evidence-backed issues, with severity, reproduction steps, and a proposed fix. Include security/privacy/accessibility concerns where relevant.
4. Lead: resolve conflicting findings, fix P0/P1 and important P2 issues, and rerun all impacted checks.
5. Iterate up to three times. Stop when criteria pass or report exact unresolved blockers. No endless style churn, no fake test results, no unverified “done”.
