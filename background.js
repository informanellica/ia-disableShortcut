// Listen for storage changes and broadcast to all content scripts
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;
  if (!changes.shortcuts && !changes.customShortcuts) return;

  // Rebuild disabled list and broadcast
  chrome.storage.sync.get(['shortcuts', 'customShortcuts'], (result) => {
    const saved = result.shortcuts || {};
    const custom = result.customShortcuts || [];

    const DEFAULT_IDS_KEYS = [
      { id: 'nav-back', keys: ['Alt', 'ArrowLeft'] },
      { id: 'nav-forward', keys: ['Alt', 'ArrowRight'] },
      { id: 'nav-reload', keys: ['Ctrl', 'R'] },
      { id: 'nav-hard-reload', keys: ['Ctrl', 'Shift', 'R'] },
      { id: 'nav-home', keys: ['Alt', 'Home'] },
      { id: 'nav-stop', keys: ['Escape'] },
      { id: 'nav-scrolldown', keys: ['Space'] },
      { id: 'nav-scrollup', keys: ['Shift', 'Space'] },
      { id: 'nav-top', keys: ['Home'] },
      { id: 'nav-bottom', keys: ['End'] },
      { id: 'edit-copy', keys: ['Ctrl', 'C'] },
      { id: 'edit-cut', keys: ['Ctrl', 'X'] },
      { id: 'edit-paste', keys: ['Ctrl', 'V'] },
      { id: 'edit-undo', keys: ['Ctrl', 'Z'] },
      { id: 'edit-redo', keys: ['Ctrl', 'Shift', 'Z'] },
      { id: 'edit-selectall', keys: ['Ctrl', 'A'] },
      { id: 'edit-find', keys: ['Ctrl', 'F'] },
      { id: 'edit-findnext', keys: ['Ctrl', 'G'] },
      { id: 'edit-save', keys: ['Ctrl', 'S'] },
      { id: 'edit-print', keys: ['Ctrl', 'P'] },
      { id: 'tab-new', keys: ['Ctrl', 'T'] },
      { id: 'tab-close', keys: ['Ctrl', 'W'] },
      { id: 'tab-reopen', keys: ['Ctrl', 'Shift', 'T'] },
      { id: 'tab-next', keys: ['Ctrl', 'Tab'] },
      { id: 'tab-prev', keys: ['Ctrl', 'Shift', 'Tab'] },
      { id: 'tab-1', keys: ['Ctrl', '1'] },
      { id: 'tab-9', keys: ['Ctrl', '9'] },
      { id: 'tab-newwindow', keys: ['Ctrl', 'N'] },
      { id: 'tab-incognito', keys: ['Ctrl', 'Shift', 'N'] },
      { id: 'dev-tools', keys: ['F12'] },
      { id: 'dev-tools2', keys: ['Ctrl', 'Shift', 'I'] },
      { id: 'dev-console', keys: ['Ctrl', 'Shift', 'J'] },
      { id: 'dev-source', keys: ['Ctrl', 'U'] },
      { id: 'dev-inspect', keys: ['Ctrl', 'Shift', 'C'] },
    ];

    const disabled = [];

    DEFAULT_IDS_KEYS.forEach(s => {
      if (saved[s.id] === false) {
        disabled.push({ keys: s.keys });
      }
    });

    custom.forEach(c => {
      if (!c.enabled) {
        disabled.push({ keys: c.keys });
      }
    });

    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
          chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SHORTCUTS', disabled }).catch(() => {});
        }
      }
    });
  });
});
