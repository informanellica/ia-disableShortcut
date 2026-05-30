// --- i18n: fill static markup, getter for dynamic strings, localized labels ---
const t = (key, subs) => chrome.i18n.getMessage(key, subs);
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const m = t(el.dataset.i18n);
    if (m) el.textContent = m;
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const m = t(el.dataset.i18nTitle);
    if (m) el.title = m;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const m = t(el.dataset.i18nPlaceholder);
    if (m) el.placeholder = m;
  });
}
// Localized display label for a built-in shortcut; custom entries keep their own.
function scLabel(s) {
  if (!s) return '';
  if (s.category === 'custom') return s.label;
  return t('sc_' + s.id.replace(/-/g, '_')) || s.label;
}

const DEFAULT_SHORTCUTS = [
  // Navigation
  { id: 'nav-back', keys: ['Alt', 'ArrowLeft'], label: '戻る', category: 'navigation', enabled: true },
  { id: 'nav-forward', keys: ['Alt', 'ArrowRight'], label: '進む', category: 'navigation', enabled: true },
  { id: 'nav-reload', keys: ['Ctrl', 'R'], label: 'ページ再読み込み', category: 'navigation', enabled: true },
  { id: 'nav-hard-reload', keys: ['Ctrl', 'Shift', 'R'], label: 'キャッシュクリア再読み込み', category: 'navigation', enabled: true },
  { id: 'nav-home', keys: ['Alt', 'Home'], label: 'ホームページ', category: 'navigation', enabled: true },
  { id: 'nav-stop', keys: ['Escape'], label: '読み込み中止', category: 'navigation', enabled: true },
  { id: 'nav-scrolldown', keys: ['Space'], label: 'ページダウン', category: 'navigation', enabled: true },
  { id: 'nav-scrollup', keys: ['Shift', 'Space'], label: 'ページアップ', category: 'navigation', enabled: true },
  { id: 'nav-top', keys: ['Home'], label: 'ページ先頭', category: 'navigation', enabled: true },
  { id: 'nav-bottom', keys: ['End'], label: 'ページ末尾', category: 'navigation', enabled: true },

  // Editing
  { id: 'edit-copy', keys: ['Ctrl', 'C'], label: 'コピー', category: 'editing', enabled: true },
  { id: 'edit-cut', keys: ['Ctrl', 'X'], label: '切り取り', category: 'editing', enabled: true },
  { id: 'edit-paste', keys: ['Ctrl', 'V'], label: '貼り付け', category: 'editing', enabled: true },
  { id: 'edit-undo', keys: ['Ctrl', 'Z'], label: '元に戻す', category: 'editing', enabled: true },
  { id: 'edit-redo', keys: ['Ctrl', 'Shift', 'Z'], label: 'やり直し', category: 'editing', enabled: true },
  { id: 'edit-selectall', keys: ['Ctrl', 'A'], label: '全選択', category: 'editing', enabled: true },
  { id: 'edit-find', keys: ['Ctrl', 'F'], label: '検索', category: 'editing', enabled: true },
  { id: 'edit-findnext', keys: ['Ctrl', 'G'], label: '次を検索', category: 'editing', enabled: true },
  { id: 'edit-save', keys: ['Ctrl', 'S'], label: 'ページ保存', category: 'editing', enabled: true },
  { id: 'edit-print', keys: ['Ctrl', 'P'], label: '印刷', category: 'editing', enabled: true },

  // Tab management
  { id: 'tab-new', keys: ['Ctrl', 'T'], label: '新しいタブ', category: 'tab', enabled: true },
  { id: 'tab-close', keys: ['Ctrl', 'W'], label: 'タブを閉じる', category: 'tab', enabled: true },
  { id: 'tab-reopen', keys: ['Ctrl', 'Shift', 'T'], label: '閉じたタブを開く', category: 'tab', enabled: true },
  { id: 'tab-next', keys: ['Ctrl', 'Tab'], label: '次のタブ', category: 'tab', enabled: true },
  { id: 'tab-prev', keys: ['Ctrl', 'Shift', 'Tab'], label: '前のタブ', category: 'tab', enabled: true },
  { id: 'tab-1', keys: ['Ctrl', '1'], label: 'タブ1に移動', category: 'tab', enabled: true },
  { id: 'tab-9', keys: ['Ctrl', '9'], label: '最後のタブに移動', category: 'tab', enabled: true },
  { id: 'tab-newwindow', keys: ['Ctrl', 'N'], label: '新しいウィンドウ', category: 'tab', enabled: true },
  { id: 'tab-incognito', keys: ['Ctrl', 'Shift', 'N'], label: 'シークレットウィンドウ', category: 'tab', enabled: true },

  // Developer
  { id: 'dev-tools', keys: ['F12'], label: 'デベロッパーツール', category: 'dev', enabled: true },
  { id: 'dev-tools2', keys: ['Ctrl', 'Shift', 'I'], label: 'デベロッパーツール', category: 'dev', enabled: true },
  { id: 'dev-console', keys: ['Ctrl', 'Shift', 'J'], label: 'コンソール', category: 'dev', enabled: true },
  { id: 'dev-source', keys: ['Ctrl', 'U'], label: 'ソース表示', category: 'dev', enabled: true },
  { id: 'dev-inspect', keys: ['Ctrl', 'Shift', 'C'], label: '要素の検証', category: 'dev', enabled: true },
];

// Shortcuts that Chrome reserves at the browser level: a content script's
// preventDefault() cannot reliably cancel these, so the in-page toggle alone
// won't stop them. Those that are also command-eligible (see COMMAND_IDS) can
// be neutralized once the user assigns the combo at chrome://extensions/shortcuts.
const BROWSER_RESERVED = new Set([
  'nav-back', 'nav-forward', 'nav-reload', 'nav-hard-reload', 'nav-home',
  'tab-new', 'tab-close', 'tab-reopen', 'tab-next', 'tab-prev',
  'tab-1', 'tab-9', 'tab-newwindow', 'tab-incognito',
  'dev-tools', 'dev-tools2', 'dev-console', 'dev-source', 'dev-inspect',
]);

// Reserved shortcuts we declare as "block-<id>" commands in manifest.json.
// Excludes combos Chrome refuses as extension commands (F12, Ctrl+Tab).
const COMMAND_IDS = new Set([
  'nav-back', 'nav-forward', 'nav-reload', 'nav-hard-reload', 'nav-home',
  'tab-new', 'tab-close', 'tab-reopen', 'tab-1', 'tab-9', 'tab-newwindow', 'tab-incognito',
  'dev-tools2', 'dev-console', 'dev-source', 'dev-inspect',
]);

function openShortcutsPage() {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
}

// chrome://extensions/shortcuts is a chrome:// page, so we can't inject a guide
// onto it — instead we show an in-popup, shortcut-specific walkthrough that
// names the exact row to look for (matches the manifest command description).
function openGuide(shortcut) {
  const combo = shortcut.keys.map(formatKey).join('+');
  const label = scLabel(shortcut);
  document.getElementById('guideTarget').textContent = t('guideTargetFmt', [label, combo]);
  document.getElementById('guideRow').textContent = t('guideRowFmt', [`${label} (${combo})`]);
  document.getElementById('guideOverlay').classList.remove('hidden');
}

function closeGuide() {
  document.getElementById('guideOverlay').classList.add('hidden');
}

function keysEqual(a, b) {
  return a.length === b.length && a.every((k, i) => k === b[i]);
}

// A custom combo that duplicates a built-in shortcut should drive the built-in
// toggle instead of living as a separate custom entry — only built-ins carry a
// chrome.commands route, so syncing is what makes browser-reserved combos
// (Ctrl+W, ...) registrable at chrome://extensions/shortcuts.
function findBuiltinByKeys(keys) {
  return shortcuts.find(s => s.category !== 'custom' && keysEqual(s.keys, keys));
}

let shortcuts = [];
let currentCategory = 'all';
let searchQuery = '';
// Browser-reserved shortcuts (need chrome://extensions/shortcuts registration)
// are hidden by default; this toggle reveals them.
let showReserved = false;

// Load shortcuts from storage
async function loadShortcuts() {
  const result = await chrome.storage.sync.get(['shortcuts', 'customShortcuts', 'showReserved']);
  const saved = result.shortcuts || {};
  const custom = result.customShortcuts || [];
  showReserved = result.showReserved === true;
  const toggleReservedEl = document.getElementById('toggleReserved');
  if (toggleReservedEl) toggleReservedEl.checked = showReserved;

  shortcuts = DEFAULT_SHORTCUTS.map(s => ({
    ...s,
    enabled: saved[s.id] !== undefined ? saved[s.id] : s.enabled,
  }));

  // Add custom shortcuts, folding any that duplicate a built-in into the
  // built-in toggle (so they get the chrome.commands route) instead of keeping
  // a dead duplicate. `shortcuts` already holds the built-ins at this point.
  let migrated = false;
  custom.forEach(c => {
    const builtin = findBuiltinByKeys(c.keys);
    if (builtin) {
      // The in-page toggle only means something for non-reserved built-ins;
      // reserved ones are driven by chrome://extensions/shortcuts (the gear).
      if (!c.enabled && !BROWSER_RESERVED.has(builtin.id)) builtin.enabled = false;
      migrated = true;
    } else {
      shortcuts.push({ ...c, category: 'custom' });
    }
  });

  renderList();
  updateStatus();

  // Persist the cleanup so the duplicate custom entries are removed for good.
  if (migrated) saveShortcuts();
}

// Save state to storage
async function saveShortcuts() {
  const state = {};
  const custom = [];

  shortcuts.forEach(s => {
    if (s.category === 'custom') {
      custom.push(s);
    } else {
      state[s.id] = s.enabled;
    }
  });

  await chrome.storage.sync.set({ shortcuts: state, customShortcuts: custom });

  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  const disabledShortcuts = shortcuts.filter(s => !s.enabled).map(s => ({
    keys: s.keys,
  }));

  for (const tab of tabs) {
    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
      chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SHORTCUTS', disabled: disabledShortcuts }).catch(() => {});
    }
  }

  updateStatus();
}

function formatKey(key) {
  const map = {
    'Ctrl': navigator.platform.includes('Mac') ? '⌘' : 'Ctrl',
    'Alt': navigator.platform.includes('Mac') ? '⌥' : 'Alt',
    'Shift': '⇧',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Tab': 'Tab',
    'Escape': 'Esc',
    'Space': 'Space',
    'Home': 'Home',
    'End': 'End',
    'Enter': 'Enter',
    'Backspace': '⌫',
    'Delete': 'Del',
  };
  return map[key] || key;
}

function renderList() {
  const list = document.getElementById('shortcutList');
  list.innerHTML = '';

  let filtered = currentCategory === 'all'
    ? shortcuts.slice()
    : shortcuts.filter(s => s.category === currentCategory);

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(s => {
      const hay = `${scLabel(s)} ${s.keys.map(formatKey).join(' ')} ${s.keys.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // Hide browser-reserved shortcuts unless the user opted to show them.
  if (!showReserved) {
    filtered = filtered.filter(s => !BROWSER_RESERVED.has(s.id));
  }

  // Bulk ON/OFF control at the top of each tab (when there are items)
  if (filtered.length > 0) {
    const allEnabled = filtered.every(s => s.enabled);
    const allDisabled = filtered.every(s => !s.enabled);
    const bulkLi = document.createElement('li');
    bulkLi.className = 'bulk-row';
    bulkLi.innerHTML = `
      <span class="bulk-label">${t('bulkLabel')}</span>
      <div class="bulk-actions">
        <button class="btn-bulk${allDisabled ? ' active' : ''}" data-act="disable" type="button">${t('disableAll')}</button>
        <button class="btn-bulk${allEnabled ? ' active' : ''}" data-act="enable" type="button">${t('enableAll')}</button>
      </div>
    `;
    bulkLi.querySelector('[data-act="disable"]').addEventListener('click', () => setAllInCurrentCategory(false));
    bulkLi.querySelector('[data-act="enable"]').addEventListener('click', () => setAllInCurrentCategory(true));
    list.appendChild(bulkLi);
  }

  // Custom tab: show an "add" button at the top of the list
  if (currentCategory === 'custom') {
    const addLi = document.createElement('li');
    addLi.className = 'add-custom-row';
    addLi.innerHTML = '<button class="btn-add-custom" type="button">' + t('addCustom') + '</button>';
    addLi.querySelector('button').addEventListener('click', openCustomForm);
    list.appendChild(addLi);
  }

  filtered.forEach(shortcut => {
    const li = document.createElement('li');
    li.className = `shortcut-item${shortcut.enabled ? '' : ' blocked'}`;

    const keysHtml = shortcut.keys.map(k => `<span class="key">${formatKey(k)}</span>`).join(' ');
    const isCustom = shortcut.category === 'custom';
    const reserved = BROWSER_RESERVED.has(shortcut.id);
    // commandManaged: a browser-reserved combo we can route through
    // chrome.commands — the in-page toggle is meaningless, so we show a gear
    // that opens chrome://extensions/shortcuts instead.
    const commandManaged = reserved && COMMAND_IDS.has(shortcut.id);
    // unblockable: reserved AND not command-eligible (F12, Ctrl+Tab) — nothing
    // can block it, so we show a lock instead of a control.
    const unblockable = reserved && !COMMAND_IDS.has(shortcut.id);

    let noteHtml = '';
    if (commandManaged) {
      noteHtml = `<div class="shortcut-note needs-setup">${t('noteCommand')}</div>`;
    } else if (unblockable) {
      noteHtml = `<div class="shortcut-note unblockable">${t('noteUnblockable')}</div>`;
    }

    // Pick the control: gear (command-managed) / lock (unblockable) / toggle.
    let controlHtml;
    if (commandManaged) {
      controlHtml = `<button class="btn-gear" type="button" title="${t('gearTitle')}">${ICON_GEAR}</button>`;
    } else if (unblockable) {
      controlHtml = `<span class="ctrl-locked" title="${t('lockTitle')}">${ICON_LOCK}</span>`;
    } else {
      // Toggle ON (checked) = この機能を無効化（ブロック）
      controlHtml = `
        <label class="toggle">
          <input type="checkbox" ${shortcut.enabled ? '' : 'checked'} data-id="${shortcut.id}">
          <span class="toggle-slider"></span>
        </label>`;
    }

    li.innerHTML = `
      <div class="shortcut-info">
        <div class="shortcut-keys">${keysHtml}</div>
        <div class="shortcut-label">${t('disableFmt', [scLabel(shortcut)])}</div>
        ${noteHtml}
      </div>
      <div class="shortcut-actions">
        ${controlHtml}
        ${isCustom ? `<button class="btn-delete" data-id="${shortcut.id}" title="${t('delete')}">&times;</button>` : ''}
      </div>
    `;

    const gearBtn = li.querySelector('.btn-gear');
    if (gearBtn) gearBtn.addEventListener('click', () => openGuide(shortcut));

    const checkbox = li.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        shortcut.enabled = !checkbox.checked; // checked = 無効化
        li.classList.toggle('blocked', !shortcut.enabled);
        saveShortcuts();
      });
    }

    const deleteBtn = li.querySelector('.btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        shortcuts = shortcuts.filter(s => s.id !== shortcut.id);
        saveShortcuts();
        renderList();
      });
    }

    list.appendChild(li);
  });
}

function updateStatus() {
  const disabled = shortcuts.filter(s => !s.enabled).length;
  const status = document.getElementById('status');
  status.textContent = disabled > 0
    ? t('statusDisabled', [String(disabled)])
    : t('statusAllEnabled');
}

// Theme (dark/light) toggle — Bootstrap Icons (MIT), inlined as SVG
const ICON_SUN = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg>';
const ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/></svg>';

function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add('theme-' + t);
  const btn = document.getElementById('themeToggle');
  // Show the icon for the current theme (sun = light, moon = dark)
  if (btn) btn.innerHTML = t === 'light' ? ICON_SUN : ICON_MOON;
}

const prefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Stored manual choice wins; otherwise follow the system; default light.
function resolveTheme() {
  const s = localStorage.getItem('theme');
  if (s === 'light' || s === 'dark') return s;
  return prefersDark() ? 'dark' : 'light';
}

function setTheme(theme) {
  applyTheme(theme);
  localStorage.setItem('theme', theme);
}

applyTheme(resolveTheme());

// Follow OS theme changes while no manual choice is stored.
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const s = localStorage.getItem('theme');
    if (s !== 'light' && s !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
  });
}

// Header shortcut: open Chrome's shortcut-assignment page. Bootstrap "gear"
// icon (MIT), inlined as SVG.
const ICON_GEAR = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/></svg>';
// Bootstrap "lock-fill" icon (MIT) — shown for shortcuts nothing can block.
const ICON_LOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/></svg>';

const openShortcutsBtn = document.getElementById('openShortcuts');
openShortcutsBtn.innerHTML = ICON_GEAR;
openShortcutsBtn.addEventListener('click', openShortcutsPage);

// Guide overlay wiring
document.getElementById('guideOpen').addEventListener('click', () => {
  openShortcutsPage();
  closeGuide();
});
document.getElementById('guideClose').addEventListener('click', closeGuide);
document.getElementById('guideOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'guideOverlay') closeGuide(); // click outside the card
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
  setTheme(current === 'light' ? 'dark' : 'light');
});

// ---- Search / quick-add ----
// Bootstrap "search" icon (MIT).
const ICON_SEARCH = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>';
const toggleSearchBtn = document.getElementById('toggleSearch');
toggleSearchBtn.innerHTML = ICON_SEARCH;
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const searchAddBtn = document.getElementById('searchAdd');

// On the custom tab the box doubles as an "add" field, so expose the 追加 button
// and hint that combos can be typed in.
function refreshSearchBar() {
  const onCustom = currentCategory === 'custom';
  searchAddBtn.classList.toggle('hidden', !onCustom);
  searchInput.placeholder = onCustom ? t('searchAddPlaceholder') : t('searchPlaceholder');
}

function showSearch(show) {
  searchBar.classList.toggle('hidden', !show);
  if (show) {
    refreshSearchBar();
    searchInput.focus();
  }
}

toggleSearchBtn.addEventListener('click', () => {
  showSearch(searchBar.classList.contains('hidden'));
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderList();
});

// Quick-add the typed combo as a custom shortcut (custom tab only). Reuses the
// same fold logic as the capture form so duplicates of built-ins are avoided.
function addFromSearch() {
  const keys = parseKeys(searchInput.value);
  if (keys.length === 0) return;

  const builtin = findBuiltinByKeys(keys);
  if (builtin) {
    if (!BROWSER_RESERVED.has(builtin.id)) builtin.enabled = false;
    currentCategory = builtin.category;
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.toggle('active', t.dataset.category === currentCategory));
  } else {
    shortcuts.push({
      id: 'custom-' + Date.now(),
      keys,
      label: keys.map(formatKey).join('+'),
      category: 'custom',
      enabled: false,
    });
  }

  saveShortcuts();
  searchInput.value = '';
  searchQuery = '';
  refreshSearchBar();
  renderList();
}

searchAddBtn.addEventListener('click', addFromSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && currentCategory === 'custom') {
    e.preventDefault();
    addFromSearch();
  }
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    // The custom tab's box doubles as add+search, so surface it there.
    if (currentCategory === 'custom') showSearch(true);
    refreshSearchBar();
    renderList();
  });
});

// Bulk enable/disable all shortcuts in the current tab
function setAllInCurrentCategory(enabled) {
  const filtered = currentCategory === 'all'
    ? shortcuts
    : shortcuts.filter(s => s.category === currentCategory);

  filtered.forEach(s => s.enabled = enabled);
  saveShortcuts();
  renderList();
}

// Parse a typed combination (e.g. "Ctrl + K", "alt+left", "F12") into a keys array
const MODIFIER_ALIASES = {
  ctrl: 'Ctrl', control: 'Ctrl', '⌘': 'Ctrl', cmd: 'Ctrl', command: 'Ctrl', meta: 'Ctrl', win: 'Ctrl',
  alt: 'Alt', option: 'Alt', opt: 'Alt', '⌥': 'Alt',
  shift: 'Shift', '⇧': 'Shift',
};
const KEY_ALIASES = {
  esc: 'Escape', escape: 'Escape', space: 'Space', spacebar: 'Space', tab: 'Tab',
  enter: 'Enter', return: 'Enter', del: 'Delete', delete: 'Delete', backspace: 'Backspace',
  home: 'Home', end: 'End', pageup: 'PageUp', pagedown: 'PageDown',
  left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
  arrowleft: 'ArrowLeft', arrowright: 'ArrowRight', arrowup: 'ArrowUp', arrowdown: 'ArrowDown',
  '←': 'ArrowLeft', '→': 'ArrowRight', '↑': 'ArrowUp', '↓': 'ArrowDown', '⌫': 'Backspace',
};

function parseKeys(text) {
  if (!text) return [];
  const parts = text.split(/[\s+]+/).map(p => p.trim()).filter(Boolean);
  const mods = [];
  const main = [];

  parts.forEach(p => {
    const low = p.toLowerCase();
    if (MODIFIER_ALIASES[low]) {
      const m = MODIFIER_ALIASES[low];
      if (!mods.includes(m)) mods.push(m);
    } else if (KEY_ALIASES[low]) {
      main.push(KEY_ALIASES[low]);
    } else if (/^f\d{1,2}$/i.test(p)) {
      main.push(p.toUpperCase()); // F1..F12
    } else if (p.length === 1) {
      main.push(p.toUpperCase());
    } else {
      main.push(p.charAt(0).toUpperCase() + p.slice(1));
    }
  });

  const order = ['Ctrl', 'Alt', 'Shift'];
  return [...order.filter(m => mods.includes(m)), ...main];
}

// Custom shortcut form
const customForm = document.getElementById('customForm');
const captureInput = document.getElementById('captureInput');
const captureToggle = document.getElementById('captureToggle');
let capturing = false;

function setCapturing(on) {
  capturing = on;
  captureToggle.classList.toggle('active', on);
  captureToggle.textContent = on ? t('recording') : t('record');
  captureInput.readOnly = on;
  if (on) captureInput.focus();
}

function openCustomForm() {
  customForm.classList.remove('hidden');
  setCapturing(false);
  captureInput.value = '';
  document.getElementById('customLabel').value = '';
  captureInput.focus();
}

document.getElementById('cancelCustom').addEventListener('click', () => {
  customForm.classList.add('hidden');
  setCapturing(false);
});

captureToggle.addEventListener('click', () => setCapturing(!capturing));

captureInput.addEventListener('keydown', (e) => {
  if (!capturing) return; // allow free text typing when not recording
  e.preventDefault();
  const keys = [];
  if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');

  const key = e.key;
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  }

  if (keys.length > 0) {
    captureInput.value = keys.map(formatKey).join(' + ');
  }
});

document.getElementById('saveCustom').addEventListener('click', () => {
  const keys = parseKeys(captureInput.value);
  if (keys.length === 0) return;

  // If the combo matches a built-in shortcut, fold into it instead of creating
  // a dead duplicate. For non-reserved built-ins that means disabling (block via
  // content script); reserved ones are controlled by the gear → shortcuts page,
  // so we just surface the existing row.
  const builtin = findBuiltinByKeys(keys);
  if (builtin) {
    if (!BROWSER_RESERVED.has(builtin.id)) builtin.enabled = false;
    saveShortcuts();
    // Jump to its category so the user sees the matching row (gear or toggle).
    currentCategory = builtin.category;
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.toggle('active', t.dataset.category === currentCategory));
    renderList();
    customForm.classList.add('hidden');
    setCapturing(false);
    return;
  }

  const label = document.getElementById('customLabel').value || keys.map(formatKey).join('+');
  const id = 'custom-' + Date.now();

  shortcuts.push({
    id,
    keys,
    label,
    category: 'custom',
    enabled: false, // Start disabled since user probably wants to block it
  });

  saveShortcuts();
  renderList();
  customForm.classList.add('hidden');
  setCapturing(false);
});

// Show/hide browser-reserved shortcuts
document.getElementById('toggleReserved').addEventListener('change', (e) => {
  showReserved = e.target.checked;
  chrome.storage.sync.set({ showReserved });
  renderList();
});

// Initialize
applyI18n();
loadShortcuts();
