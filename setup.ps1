$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

Write-Host "`nNotebookLM / Gemini Notebook Exporter: workspace setup" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot"

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Node.js and npm are required for the Skills CLI. Install the current Node.js LTS release, reopen PowerShell, and rerun .\setup.ps1."
}
if (-not (Test-Path (Join-Path $ProjectRoot 'AGENTS.md'))) {
    throw "AGENTS.md is missing. Extract the entire kit into your project root before running setup."
}

# Skills CLI telemetry is opt-out. Disable it for this process.
$env:DISABLE_TELEMETRY = '1'

function Install-ProjectSkills {
    param(
        [Parameter(Mandatory = $true)][string]$Repository,
        [Parameter(Mandatory = $true)][string[]]$SkillNames
    )

    $arguments = @('skills', 'add', $Repository)
    foreach ($skillName in $SkillNames) {
        $arguments += @('--skill', $skillName)
    }
    $arguments += @('--agent', 'antigravity', '--agent', 'claude-code', '--copy', '--yes')

    Write-Host "`nInstalling from $Repository" -ForegroundColor Yellow
    & npx @arguments
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Install failed for $Repository (exit $LASTEXITCODE). Check the repository/skill name, network, and CLI output, then retry that command manually. Continuing with the remaining installs."
    } else {
        Write-Host "Install command completed for $Repository" -ForegroundColor Green
    }
}

Install-ProjectSkills -Repository 'https://github.com/obra/superpowers' -SkillNames @(
    'brainstorming',
    'writing-plans',
    'executing-plans',
    'systematic-debugging',
    'test-driven-development',
    'subagent-driven-development',
    'dispatching-parallel-agents',
    'requesting-code-review',
    'verification-before-completion'
)

Install-ProjectSkills -Repository 'https://github.com/anthropics/skills' -SkillNames @('frontend-design')
Install-ProjectSkills -Repository 'https://github.com/pbakaus/impeccable' -SkillNames @('impeccable')

Write-Host "`nWorkspace files and project-specific skills are already included in this kit." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Inspect .agents/skills and the installation results above."
Write-Host "  2. Restart/start a new Antigravity session with this folder as the workspace."
Write-Host "  3. Paste prompts/PHASE_1_DISCOVERY.md into the agent."
Write-Host "`nThis script does not scaffold source code, publish to stores, create accounts, or deploy anything." -ForegroundColor Gray
