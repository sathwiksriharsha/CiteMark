# NotebookLM / Gemini Notebook Exporter — Antigravity Agent Kit

This kit prepares a new project workspace for evidence-led discovery, multi-agent implementation, and bounded critique/verification loops. It does **not** install the extension itself and does not publish anything.

## Recommended setup

1. Extract the contents of this ZIP **into the new `notebooklm-exporter` folder** you already created. Keep `AGENTS.md`, `CLAUDE.md`, and `setup.ps1` at the folder root.
2. Open that folder in Antigravity as the workspace (not only a parent directory).
3. Open PowerShell in the project root and run:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\setup.ps1
   ```

   The execution-policy command affects only the current PowerShell process. The setup script installs selected open-source skills into the project for Antigravity and Claude Code via the Skills CLI. It also disables anonymous Skills CLI telemetry for this script process. The CLI may need internet access and Node.js/npm.
4. Review the command output. If a skill install fails, the script reports it; no work should be considered installed unless the CLI succeeds.
5. Restart or start a **new Antigravity agent session** so it discovers the skills. In the Customizations panel, verify workspace rules/skills if your version provides that view.
6. Paste the prompt from `prompts/PHASE_1_DISCOVERY.md` into the Antigravity agent. Its first job is research and product strategy, **not coding**.

## Why research first?
Multi-format NotebookLM/Gemini Notebook exporters already exist. A larger feature list is not automatically a better product. You need a specific, evidenced user pain and a reliable reason to switch.

## Skills installed

- **Superpowers workflow skills**: brainstorming, plans, TDD, systematic debugging, subagent orchestration, code review, and verification.
- **Anthropic frontend-design**: distinctive and intentional UI direction.
- **Impeccable**: UI critique and polish, with operating-mode guidance for tool interfaces.
- **Project-specific skills** in `.agents/skills/`: product discovery, bounded critique loop, browser-extension QA.

These tools guide an agent; they do not guarantee good decisions. Always inspect evidence, diffs, tests, and permissions.
