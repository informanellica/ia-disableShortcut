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

let shortcuts = [];
let currentCategory = 'all';

// Load shortcuts from storage
async function loadShortcuts() {
  const result = await chrome.storage.sync.get(['shortcuts', 'customShortcuts']);
  const saved = result.shortcuts || {};
  const custom = result.customShortcuts || [];

  shortcuts = DEFAULT_SHORTCUTS.map(s => ({
    ...s,
    enabled: saved[s.id] !== undefined ? saved[s.id] : s.enabled,
  }));

  // Add custom shortcuts
  custom.forEach(c => {
    shortcuts.push({ ...c, category: 'custom' });
  });

  renderList();
  updateStatus();
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

  const filtered = currentCategory === 'all'
    ? shortcuts
    : shortcuts.filter(s => s.category === currentCategory);

  filtered.forEach(shortcut => {
    const li = document.createElement('li');
    li.className = `shortcut-item${shortcut.enabled ? '' : ' disabled'}`;

    const keysHtml = shortcut.keys.map(k => `<span class="key">${formatKey(k)}</span>`).join(' ');
    const isCustom = shortcut.category === 'custom';

    li.innerHTML = `
      <div class="shortcut-info">
        <div class="shortcut-keys">${keysHtml}</div>
        <div class="shortcut-label">${shortcut.label}</div>
      </div>
      <div class="shortcut-actions">
        <label class="toggle">
          <input type="checkbox" ${shortcut.enabled ? 'checked' : ''} data-id="${shortcut.id}">
          <span class="toggle-slider"></span>
        </label>
        ${isCustom ? `<button class="btn-delete" data-id="${shortcut.id}" title="削除">&times;</button>` : ''}
      </div>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      shortcut.enabled = checkbox.checked;
      li.classList.toggle('disabled', !shortcut.enabled);
      saveShortcuts();
    });

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
    ? `${disabled}個のショートカットが無効`
    : '全てのショートカットが有効';
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    renderList();
  });
});

// Toggle all
document.getElementById('toggleAll').addEventListener('click', () => {
  const filtered = currentCategory === 'all'
    ? shortcuts
    : shortcuts.filter(s => s.category === currentCategory);

  const allEnabled = filtered.every(s => s.enabled);
  filtered.forEach(s => s.enabled = !allEnabled);
  saveShortcuts();
  renderList();
});

// Custom shortcut form
const customForm = document.getElementById('customForm');
const captureInput = document.getElementById('captureInput');
let capturedKeys = null;

document.getElementById('addCustom').addEventListener('click', () => {
  customForm.classList.toggle('hidden');
  capturedKeys = null;
  captureInput.value = '';
  document.getElementById('customLabel').value = '';
});

document.getElementById('cancelCustom').addEventListener('click', () => {
  customForm.classList.add('hidden');
});

captureInput.addEventListener('keydown', (e) => {
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
    capturedKeys = keys;
    captureInput.value = keys.map(formatKey).join(' + ');
  }
});

document.getElementById('saveCustom').addEventListener('click', () => {
  if (!capturedKeys || capturedKeys.length === 0) return;

  const label = document.getElementById('customLabel').value || capturedKeys.map(formatKey).join('+');
  const id = 'custom-' + Date.now();

  shortcuts.push({
    id,
    keys: capturedKeys,
    label,
    category: 'custom',
    enabled: false, // Start disabled since user probably wants to block it
  });

  saveShortcuts();
  renderList();
  customForm.classList.add('hidden');
});

// Initialize
loadShortcuts();
