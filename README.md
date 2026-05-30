# Shortcut Blocker

A Chrome / Edge (Manifest V3) extension that lets you **turn individual
keyboard shortcuts on or off** while browsing — block accidental `Ctrl+W`,
stop `Backspace`/`Alt+←` navigation, disable `F12`, and more.

(Repo folder is `ia-disableShortcut`; the published name is **Shortcut
Blocker** — set in `manifest.json`.)

## Features

- **Toggle shortcuts individually** across categories: Navigation, Editing,
  Tab management, Developer, and your own Custom entries.
- **Custom shortcuts** — record or type any combo (e.g. `Ctrl+K`) to block.
- **Bulk enable/disable** per category, plus search.
- **Settings sync** across your signed-in browsers (`storage.sync`).
- **Light / dark theme**.

## How it works

There are two classes of shortcuts, handled differently:

1. **Page-level shortcuts** (most editing/navigation keys): a content script
   injected at `document_start` on every frame listens for `keydown` in the
   capture phase and calls `preventDefault()` on the blocked combos.

2. **Browser-reserved shortcuts** (`Ctrl+W`, `Ctrl+T`, `Ctrl+N`, dev-tools,
   …): a web page **cannot** cancel these. Instead they are declared as no-op
   `commands` in the manifest. When you assign the combo to the matching
   `block-*` command at `chrome://extensions/shortcuts`, Chrome routes the
   keystroke to the extension (which does nothing), neutralizing it. The popup
   shows a gear + guided walkthrough for these. A few combos Chrome refuses to
   bind (`F12`, `Ctrl+Tab`) are shown as **unblockable**.

On first install the extension opens `chrome://extensions/shortcuts` so you can
assign those reserved combos.

## Install (development)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. **Load unpacked** → select this folder.

## Build a release zip

Produces `dist/shortcut-blocker-v<version>.zip` (version read from
`manifest.json`), bundling only the shipped files.

```bash
./build.sh          # Git Bash / macOS / Linux (falls back to PowerShell or Python if `zip` is missing)
pwsh ./build.ps1    # PowerShell
```

## Permissions

| Permission | Why |
|------------|-----|
| `storage`             | Save which shortcuts are disabled and any custom combos (`storage.sync`). |
| `host_permissions: <all_urls>` + content script | The content script must run on every page to intercept keystrokes. |

> `<all_urls>` shows the "read and change all your data on all websites"
> warning — be ready to justify it in review: intercepting keyboard events on
> every page is the extension's core function.

## Privacy

No data is collected or transmitted. Your shortcut settings are stored via the
browser's sync storage. The content script reads keyboard **events only to
block configured combos** — it does not read page content or keystroke text.
See [PRIVACY.md](PRIVACY.md).

## License

MIT — see [LICENSE](LICENSE). © 2026 Informanellica.
