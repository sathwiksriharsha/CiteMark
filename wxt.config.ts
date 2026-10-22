import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'CiteMark for Gemini Notebook (NotebookLM Exporter)',
    description: 'Export complete research conversations with verified source attribution to Obsidian Markdown and Print/PDF.',
    version: '0.1.0',
    permissions: [
      'activeTab',
      'scripting',
      'storage'
    ],
    host_permissions: [
      '*://notebook.google.com/*',
      '*://notebooklm.google.com/*',
      '*://*.notebook.google.com/*',
      '*://*.notebooklm.google.com/*',
      '*://notebooklm.google/*',
      '*://*.notebooklm.google/*',
      '*://notebook.google/*',
      '*://*.notebook.google/*'
    ],
    icons: {
      16: 'icon-16.png',
      48: 'icon-48.png',
      128: 'icon-128.png'
    },
    action: {
      default_title: 'CiteMark Exporter',
      default_popup: 'popup/index.html',
      default_icon: {
        16: 'icon-16.png',
        48: 'icon-48.png',
        128: 'icon-128.png'
      }
    }
  }
});
