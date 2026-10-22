---
name: extension-quality
description: Quality and privacy checklist for Manifest V3 browser extensions that inspect content in a user's active tab and export it safely. Use during architecture, implementation, review, and release.
---

# Browser extension quality

- Verify current browser-extension documentation and the target site's current domain/routes before writing manifest permissions or DOM selectors.
- Use the smallest feasible permission scope and explain every permission in user-facing copy.
- Prefer semantic attributes and structural fallbacks; avoid relying only on generated CSS classes. Treat the DOM as volatile and cover multiple layout states with fixtures.
- Handle lazy loading. Do not label a scan complete while loading indicators remain, counts are changing, or only part of the conversation is captured.
- Make scanning and exporting separate states. Show an item count, format, progress, cancel behavior where applicable, and specific retry guidance on failure.
- Preserve order, headings, code, tables, citation markers, source metadata, and math where the source DOM exposes them. Escape output correctly for Markdown, CSV/TSV, HTML, JSON, and ZIP formats.
- Generate local synthetic fixtures; do not commit user notebook contents or credentials. Do not send notebook contents to a server or analytics endpoint without an explicitly approved requirement and documented privacy contract.
- Test failure states: wrong host, empty notebook, content still loading, unsupported artifact, duplicate/ambiguous selectors, large conversation, special characters, non-English filenames, malformed tables, and download cancellation if applicable.
- Test keyboard navigation, focus visibility, contrast, narrow popup dimensions, screen-reader labels, and browser zoom.
- Verify clean build, unit tests, browser tests, manifest permissions, packaged output, and real rendered screenshots before calling it release-ready.
