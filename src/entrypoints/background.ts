export default defineBackground(() => {
  // CiteMark background service worker
  console.log('[CiteMark] Background service worker initialized.');

  // Handle messages from popup or content scripts if needed
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'PING') {
      sendResponse({ status: 'PONG' });
      return true;
    }
  });
});
