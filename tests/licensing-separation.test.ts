import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Production / Development Licensing Separation & Security Audit', () => {
  const outputDir = path.resolve(__dirname, '../.output/chrome-mv3');

  it('guarantees that CITEMARK-PRO-2026 and Quick Toggle Pro Mode are absent from production HTML', () => {
    const popupHtmlPath = path.join(outputDir, 'popup.html');
    expect(fs.existsSync(popupHtmlPath)).toBe(true);

    const htmlContent = fs.readFileSync(popupHtmlPath, 'utf-8');

    // Production HTML must NOT contain dev test keys or quick toggles
    expect(htmlContent).not.toContain('CITEMARK-PRO-2026');
    expect(htmlContent).not.toContain('Quick Toggle Pro Mode');
    expect(htmlContent).not.toContain('pro-drawer');
    expect(htmlContent).not.toContain('input-license-key');
    expect(htmlContent).not.toContain('btn-quick-toggle-pro');
  });

  it('guarantees that test keys and licensing toggle strings are absent from production JS bundles', () => {
    const chunksDir = path.join(outputDir, 'chunks');
    expect(fs.existsSync(chunksDir)).toBe(true);

    const files = fs.readdirSync(chunksDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    jsFiles.forEach(file => {
      const content = fs.readFileSync(path.join(chunksDir, file), 'utf-8');
      expect(content).not.toContain('CITEMARK-PRO-2026');
      expect(content).not.toContain('Quick Toggle Pro Mode');
    });
  });

  it('verifies that no tracking, analytics, or external exfiltration endpoints exist in production scripts', () => {
    const allowedDomains = ['notebook.google.com', 'notebooklm.google.com', 'w3.org'];

    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Verify no tracking or exfiltration APIs
          expect(content).not.toMatch(/\bXMLHttpRequest\b/);
          expect(content).not.toMatch(/\bsendBeacon\b/);
          expect(content).not.toMatch(/\bWebSocket\b/);
          expect(content).not.toContain('google-analytics');
          expect(content).not.toContain('mixpanel');
          expect(content).not.toContain('sentry');

          // Extract any remote URLs present in strings
          const urlMatches = content.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'`)]*/g) || [];
          for (const url of urlMatches) {
            const domain = new URL(url).hostname;
            const isAllowed = allowedDomains.some(d => domain === d || domain.endsWith('.' + d));
            expect(isAllowed, `Unexpected external URL detected in ${entry.name}: ${url}`).toBe(true);
          }
        }
      }
    };

    checkDir(outputDir);
  });
});
