# Privacy Policy — Shortcut Blocker

_Last updated: 2026-05-30_

Shortcut Blocker works entirely on your device / your browser sync account.

## Data we collect

**None.** The extension does not collect, sell, or transmit any personal or
usage data to us or any third party. It makes no network requests and contains
no analytics, tracking, or advertising code.

## Keyboard events

The content script listens for keyboard events on the pages you visit **only to
detect the specific shortcut combinations you have chosen to block**, and to
prevent their default action. It does **not** log, store, read, or transmit
what you type. No keystroke content ever leaves your device.

## Settings storage

Your configuration — which built-in shortcuts are disabled and any custom
shortcuts you add — is saved via the browser's `storage.sync` API. This means
your browser may sync those settings across devices where you are signed in,
using your browser vendor's account (Google / Microsoft). The data contains
only shortcut definitions and on/off flags, never page or keystroke content.

## Permissions

- **storage** — save your shortcut settings (synced by the browser).
- **host access (all sites)** — required so the content script can run on every
  page to intercept the configured shortcuts.

## Contact

Questions about this policy: support@informanellica.com
