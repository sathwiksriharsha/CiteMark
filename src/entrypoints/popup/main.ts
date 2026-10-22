import type { NotebookSession, ConversationTurn, FrontmatterConfig, ExportFormat } from '../../types';
import { formatToMarkdown } from '../../modules/converters/markdown';
import { formatToPrintHtml } from '../../modules/converters/html';
import { sanitizeFilename, triggerFileDownload } from '../../modules/exporter/download';
import { DEFAULT_FRONTMATTER_CONFIG } from '../../modules/converters/frontmatter';
import { filterTurns, getActiveCitationIndices } from '../../modules/scanner/filter';
import { triggerZipDownload } from '../../modules/exporter/zip';

let currentSession: NotebookSession | null = null;
let activeTabId: number | null = null;
let activeTabUrl: string | undefined = undefined;

// Milestone 2 State
let selectedTurnIds: Set<string> = new Set();
let frontmatterConfig: FrontmatterConfig = { ...DEFAULT_FRONTMATTER_CONFIG };

// DOM View Elements
const views = {
  unsupported: document.getElementById('state-unsupported')!,
  scanning: document.getElementById('state-scanning')!,
  empty: document.getElementById('state-empty')!,
  ready: document.getElementById('state-ready')!,
  success: document.getElementById('state-success')!,
  error: document.getElementById('state-error')!
};

// Summary & Control Elements
const summaryTitle = document.getElementById('summary-title')!;
const pillTurns = document.getElementById('pill-turns')!;
const pillSources = document.getElementById('pill-sources')!;
const pillCitations = document.getElementById('pill-citations')!;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const btnCopyLabel = document.getElementById('btn-copy-label')!;
const copyToast = document.getElementById('copy-toast')!;
const btnRetry = document.getElementById('btn-retry') as HTMLButtonElement;
const btnRefreshEmpty = document.getElementById('btn-refresh-empty') as HTMLButtonElement;
const btnForceEmpty = document.getElementById('btn-force-empty') as HTMLButtonElement;
const btnForceError = document.getElementById('btn-force-error') as HTMLButtonElement;
const btnExportAnother = document.getElementById('btn-export-another') as HTMLButtonElement;
const errorMessage = document.getElementById('error-message')!;
const successFilename = document.getElementById('success-filename')!;
const warningPartialScan = document.getElementById('warning-partial-scan')!;
const warningPartialDesc = document.getElementById('warning-partial-desc')!;
const btnRescanPartial = document.getElementById('btn-rescan-partial') as HTMLButtonElement;
const emptyTitle = document.getElementById('empty-title')!;
const emptyMessage = document.getElementById('empty-message')!;
const diagPre = document.getElementById('diag-pre')!;

// Milestone 2 DOM Elements: Turn Filter
const turnFilterDrawer = document.getElementById('turn-filter-drawer') as HTMLDetailsElement;
const turnSelectionCount = document.getElementById('turn-selection-count')!;
const turnList = document.getElementById('turn-list')!;
const btnSelectAllTurns = document.getElementById('btn-select-all-turns') as HTMLButtonElement;
const btnClearAllTurns = document.getElementById('btn-clear-all-turns') as HTMLButtonElement;
const warningZeroTurns = document.getElementById('warning-zero-turns')!;

// Milestone 2 DOM Elements: Frontmatter
const chkFmEnabled = document.getElementById('chk-fm-enabled') as HTMLInputElement;
const inputFmTags = document.getElementById('input-fm-tags') as HTMLInputElement;
const chkFmAliases = document.getElementById('chk-fm-aliases') as HTMLInputElement;
const chkFmMetrics = document.getElementById('chk-fm-metrics') as HTMLInputElement;
const fmStatusBadge = document.getElementById('fm-status-badge')!;
const fmFieldsGroup = document.getElementById('fm-fields-group')!;

function appendDiagLog(msg: string) {
  const time = new Date().toLocaleTimeString();
  if (diagPre) {
    diagPre.textContent += `\n[${time}] ${msg}`;
    diagPre.scrollTop = diagPre.scrollHeight;
  }
  console.debug('[CiteMark:Popup]', msg);
}

function showView(viewKey: keyof typeof views) {
  Object.keys(views).forEach(k => {
    views[k as keyof typeof views].classList.add('hidden');
  });
  views[viewKey].classList.remove('hidden');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Checks whether the current tab is an active Gemini Notebook / NotebookLM session.
 */
function isNotebookUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('notebook.google') ||
    lower.includes('notebooklm.google') ||
    lower.includes('notebooklm')
  );
}

/**
 * Loads stored user preferences and Pro state from chrome.storage.local.
 */
function loadPreferences() {
  chrome.storage?.local?.get(['preferredFormat', 'frontmatterConfig'], (result) => {
    if (result) {
      if (result.preferredFormat) {
        const radio = document.querySelector(`input[name="export-format"][value="${result.preferredFormat}"]`) as HTMLInputElement | null;
        if (radio) radio.checked = true;
      }

      if (result.frontmatterConfig) {
        frontmatterConfig = { ...DEFAULT_FRONTMATTER_CONFIG, ...result.frontmatterConfig };
        updateFrontmatterUI();
      }
    }
  });
}

function updateFrontmatterUI() {
  if (!chkFmEnabled) return;
  chkFmEnabled.checked = frontmatterConfig.enabled;
  if (inputFmTags) inputFmTags.value = (frontmatterConfig.tags || []).join(', ');
  if (chkFmAliases) chkFmAliases.checked = !!frontmatterConfig.includeAliases;

  if (frontmatterConfig.enabled) {
    fmStatusBadge.textContent = 'Active';
    fmStatusBadge.style.color = '#15803d';
    fmFieldsGroup.classList.remove('hidden');
  } else {
    fmStatusBadge.textContent = 'Disabled';
    fmStatusBadge.style.color = 'var(--text-muted)';
    fmFieldsGroup.classList.add('hidden');
  }
}

/**
 * Updates selection metrics and syncs turn count pills.
 */
function updateSelectionMetrics() {
  if (!currentSession || !currentSession.turns) return;

  const filteredTurns = filterTurns(currentSession.turns, selectedTurnIds);
  const activeCitations = getActiveCitationIndices(filteredTurns);

  // Update pills
  pillTurns.innerHTML = `<strong>${filteredTurns.length}</strong>/${currentSession.turns.length} Turns`;
  pillCitations.innerHTML = `<strong>${activeCitations.length}</strong> Citations`;
  turnSelectionCount.textContent = `${selectedTurnIds.size}/${currentSession.turns.length}`;

  // Validate selection
  if (selectedTurnIds.size === 0) {
    warningZeroTurns.classList.remove('hidden');
    btnExport.disabled = true;
    btnCopy.disabled = true;
    btnExport.style.opacity = '0.5';
    btnCopy.style.opacity = '0.5';
  } else {
    warningZeroTurns.classList.add('hidden');
    btnExport.disabled = false;
    btnCopy.disabled = false;
    btnExport.style.opacity = '1';
    btnCopy.style.opacity = '1';
  }
}

/**
 * Renders the selective turn filter list.
 */
function renderTurnList(turns: ConversationTurn[]) {
  if (!turnList) return;
  turnList.innerHTML = '';

  turns.forEach((turn) => {
    const isUser = turn.role === 'user';
    const isChecked = selectedTurnIds.has(turn.id);
    const citeCount = turn.citationIndices ? turn.citationIndices.length : 0;
    const cleanSnippet = (turn.text || '').replace(/\s+/g, ' ').slice(0, 85);

    const label = document.createElement('label');
    label.className = 'turn-item';
    label.htmlFor = `chk-turn-${turn.id}`;

    label.innerHTML = `
      <input type="checkbox" id="chk-turn-${turn.id}" class="turn-chk" ${isChecked ? 'checked' : ''} data-turn-id="${turn.id}">
      <div class="turn-body">
        <div class="turn-header">
          <span class="turn-role-badge role-${turn.role}">${isUser ? 'User' : 'Gemini'}</span>
          <span class="turn-num" style="font-size: 10px; color: var(--text-muted); font-weight: 600;">#${turn.turnNumber}</span>
          ${citeCount > 0 ? `<span class="turn-cite-count">${citeCount} cite${citeCount > 1 ? 's' : ''}</span>` : ''}
        </div>
        <div class="turn-snippet">${escapeHtml(cleanSnippet)}</div>
      </div>
    `;

    const chk = label.querySelector<HTMLInputElement>(`#chk-turn-${turn.id}`);
    if (chk) {
      chk.addEventListener('change', () => {
        if (chk.checked) {
          selectedTurnIds.add(turn.id);
        } else {
          selectedTurnIds.delete(turn.id);
        }
        updateSelectionMetrics();
      });
    }

    turnList.appendChild(label);
  });

  updateSelectionMetrics();
}

/**
 * Queries the active tab and triggers extraction.
 */
async function initializePopup() {
  loadPreferences();
  showView('scanning');
  if (diagPre) diagPre.textContent = 'Initializing CiteMark...';
  appendDiagLog('Querying active Chrome tab...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      appendDiagLog('No active tab found.');
      showError('Could not find active browser tab.');
      return;
    }

    activeTabId = tab.id;
    activeTabUrl = tab.url;
    appendDiagLog(`Tab found: ID=${tab.id}, URL=${tab.url || 'unknown'}`);

    if (!isNotebookUrl(tab.url)) {
      appendDiagLog(`Host mismatch: URL "${tab.url}" is not recognized as Gemini Notebook.`);
      showView('unsupported');
      return;
    }

    // Fast content-script message with 1500ms fallback
    let messageResponded = false;
    const timeoutHandle = setTimeout(() => {
      if (!messageResponded) {
        appendDiagLog('Message channel timed out after 1500ms. Falling back to direct in-page execution.');
        runDirectInPageExtraction(tab.id!);
      }
    }, 1500);

    appendDiagLog('Sending SCAN_NOTEBOOK message to content script...');
    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_NOTEBOOK' }, (response) => {
      if (messageResponded) return;
      messageResponded = true;
      clearTimeout(timeoutHandle);

      if (chrome.runtime.lastError || !response || !response.success) {
        appendDiagLog(`Message failed: ${chrome.runtime.lastError?.message || 'No success response'}. Running direct in-page extraction...`);
        runDirectInPageExtraction(tab.id!);
        return;
      }

      appendDiagLog(`Content script responded: ${response.session?.turns?.length || 0} turns found.`);
      if (response.session && response.session.turns && response.session.turns.length > 0) {
        handleScanSuccess(response.session);
      } else {
        appendDiagLog('Zero turns returned by content script. Running direct in-page extraction fallback...');
        runDirectInPageExtraction(tab.id!);
      }
    });
  } catch (err) {
    appendDiagLog(`Exception in initializePopup: ${String(err)}`);
    showError(err instanceof Error ? err.message : String(err));
  }
}

/**
 * In-Page Extraction Function executed directly in the tab context via chrome.scripting.executeScript.
 */
function inPageDOMScanner() {
  const doc = document;
  const url = window.location.href;

  // 1. Title Extraction
  const titleInput = doc.querySelector<HTMLInputElement>('input.notebook-title, input[aria-label*="title" i]');
  const headingEl = doc.querySelector<HTMLElement>('[aria-label="Notebook title"], [role="heading"][aria-level="1"], .notebook-title');
  const rawTitle = titleInput?.value || headingEl?.textContent || doc.title || 'Gemini Notebook Research';
  const cleanTitle = rawTitle.replace(/\s*[-|&]\s*(Gemini Notebook|NotebookLM)\s*$/i, '').trim() || 'Gemini Notebook Research';

  // 2. Sources Extraction
  const sources: any[] = [];
  const sourceNodes = Array.from(doc.querySelectorAll<HTMLElement>(
    'source-library-item, artifact-library-note, .source-item, .source-card, [data-source-index], aside [role="listitem"], aside button[class*="source"], [class*="source-card"]'
  ));

  sourceNodes.forEach((node, idx) => {
    const titleEl = node.querySelector<HTMLElement>('.source-title, [class*="source-title"], [class*="title"], [role="heading"], .name') || node;
    const title = titleEl.textContent?.trim() || `Source ${idx + 1}`;
    const type = title.toLowerCase().includes('pdf') ? 'pdf' : 'doc';
    sources.push({
      index: idx + 1,
      title,
      type
    });
  });

  // 3. Turns Extraction
  const turns: any[] = [];
  let tCount = 0;

  // Strategy A: Real NotebookLM Chat Message Pairs (div.chat-message-pair)
  const pairs = Array.from(doc.querySelectorAll<HTMLElement>('div.chat-message-pair, .chat-message-pair'));
  if (pairs.length > 0) {
    pairs.forEach((pair, pIdx) => {
      // User container
      const userEl = pair.querySelector<HTMLElement>('.from-user-container, [class*="from-user"], .user-message, [data-role="user"]');
      if (userEl) {
        const text = (userEl.querySelector<HTMLElement>('.message-text-content, .text-body, p') || userEl).textContent?.trim() || '';
        if (text) {
          tCount++;
          turns.push({
            id: `turn-pair-${pIdx}-user`,
            turnNumber: tCount,
            role: 'user',
            text,
            citationIndices: []
          });
        }
      }

      // AI container
      const aiEl = pair.querySelector<HTMLElement>('.to-user-container, [class*="to-user"], .assistant-message, [data-role="assistant"]');
      if (aiEl) {
        const text = (aiEl.querySelector<HTMLElement>('.message-text-content, .text-body') || aiEl).textContent?.trim() || '';
        if (text) {
          tCount++;
          const citations: number[] = [];
          aiEl.querySelectorAll<HTMLElement>('button.citation-marker, .citation-marker, sup.citation-marker, [class*="citation-marker"], .citation-chip, [data-citation-index]').forEach(chip => {
            const raw = chip.getAttribute('data-citation-index') || chip.textContent || '';
            const num = parseInt(raw.replace(/[^\d]/g, ''), 10);
            if (!isNaN(num) && !citations.includes(num)) citations.push(num);
          });
          const textMatches = text.matchAll(/(?<!\[)\[(\d+)\](?!\()/g);
          for (const m of textMatches) {
            const rawNum = m[1];
            if (rawNum) {
              const num = parseInt(rawNum, 10);
              if (!isNaN(num) && !citations.includes(num)) citations.push(num);
            }
          }

          turns.push({
            id: `turn-pair-${pIdx}-ai`,
            turnNumber: tCount,
            role: 'assistant',
            text,
            citationIndices: citations.sort((a, b) => a - b)
          });
        }
      }
    });
  }

  // Strategy B: Individual message rows fallback
  if (turns.length === 0) {
    const rawItems = Array.from(doc.querySelectorAll<HTMLElement>(
      'chat-message, .individual-message, .from-user-container, .to-user-container, .message-row, .chat-turn, [data-message-author]'
    ));
    rawItems.forEach((item, idx) => {
      const text = item.textContent?.trim() || '';
      if (!text) return;
      const isUser = item.classList.contains('from-user-container') || item.className.includes('from-user') || item.classList.contains('user');
      tCount++;
      turns.push({
        id: `turn-raw-${idx}`,
        turnNumber: tCount,
        role: isUser ? 'user' : 'assistant',
        text,
        citationIndices: []
      });
    });
  }

  // 4. Studio Notes Extraction
  const studioNotes: any[] = [];
  const rawNoteEls = Array.from(doc.querySelectorAll<HTMLElement>(
    'artifact-library-note, artifact-library-item, .studio-panel .artifact-item, [class*="artifact-stretched-button"]'
  ));
  rawNoteEls.forEach((el, idx) => {
    const titleEl = el.querySelector<HTMLElement>('.artifact-title, [class*="title"], h3, h4, .name') || el;
    const title = titleEl.textContent?.trim() || `Studio Note ${idx + 1}`;
    if (!title.toLowerCase().includes('audio overview') && !title.toLowerCase().includes('deep dive')) {
      studioNotes.push({
        id: `studio-note-${idx + 1}`,
        title,
        type: 'note'
      });
    }
  });

  return {
    notebookTitle: cleanTitle,
    url,
    scannedAt: new Date().toISOString(),
    sources,
    turns,
    studioNotes,
    isComplete: true,
    totalTurnsCount: turns.length,
    diagMeta: {
      pairsCount: pairs.length,
      sourceNodesCount: sourceNodes.length,
      turnsExtracted: turns.length,
      studioNotesExtracted: studioNotes.length,
      hasChatPanel: !!doc.querySelector('.chat-panel-content, chat-panel, .chat-panel')
    }
  };
}

/**
 * Executes direct in-page script injection.
 */
function runDirectInPageExtraction(tabId: number) {
  appendDiagLog(`Executing direct script on tab ${tabId}...`);
  showView('scanning');

  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: inPageDOMScanner
    },
    (results) => {
      if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
        const err = chrome.runtime.lastError?.message || 'Script execution failed to return data.';
        appendDiagLog(`Direct extraction failed: ${err}`);
        showError(`Direct scan error: ${err}. Please ensure notebook.google.com has loaded.`);
        return;
      }

      const session = results[0].result as NotebookSession & { diagMeta?: any };
      appendDiagLog(`Direct extraction succeeded: ${session.turns?.length || 0} turns, ${session.sources?.length || 0} sources found.`);
      if (session.diagMeta) {
        appendDiagLog(`DiagMeta: pairs=${session.diagMeta.pairsCount}, notes=${session.diagMeta.studioNotesExtracted}`);
      }

      handleScanSuccess(session);
    }
  );
}

function handleScanSuccess(session: NotebookSession) {
  currentSession = session;
  (window as any).__CITEMARK_LAST_SESSION__ = session;

  if (!session.turns || session.turns.length === 0) {
    appendDiagLog('No conversation turns were found in this notebook session.');
    const isDashboard = activeTabUrl && !activeTabUrl.includes('/notebook/');
    if (isDashboard) {
      emptyTitle.textContent = 'Open a Notebook';
      emptyMessage.textContent = 'You are on the Gemini Notebook home page. Open a specific notebook to export your research.';
    } else {
      emptyTitle.textContent = 'No Conversation Yet';
      emptyMessage.textContent = 'This notebook does not have any inquiry turns yet. Ask Gemini Notebook a question first, or click Deep Scan below.';
    }
    showView('empty');
    return;
  }

  // Populate Ready UI
  summaryTitle.textContent = session.notebookTitle || 'Gemini Notebook Synthesis';
  pillSources.innerHTML = `<strong>${session.sources.length}</strong> Sources`;

  // Initialize selected turns to all turns
  selectedTurnIds = new Set(session.turns.map(t => t.id));
  renderTurnList(session.turns);

  // Completeness check
  const isPartial = !session.isComplete || session.scanCoverage === 'partial';
  if (isPartial) {
    warningPartialScan.classList.remove('hidden');
    const reasonText = session.incompleteReason
      ? `Notice: ${session.incompleteReason.replace(/_/g, ' ')}. Earlier turns could not be verified.`
      : 'Some earlier turns could not be verified. You can export captured turns now or retry.';
    warningPartialDesc.textContent = reasonText;

    const btnText = btnExport.querySelector('.btn-text');
    const btnSub = btnExport.querySelector('.btn-subtext');
    if (btnText) btnText.textContent = 'Export Partial Research';
    if (btnSub) btnSub.textContent = '⚠️ Partial scan: Unverified earlier turns';
  } else {
    warningPartialScan.classList.add('hidden');
    const btnText = btnExport.querySelector('.btn-text');
    const btnSub = btnExport.querySelector('.btn-subtext');
    if (btnText) btnText.textContent = 'Export Research';
    if (btnSub) btnSub.textContent = 'Direct local download • Zero cloud hop';
  }

  appendDiagLog(`Ready to export! Total turns: ${session.turns.length}, Sources: ${session.sources.length}`);
  showView('ready');
}

function showError(msg: string) {
  errorMessage.textContent = msg;
  appendDiagLog(`Error state displayed: ${msg}`);
  showView('error');
}

function getSelectedFormat(): ExportFormat {
  const selectedFormatRadio = document.querySelector('input[name="export-format"]:checked') as HTMLInputElement;
  return (selectedFormatRadio?.value || 'md') as ExportFormat;
}

function getActiveExportSession(): NotebookSession | null {
  if (!currentSession) return null;
  const filteredTurns = filterTurns(currentSession.turns, selectedTurnIds);
  return {
    ...currentSession,
    turns: filteredTurns,
    totalTurnsCount: filteredTurns.length,
    frontmatterConfig
  };
}

function executeExport() {
  const sessionToExport = getActiveExportSession();
  if (!sessionToExport || sessionToExport.turns.length === 0) {
    warningZeroTurns.classList.remove('hidden');
    return;
  }

  const format = getSelectedFormat();

  // Format handling for Complete Research Archive (.zip)
  if (format === 'zip') {
    try {
      const filename = triggerZipDownload(sessionToExport);
      successFilename.textContent = `Saved archive as ${filename}`;
      appendDiagLog(`Exported complete ZIP archive: ${filename}`);
      showView('success');
      return;
    } catch (err) {
      appendDiagLog(`ZIP export failed: ${String(err)}`);
      showError(`Failed to generate ZIP archive: ${String(err)}`);
      return;
    }
  }

  // Markdown or HTML Export
  const content = format === 'md'
    ? formatToMarkdown(sessionToExport, { frontmatterConfig })
    : formatToPrintHtml(sessionToExport);

  const filename = sanitizeFilename(sessionToExport.notebookTitle, format);
  triggerFileDownload(content, filename, format);

  successFilename.textContent = `Saved as ${filename}`;
  appendDiagLog(`Exported file: ${filename} (${format.toUpperCase()})`);
  showView('success');
}

async function executeCopy() {
  const sessionToExport = getActiveExportSession();
  if (!sessionToExport || sessionToExport.turns.length === 0) {
    warningZeroTurns.classList.remove('hidden');
    return;
  }

  const format = getSelectedFormat();

  if (format === 'zip') {
    copyToast.textContent = 'ZIP archives must be downloaded, not copied';
    copyToast.classList.remove('hidden');
    setTimeout(() => copyToast.classList.add('hidden'), 2500);
    return;
  }

  const content = format === 'md'
    ? formatToMarkdown(sessionToExport, { frontmatterConfig })
    : formatToPrintHtml(sessionToExport);

  try {
    await navigator.clipboard.writeText(content);
    copyToast.textContent = `✓ Copied ${format.toUpperCase()} to clipboard!`;
    copyToast.classList.remove('hidden');
    btnCopyLabel.textContent = '✓ Copied!';
    appendDiagLog(`Copied ${format.toUpperCase()} content to clipboard.`);

    setTimeout(() => {
      copyToast.classList.add('hidden');
      btnCopyLabel.textContent = '📋 Copy to Clipboard';
    }, 2000);
  } catch (err) {
    copyToast.textContent = 'Failed to copy to clipboard';
    copyToast.classList.remove('hidden');
    appendDiagLog(`Clipboard write failed: ${String(err)}`);
  }
}

// Format radio change listener
document.querySelectorAll('input[name="export-format"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target && target.checked) {
      chrome.storage?.local?.set({ preferredFormat: target.value });
    }
  });
});

// Frontmatter Listeners
chkFmEnabled.addEventListener('change', () => {
  frontmatterConfig.enabled = chkFmEnabled.checked;
  chrome.storage?.local?.set({ frontmatterConfig });
  updateFrontmatterUI();
});

inputFmTags.addEventListener('input', () => {
  frontmatterConfig.tags = inputFmTags.value.split(',').map(t => t.trim()).filter(Boolean);
  chrome.storage?.local?.set({ frontmatterConfig });
});

chkFmAliases.addEventListener('change', () => {
  frontmatterConfig.includeAliases = chkFmAliases.checked;
  chrome.storage?.local?.set({ frontmatterConfig });
});

chkFmMetrics.addEventListener('change', () => {
  // If disabled, we omit custom counts or set a flag
  chrome.storage?.local?.set({ frontmatterConfig });
});


// Turn Filter Listeners
btnSelectAllTurns.addEventListener('click', () => {
  if (!currentSession || !currentSession.turns) return;
  selectedTurnIds = new Set(currentSession.turns.map(t => t.id));
  renderTurnList(currentSession.turns);
});

btnClearAllTurns.addEventListener('click', () => {
  if (!currentSession || !currentSession.turns) return;
  selectedTurnIds.clear();
  renderTurnList(currentSession.turns);
});

// General Action Listeners
btnExport.addEventListener('click', executeExport);
btnCopy.addEventListener('click', executeCopy);
btnRetry.addEventListener('click', initializePopup);
btnRescanPartial.addEventListener('click', initializePopup);
btnRefreshEmpty.addEventListener('click', initializePopup);
btnForceEmpty.addEventListener('click', () => {
  if (activeTabId) runDirectInPageExtraction(activeTabId);
  else initializePopup();
});
btnForceError.addEventListener('click', () => {
  if (activeTabId) runDirectInPageExtraction(activeTabId);
  else initializePopup();
});
btnExportAnother.addEventListener('click', () => {
  if (currentSession) showView('ready');
  else initializePopup();
});

// Run initialization on popup open
document.addEventListener('DOMContentLoaded', initializePopup);
