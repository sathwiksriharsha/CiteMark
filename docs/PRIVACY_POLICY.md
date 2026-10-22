# Privacy Policy for CiteMark

**Last Updated:** October 21, 2026  
**Extension:** CiteMark for Gemini Notebook (NotebookLM Exporter)  
**Repository:** https://github.com/citemark/citemark-extension  
**Developer Contact:** privacy@citemark.dev  

---

## 1. Our Core Privacy Guarantee

**CiteMark does not collect, transmit, store, sell, or monetize your personal data, notebook contents, uploaded research documents, prompts, or generated answers.**

CiteMark was engineered specifically for researchers, academics, legal professionals, and analysts whose research materials are confidential, proprietary, or subject to non-disclosure agreements. The extension runs **100% locally within your browser sandbox**.

---

## 2. Information We Do NOT Collect

CiteMark does **not**:
- Collect or log any text from your Gemini Notebook / NotebookLM inquiries.
- Transmit your prompts or assistant responses to external servers.
- Inspect, upload, or index your uploaded PDF, DOC, or web source documents.
- Use analytics services, tracking beacons, error-logging SDKs, or third-party tracking scripts.
- Require you to create an account, register an email address, or log in.
- Track your general web browsing history or activity across tabs.
- Sell or provide any user data to data brokers, advertising networks, or third parties.

---

## 3. Information Handled Strictly on Your Local Device

When you choose to export a notebook, CiteMark processes data strictly in temporary browser memory (`RAM`) on your local machine:

1. **Active Tab DOM Parsing:** When you open the CiteMark popup, the extension reads the text content, citation markers, source document names, and studio notes currently rendered in your active Gemini Notebook tab. This data is structured in memory for conversion to Markdown, HTML, or ZIP formats. It is erased from memory when the popup is closed.
2. **Local User Preferences (`chrome.storage.local`):** The extension remembers your preferred export format (`.md`, `.html`, or `.zip`), your custom Obsidian YAML frontmatter settings (e.g. user-defined tags), and your local license state. This data is stored entirely in Chrome's local storage sandbox on your computer and is never synced to external servers.
3. **Local File Generation:** Exported `.md`, `.html`, and `.zip` files are assembled directly in your browser using standard client-side Blob APIs and saved to your device's local Downloads folder.

---

## 4. Explanation of Browser Permissions Requested

CiteMark adheres strictly to the Principle of Least Privilege:

| Permission | Technical Purpose | Data Exposure |
|---|---|---|
| `activeTab` | Grants temporary access to inspect the active tab when and only when you click the CiteMark extension icon. | None. Inactive when not triggered. |
| `scripting` | Executes the local parser script inside the active tab to read loaded turns and source document names. | None. Operates locally within the browser page. |
| `storage` | Stores your format and frontmatter preferences locally via `chrome.storage.local`. | None. Stored strictly on your local disk. |
| Host Permissions (`*://notebook.google.com/*`, `*://notebooklm.google.com/*`) | Binds the extension exclusively to official Gemini Notebook / NotebookLM URLs. | CiteMark cannot inspect or interact with any other website. |

---

## 5. Third-Party Services & Network Requests

CiteMark makes **zero external HTTP/HTTPS network requests**. It does not contact any external APIs, cloud services, analytics backends, or third-party servers. You can verify this at any time by opening Chrome DevTools (`F12`), navigating to the **Network** tab, and running an export.

---

## 6. Children's Privacy

CiteMark does not collect personal data from anyone, including children under the age of 13.

---

## 7. Changes to This Policy

If this privacy policy is modified, the updated document will be published directly in the open-source repository with a revision date. Because the extension collects zero user contact information, users are encouraged to review the policy in the repository.

---

## 8. Contact & Inquiries

For questions regarding this privacy policy or to inspect the open-source code:
- **Email:** privacy@citemark.dev
- **GitHub Issues:** https://github.com/citemark/citemark-extension/issues
