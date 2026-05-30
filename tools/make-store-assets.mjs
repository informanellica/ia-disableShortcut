// Generate Chrome/Edge store assets from the REAL popup, for every UI locale.
//
// For each locale it renders popup.html with mocked chrome.* APIs + that
// locale's messages inside a branded 1280x800 promo layout, and writes:
//   dist/store-assets/<lang>/screenshot-1280x800.png
//   dist/store-assets/<lang>/promo-tile-440x280.png
// Plus, at the top level: store-icon-128.png, privacy-policy.md, SUBMISSION.md.
//
// Requires Playwright + an installed Google Chrome. Run from the repo root:
//   npm install        # once
//   npm run assets     # -> dist/store-assets/
import { chromium } from "playwright";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist", "store-assets");

const CONFIG = {
  storeName: "Shortcut Blocker",
  zip: "shortcut-blocker-v1.0.2.zip",
  uiLocale: "ja",
  privacy: "https://informanellica.github.io/ia-disableShortcut/PRIVACY",
  category: "Productivity / Accessibility",
  perms: "storage, host access (all sites)",
  version: "1.0.2",
  summaryEN: "Turn individual keyboard shortcuts on or off while browsing — block accidental Ctrl+W, Backspace navigation, F12, and more.",
  summaryJA: "ブラウジング中のキーボードショートカットを個別にオン/オフ。誤操作の Ctrl+W、Backspace での戻る、F12 などをブロックできます。",
  homepage: "https://informanellica.com",
  support: "https://github.com/informanellica/ia-disableShortcut",
  singlePurpose: "Enable or disable specified keyboard shortcuts on web pages.",
  // Store "Description" (16,000 chars) per language — paste into the listing.
  desc: {
    en: "Shortcut Blocker lets you turn individual keyboard shortcuts on or off while browsing — block an accidental Ctrl+W, stop Backspace/Alt+← navigation, disable F12, and more, organized by category with your own custom shortcuts. Settings sync across your signed-in browsers, with light and dark themes. No data is collected and no network requests are made; key events are used only to block the shortcuts you choose.",
    ja: "Shortcut Blocker は、ブラウジング中のキーボードショートカットを個別にオン/オフできます。誤操作の Ctrl+W、Backspace/Alt+← での戻る、F12 などをカテゴリ別にブロックでき、独自のカスタムショートカットも追加可能。設定はサインイン中のブラウザ間で同期し、ライト/ダークテーマに対応。データ収集・通信は一切なく、キー操作は選んだショートカットのブロックのためだけに使われます。",
    es: "Shortcut Blocker te permite activar o desactivar atajos de teclado individuales al navegar: bloquea un Ctrl+W accidental, detén la navegación con Retroceso/Alt+←, desactiva F12 y más, organizados por categoría y con tus propios atajos personalizados. La configuración se sincroniza entre tus navegadores, con temas claro y oscuro. No se recopilan datos ni se hacen peticiones de red; las pulsaciones solo se usan para bloquear los atajos que elijas.",
    pt_BR: "O Shortcut Blocker permite ativar ou desativar atalhos de teclado individuais ao navegar: bloqueie um Ctrl+W acidental, impeça a navegação com Backspace/Alt+←, desative F12 e mais, organizados por categoria e com seus próprios atalhos personalizados. As configurações sincronizam entre seus navegadores, com temas claro e escuro. Nenhum dado é coletado e nenhuma requisição de rede é feita; as teclas são usadas apenas para bloquear os atalhos que você escolher.",
    fr: "Shortcut Blocker vous permet d'activer ou de désactiver des raccourcis clavier individuels — bloquez un Ctrl+W accidentel, empêchez la navigation par Retour arrière/Alt+←, désactivez F12, etc., classés par catégorie avec vos propres raccourcis personnalisés. Les réglages se synchronisent entre vos navigateurs, avec thèmes clair et sombre. Aucune donnée collectée, aucune requête réseau ; les touches servent uniquement à bloquer les raccourcis choisis.",
    de: "Mit Shortcut Blocker aktivierst oder deaktivierst du einzelne Tastenkürzel beim Surfen — blockiere ein versehentliches Strg+W, stoppe die Rücktaste-/Alt+←-Navigation, deaktiviere F12 und mehr, nach Kategorien geordnet und mit eigenen Tastenkürzeln. Die Einstellungen werden zwischen deinen Browsern synchronisiert, mit hellem und dunklem Design. Es werden keine Daten erfasst und keine Netzwerkanfragen gestellt; Tasteneingaben dienen nur dazu, die gewählten Tastenkürzel zu blockieren.",
    it: "Shortcut Blocker ti permette di attivare o disattivare singole scorciatoie da tastiera durante la navigazione: blocca un Ctrl+W accidentale, ferma la navigazione con Backspace/Alt+←, disattiva F12 e altro, organizzate per categoria e con scorciatoie personalizzate. Le impostazioni si sincronizzano tra i tuoi browser, con temi chiaro e scuro. Nessun dato raccolto e nessuna richiesta di rete; i tasti servono solo a bloccare le scorciatoie scelte.",
    ru: "Shortcut Blocker позволяет включать и отключать отдельные сочетания клавиш при просмотре — блокируйте случайное Ctrl+W, останавливайте навигацию по Backspace/Alt+←, отключайте F12 и другое, с разбивкой по категориям и собственными сочетаниями. Настройки синхронизируются между вашими браузерами, есть светлая и тёмная темы. Данные не собираются и сетевые запросы не выполняются; нажатия используются только для блокировки выбранных сочетаний.",
    zh_CN: "Shortcut Blocker 让你在浏览时逐个开启或关闭键盘快捷键——屏蔽误触的 Ctrl+W、阻止 Backspace/Alt+← 导航、禁用 F12 等，按类别整理并支持自定义快捷键。设置可在登录的浏览器间同步，并支持浅色和深色主题。不收集任何数据，也不发起网络请求；按键仅用于屏蔽你选择的快捷键。",
    zh_TW: "Shortcut Blocker 讓你在瀏覽時逐一開啟或關閉鍵盤快速鍵——封鎖誤觸的 Ctrl+W、阻止 Backspace/Alt+← 導覽、停用 F12 等，依類別整理並支援自訂快速鍵。設定可在登入的瀏覽器間同步，並支援淺色與深色主題。不收集任何資料，也不發出網路請求；按鍵僅用於封鎖你選擇的快速鍵。",
    ko: "Shortcut Blocker로 브라우징 중 키보드 단축키를 개별적으로 켜고 끌 수 있습니다 — 실수로 누르는 Ctrl+W 차단, Backspace/Alt+← 탐색 방지, F12 비활성화 등을 카테고리별로 관리하고 사용자 지정 단축키도 추가할 수 있습니다. 설정은 로그인한 브라우저 간에 동기화되며 밝은/어두운 테마를 지원합니다. 데이터를 수집하거나 네트워크 요청을 하지 않으며, 키 입력은 선택한 단축키를 차단하는 데만 사용됩니다.",
  },
  popupWidth: 360,
  popupHeight: 560,
  zoom: 1.3,
  promoHead: {
    en: "Turn off shortcuts you don't want",
    ja: "邪魔なショートカットをオフ",
    es: "Desactiva los atajos que no quieres",
    pt_BR: "Desative os atalhos indesejados",
    fr: "Désactivez les raccourcis gênants",
    de: "Unerwünschte Tastenkürzel aus",
    it: "Disattiva le scorciatoie indesiderate",
    ru: "Отключите ненужные сочетания",
    zh_CN: "关闭碍事的快捷键",
    zh_TW: "關閉礙事的快速鍵",
    ko: "원치 않는 단축키 끄기",
  },
};

// chrome.* mock (promise style, storage.sync) — light theme, default shortcut list.
const MOCK = `
window.localStorage.setItem('theme','light');
window.chrome={
 storage:{sync:{get:async()=>({}),set:async()=>{}},onChanged:{addListener:()=>{}}},
 tabs:{query:async()=>[],sendMessage:async()=>{},create:()=>{}},
 runtime:{sendMessage:async()=>{},onMessage:{addListener:()=>{}}},
 commands:{onCommand:{addListener:()=>{}}},
};
`;

// --- shared generator (identical across the three extensions) ---
const CJK = new Set(["ja", "zh_CN", "zh_TW", "ko"]);
const FONT_LATIN = "'Segoe UI',Arial,sans-serif";
const FONT_CJK = "'Segoe UI','Yu Gothic UI','Microsoft YaHei','Microsoft JhengHei','Malgun Gothic','Meiryo',sans-serif";

export async function generate(cfg, mock, root, out) {
  fs.mkdirSync(out, { recursive: true });
  const popupUrl = pathToFileURL(path.join(root, "popup.html")).href;
  const iconUrl = pathToFileURL(path.join(root, "icons", "icon128.png")).href;

  const browser = await chromium.launch({ channel: "chrome" });

  for (const lang of Object.keys(cfg.promoHead)) {
    const msgsRaw = JSON.parse(fs.readFileSync(path.join(root, "_locales", lang, "messages.json"), "utf8"));
    const flat = {};
    for (const k in msgsRaw) flat[k] = msgsRaw[k].message;
    const head = cfg.promoHead[lang];
    const sub = flat.appDesc || "";
    const fontFam = CJK.has(lang) ? FONT_CJK : FONT_LATIN;
    const i18nMock = `(()=>{const M=${JSON.stringify(flat)};window.chrome=window.chrome||{};window.chrome.i18n={getMessage:(k,subs)=>{let s=(M[k]||"");if(subs!=null){const a=[].concat(subs);let i=0;s=s.replace(/\\$\\w+\\$/g,()=>a[i++]??"");}return s;}};})();`;

    const promo = `<!doctype html><html lang="${lang.replace("_", "-")}"><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
.stage{width:1280px;height:800px;display:flex;align-items:center;
 background:linear-gradient(135deg,#0a2540,#103a8e);font-family:${fontFam};overflow:hidden}
.copy{flex:1;padding:0 72px}
.copy h1{color:#fff;font-size:50px;line-height:1.15;margin-bottom:18px;font-weight:700}
.copy p{color:#c8d6f0;font-size:26px;line-height:1.5}
.device{margin-right:96px;border-radius:16px;overflow:hidden;
 box-shadow:0 26px 70px rgba(0,0,0,.5);flex:0 0 auto;zoom:${cfg.zoom}}
.device iframe{border:0;display:block;width:${cfg.popupWidth}px;height:${cfg.popupHeight}px;background:#fff}
</style></head><body><div class="stage">
 <div class="copy"><h1>${escapeHtml(head)}</h1><p>${escapeHtml(sub)}</p></div>
 <div class="device"><iframe src="${popupUrl}"></iframe></div>
</div></body></html>`;

    const tile = `<!doctype html><html lang="${lang.replace("_", "-")}"><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
.t{width:440px;height:280px;display:flex;align-items:center;gap:24px;padding:0 40px;
 background:linear-gradient(135deg,#0a2540,#103a8e);font-family:${fontFam};color:#fff}
.t img{width:96px;height:96px}
.t h2{font-size:28px;font-weight:700}
.t p{font-size:17px;color:#c8d6f0;margin-top:6px}
</style></head><body><div class="t"><img src="${iconUrl}">
 <div><h2>${escapeHtml(cfg.storeName)}</h2><p>${escapeHtml(head)}</p></div></div></body></html>`;

    const dir = path.join(out, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "_promo.html"), promo);
    fs.writeFileSync(path.join(dir, "_tile.html"), tile);

    // Fresh context per locale so init scripts don't accumulate.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript({ content: mock + "\n" + i18nMock });
    await page.goto(pathToFileURL(path.join(dir, "_promo.html")).href);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(dir, "screenshot-1280x800.png"), clip: { x: 0, y: 0, width: 1280, height: 800 } });

    await page.setViewportSize({ width: 440, height: 280 });
    await page.goto(pathToFileURL(path.join(dir, "_tile.html")).href);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(dir, "promo-tile-440x280.png"), clip: { x: 0, y: 0, width: 440, height: 280 } });
    await ctx.close();

    fs.rmSync(path.join(dir, "_promo.html"), { force: true });
    fs.rmSync(path.join(dir, "_tile.html"), { force: true });

    if (lang === cfg.uiLocale) {
      fs.copyFileSync(path.join(dir, "screenshot-1280x800.png"), path.join(out, "screenshot-1280x800.png"));
      fs.copyFileSync(path.join(dir, "promo-tile-440x280.png"), path.join(out, "promo-tile-440x280.png"));
    }
    console.log("  shot", lang);
  }

  await browser.close();

  fs.copyFileSync(path.join(root, "icons", "icon128.png"), path.join(out, "store-icon-128.png"));

  const listing = fs.readFileSync(path.join(root, "store", "listing.md"), "utf8");
  const privacy = fs.readFileSync(path.join(root, "PRIVACY.md"), "utf8");
  fs.writeFileSync(path.join(out, "privacy-policy.md"), privacy);
  fs.writeFileSync(path.join(out, "SUBMISSION.md"), submissionDoc(cfg, listing));

  console.log("store assets ->", out);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const LANG_NAME = {
  en: "English", ja: "日本語", es: "Español", pt_BR: "Português (BR)", fr: "Français",
  de: "Deutsch", it: "Italiano", ru: "Русский", zh_CN: "简体中文", zh_TW: "繁體中文", ko: "한국어",
};

// Top-to-bottom, all-language submission walkthrough.
function submissionDoc(cfg, listing) {
  const langs = Object.keys(cfg.promoHead);
  const rows = langs
    .map((l) => `| ${l} — ${LANG_NAME[l] || l} | \`${l}/screenshot-1280x800.png\` | \`${l}/promo-tile-440x280.png\` |`)
    .join("\n");
  const descs = langs
    .map((l) => `### ${LANG_NAME[l] || l} (${l})\n\n${cfg.desc[l] || cfg.desc.en}`)
    .join("\n\n");

  return `# Submission — ${cfg.storeName} (v${cfg.version}) — step by step

Follow top to bottom. The **Title** and **Summary** are taken automatically from
the extension package (already localized into all ${langs.length} languages), so
per language you only set the **Description** and upload the **localized
screenshot**. Everything you need is in this folder (per-locale images in
\`<lang>/\` subfolders).

## Step 0 — Before you start
- Host the privacy policy and confirm the URL opens: ${cfg.privacy}
  (text: \`privacy-policy.md\` in this folder)
- Accounts: Chrome Web Store developer (\$5 one-time) / Edge Partner Center (free).

## Step 1 — Create the item & upload the package
1. Chrome Web Store Developer Dashboard → **New item**.
2. Upload \`../${cfg.zip}\`.

## Step 2 — All-languages (default) assets  [required, once]
Under **「全言語向けアセット」 / All-languages assets**:
- Store icon (128×128): \`store-icon-128.png\`
- All-languages screenshot (fallback for any language): \`en/screenshot-1280x800.png\`
- Promo tile 440×280 (optional): \`en/promo-tile-440x280.png\`
- Marquee 1400×560: skip

## Step 3 — Other fields (set once, 「すべての言語用」)
- Category: ${cfg.category}
- Homepage URL: ${cfg.homepage}
- Support URL: ${cfg.support}
- Mature content: **No**
- Visibility: **Public**

## Step 4 — Per-language listing (repeat for each language)
Switch **「編集中の言語」 / Editing language**, then for that language:
1. Description: paste the text from Step 5 for that language.
2. Localized screenshot (「ローカライズ版スクリーンショット」): upload that language's file.
(Title & Summary fill in automatically.)

| Language | Localized screenshot | Localized tile |
| --- | --- | --- |
${rows}

Minimum: do **English + 日本語**. The other languages can be added anytime —
until then those users see the auto-localized title/summary + the all-languages
(English) screenshot.

## Step 5 — Descriptions to paste (per language)

${descs}

## Step 6 — Privacy practices tab
- Single purpose: ${cfg.singlePurpose}
- Permissions in this build: ${cfg.perms} — justification wording is in the Appendix.
- Uses remote code? **No**
- Data collection: **none** → tick the 3 certifications (no selling, single-purpose only, not for creditworthiness)
- Privacy policy URL: ${cfg.privacy}

## Step 7 — Submit
Click **Submit for review**. Review takes hours–days (broad permissions take longer).

## Step 8 — Microsoft Edge Add-ons (same package)
1. Partner Center → new extension → upload \`../${cfg.zip}\`.
2. Reuse the same descriptions / screenshots / URLs above.
3. Privacy: same policy URL, no data collected → **Publish**.

---

## Appendix — EN/JA listing reference (summaries + permission justifications)

${listing}
`;
}

await generate(CONFIG, MOCK, ROOT, OUT);
