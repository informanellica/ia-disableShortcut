# Store Listing — Shortcut Blocker

Copy/paste into the Chrome Web Store / Edge Add-ons dashboards. English is the
primary listing; add Japanese as an additional locale.

(Name finalized as **Shortcut Blocker** in `manifest.json`.)

---

## English

**Name**
Shortcut Blocker

**Short summary** (≤132 chars)
Turn individual keyboard shortcuts on or off while browsing — block accidental Ctrl+W, Backspace navigation, F12, and more.

**Detailed description**

Shortcut Blocker lets you disable the keyboard shortcuts that get in your way.

• Toggle shortcuts one by one: Navigation, Editing, Tab management, Developer
• Add your own custom combos to block (type or record them)
• Bulk enable/disable per category, plus quick search
• Settings sync across your signed-in browsers
• Light and dark themes

Stop losing a tab to an accidental Ctrl+W, prevent Backspace/Alt+← from
navigating away mid-form, or disable F12 on a kiosk. You decide exactly which
shortcuts are blocked.

Note: some shortcuts are reserved by the browser (Ctrl+W, Ctrl+T, …) and can't
be blocked by a web page. For those, the extension guides you to assign them on
Chrome's shortcuts page so they can be neutralized. A few (F12, Ctrl+Tab) can't
be blocked at all and are clearly marked.

Everything runs locally. No data is collected or transmitted.

**Category**: Productivity (or Accessibility)

**Permission justifications**

- storage: Save which shortcuts are disabled and any custom combos (synced by the browser).
- Host access to all sites (content script on <all_urls>): The core function is to intercept keyboard events on the pages you visit and block the shortcuts you configured. It runs on every page only for this purpose and reads no page content.

**Single purpose**
Enable or disable specified keyboard shortcuts on web pages.

---

## 日本語 (Japanese)

**名前**
Shortcut Blocker

**短い概要** (132字以内)
ブラウジング中のキーボードショートカットを個別にオン/オフ。誤操作の Ctrl+W、Backspace での戻る、F12 などをブロックできます。

**詳細な説明**

Shortcut Blocker は、邪魔になるキーボードショートカットを無効化できる拡張機能です。

• ショートカットを1つずつ切り替え: ナビゲーション/編集/タブ管理/開発者
• 独自のカスタムショートカットを追加してブロック(入力または記録)
• カテゴリごとの一括オン/オフ、クイック検索
• 設定はサインイン中のブラウザ間で同期
• ライト/ダークテーマ

誤った Ctrl+W でタブを失わない、入力中に Backspace/Alt+← で戻ってしまうのを防ぐ、キオスク端末で F12 を無効化——ブロックするショートカットを自分で選べます。

ご注意: 一部のショートカット(Ctrl+W、Ctrl+T など)はブラウザが予約しており、Webページからはブロックできません。その場合は Chrome のショートカット設定で割り当てる手順を案内し、無効化できるようにします。ごく一部(F12、Ctrl+Tab)はブロック不可で、明示表示します。

すべて端末内で動作し、データ収集・通信は一切行いません。

**カテゴリ**: 生産性(または アクセシビリティ)

**権限の正当化**

- storage: 無効化したショートカットとカスタム設定の保存のため(ブラウザ同期)。
- 全サイトへのアクセス(<all_urls> の content script): 訪問ページでキーイベントを捕捉し、設定したショートカットをブロックするという中心機能のため。この目的のみで全ページで動作し、ページ内容は読み取りません。

**単一目的**
Webページ上で指定されたキーボードショートカットを有効/無効にする。
