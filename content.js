let disabledShortcuts = [];

// Load disabled shortcuts from storage on init
chrome.storage.sync.get(['shortcuts', 'customShortcuts'], (result) => {
  const saved = result.shortcuts || {};
  const custom = result.customShortcuts || [];

  // Build list of disabled shortcuts from default set
  const DEFAULT_SHORTCUTS = [
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

  disabledShortcuts = [];

  DEFAULT_SHORTCUTS.forEach(s => {
    if (saved[s.id] === false) {
      disabledShortcuts.push({ keys: s.keys });
    }
  });

  custom.forEach(c => {
    if (!c.enabled) {
      disabledShortcuts.push({ keys: c.keys });
    }
  });
});

// Listen for updates from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_SHORTCUTS') {
    disabledShortcuts = message.disabled;
  }
});

function matchesShortcut(e, shortcutKeys) {
  const hasCtrl = shortcutKeys.includes('Ctrl');
  const hasAlt = shortcutKeys.includes('Alt');
  const hasShift = shortcutKeys.includes('Shift');

  if (hasCtrl !== (e.ctrlKey || e.metaKey)) return false;
  if (hasAlt !== e.altKey) return false;
  if (hasShift !== e.shiftKey) return false;

  // Find the non-modifier key
  const mainKey = shortcutKeys.find(k => !['Ctrl', 'Alt', 'Shift'].includes(k));
  if (!mainKey) return false;

  const eventKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  const targetKey = mainKey.length === 1 ? mainKey.toUpperCase() : mainKey;

  return eventKey === targetKey;
}

// Intercept keyboard events
document.addEventListener('keydown', (e) => {
  // Don't block when typing in input fields for single-key shortcuts
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;

  for (const shortcut of disabledShortcuts) {
    if (matchesShortcut(e, shortcut.keys)) {
      const hasModifier = shortcut.keys.some(k => ['Ctrl', 'Alt', 'Shift'].includes(k));

      // Skip single-key shortcuts (Space, Escape, Home, End) when in input fields
      if (isInput && !hasModifier) continue;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }
}, true); // Use capture phase to intercept before page handlers
