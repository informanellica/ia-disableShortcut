// Client-side i18n for this extension's detail page (GitHub Pages).
(function () {
  const LANGS = [
    ["en", "English"], ["ja", "日本語"], ["es", "Español"], ["pt_BR", "Português"],
    ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"], ["ru", "Русский"],
    ["zh_CN", "简体中文"], ["zh_TW", "繁體中文"], ["ko", "한국어"],
  ];
  const T = {
    tagline: { en: "Turn off shortcuts you don't want", ja: "邪魔なショートカットをオフ", es: "Desactiva los atajos que no quieres", pt_BR: "Desative os atalhos indesejados", fr: "Désactivez les raccourcis gênants", de: "Unerwünschte Tastenkürzel aus", it: "Disattiva le scorciatoie indesiderate", ru: "Отключите ненужные сочетания", zh_CN: "关闭碍事的快捷键", zh_TW: "關閉礙事的快速鍵", ko: "원치 않는 단축키 끄기" },
    desc: { en: "Shortcut Blocker lets you turn individual keyboard shortcuts on or off while browsing — block an accidental Ctrl+W, stop Backspace/Alt+← navigation, disable F12, and more, organized by category with your own custom shortcuts. Settings sync across your signed-in browsers, with light and dark themes. No data is collected and no network requests are made; key events are used only to block the shortcuts you choose.", ja: "Shortcut Blocker は、ブラウジング中のキーボードショートカットを個別にオン/オフできます。誤操作の Ctrl+W、Backspace/Alt+← での戻る、F12 などをカテゴリ別にブロックでき、独自のカスタムショートカットも追加可能。設定はサインイン中のブラウザ間で同期し、ライト/ダークテーマに対応。データ収集・通信は一切なく、キー操作は選んだショートカットのブロックのためだけに使われます。", es: "Shortcut Blocker te permite activar o desactivar atajos de teclado individuales al navegar: bloquea un Ctrl+W accidental, detén la navegación con Retroceso/Alt+←, desactiva F12 y más, organizados por categoría y con tus propios atajos personalizados. La configuración se sincroniza entre tus navegadores, con temas claro y oscuro. No se recopilan datos ni se hacen peticiones de red; las pulsaciones solo se usan para bloquear los atajos que elijas.", pt_BR: "O Shortcut Blocker permite ativar ou desativar atalhos de teclado individuais ao navegar: bloqueie um Ctrl+W acidental, impeça a navegação com Backspace/Alt+←, desative F12 e mais, organizados por categoria e com seus próprios atalhos personalizados. As configurações sincronizam entre seus navegadores, com temas claro e escuro. Nenhum dado é coletado e nenhuma requisição de rede é feita; as teclas são usadas apenas para bloquear os atalhos que você escolher.", fr: "Shortcut Blocker vous permet d'activer ou de désactiver des raccourcis clavier individuels — bloquez un Ctrl+W accidentel, empêchez la navigation par Retour arrière/Alt+←, désactivez F12, etc., classés par catégorie avec vos propres raccourcis personnalisés. Les réglages se synchronisent entre vos navigateurs, avec thèmes clair et sombre. Aucune donnée collectée, aucune requête réseau ; les touches servent uniquement à bloquer les raccourcis choisis.", de: "Mit Shortcut Blocker aktivierst oder deaktivierst du einzelne Tastenkürzel beim Surfen — blockiere ein versehentliches Strg+W, stoppe die Rücktaste-/Alt+←-Navigation, deaktiviere F12 und mehr, nach Kategorien geordnet und mit eigenen Tastenkürzeln. Die Einstellungen werden zwischen deinen Browsern synchronisiert, mit hellem und dunklem Design. Es werden keine Daten erfasst und keine Netzwerkanfragen gestellt; Tasteneingaben dienen nur dazu, die gewählten Tastenkürzel zu blockieren.", it: "Shortcut Blocker ti permette di attivare o disattivare singole scorciatoie da tastiera durante la navigazione: blocca un Ctrl+W accidentale, ferma la navigazione con Backspace/Alt+←, disattiva F12 e altro, organizzate per categoria e con scorciatoie personalizzate. Le impostazioni si sincronizzano tra i tuoi browser, con temi chiaro e scuro. Nessun dato raccolto e nessuna richiesta di rete; i tasti servono solo a bloccare le scorciatoie scelte.", ru: "Shortcut Blocker позволяет включать и отключать отдельные сочетания клавиш при просмотре — блокируйте случайное Ctrl+W, останавливайте навигацию по Backspace/Alt+←, отключайте F12 и другое, с разбивкой по категориям и собственными сочетаниями. Настройки синхронизируются между вашими браузерами, есть светлая и тёмная темы. Данные не собираются и сетевые запросы не выполняются; нажатия используются только для блокировки выбранных сочетаний.", zh_CN: "Shortcut Blocker 让你在浏览时逐个开启或关闭键盘快捷键——屏蔽误触的 Ctrl+W、阻止 Backspace/Alt+← 导航、禁用 F12 等，按类别整理并支持自定义快捷键。设置可在登录的浏览器间同步，并支持浅色和深色主题。不收集任何数据，也不发起网络请求；按键仅用于屏蔽你选择的快捷键。", zh_TW: "Shortcut Blocker 讓你在瀏覽時逐一開啟或關閉鍵盤快速鍵——封鎖誤觸的 Ctrl+W、阻止 Backspace/Alt+← 導覽、停用 F12 等，依類別整理並支援自訂快速鍵。設定可在登入的瀏覽器間同步，並支援淺色與深色主題。不收集任何資料，也不發出網路請求；按鍵僅用於封鎖你選擇的快速鍵。", ko: "Shortcut Blocker로 브라우징 중 키보드 단축키를 개별적으로 켜고 끌 수 있습니다 — 실수로 누르는 Ctrl+W 차단, Backspace/Alt+← 탐색 방지, F12 비활성화 등을 카테고리별로 관리하고 사용자 지정 단축키도 추가할 수 있습니다. 설정은 로그인한 브라우저 간에 동기화되며 밝은/어두운 테마를 지원합니다. 데이터를 수집하거나 네트워크 요청을 하지 않으며, 키 입력은 선택한 단축키를 차단하는 데만 사용됩니다." },
    apps: { en: "All apps", ja: "アプリ一覧", es: "Aplicaciones", pt_BR: "Aplicativos", fr: "Applications", de: "Apps", it: "App", ru: "Приложения", zh_CN: "应用", zh_TW: "應用程式", ko: "앱" },
    support: { en: "Support", ja: "サポート", es: "Soporte", pt_BR: "Suporte", fr: "Assistance", de: "Support", it: "Assistenza", ru: "Поддержка", zh_CN: "支持", zh_TW: "支援", ko: "지원" },
    releases: { en: "Download (releases)", ja: "ダウンロード（リリース）", es: "Descargar (versiones)", pt_BR: "Baixar (versões)", fr: "Télécharger (versions)", de: "Download (Releases)", it: "Scarica (release)", ru: "Скачать (релизы)", zh_CN: "下载（发布）", zh_TW: "下載（發行）", ko: "다운로드(릴리스)" },
    source: { en: "Source code", ja: "ソースコード", es: "Código fuente", pt_BR: "Código-fonte", fr: "Code source", de: "Quellcode", it: "Codice sorgente", ru: "Исходный код", zh_CN: "源代码", zh_TW: "原始碼", ko: "소스 코드" },
    privacy: { en: "Privacy policy", ja: "プライバシーポリシー", es: "Política de privacidad", pt_BR: "Política de privacidade", fr: "Confidentialité", de: "Datenschutz", it: "Privacy", ru: "Конфиденциальность", zh_CN: "隐私政策", zh_TW: "隱私權政策", ko: "개인정보처리방침" },
    note: { en: "For Chrome & Edge · No data collected · Open source", ja: "Chrome・Edge 対応 · データ収集なし · オープンソース", es: "Para Chrome y Edge · Sin recopilación de datos · Código abierto", pt_BR: "Para Chrome e Edge · Sem coleta de dados · Código aberto", fr: "Pour Chrome et Edge · Aucune donnée collectée · Open source", de: "Für Chrome & Edge · Keine Datenerfassung · Open Source", it: "Per Chrome ed Edge · Nessun dato raccolto · Open source", ru: "Для Chrome и Edge · Данные не собираются · Открытый код", zh_CN: "支持 Chrome 与 Edge · 不收集数据 · 开源", zh_TW: "支援 Chrome 與 Edge · 不收集資料 · 開源", ko: "Chrome·Edge 지원 · 데이터 미수집 · 오픈소스" },
  };

  const tr = (k, l) => (T[k] ? (T[k][l] || T[k].en) : "");
  function resolveLang() {
    const s = localStorage.getItem("site_lang");
    if (s && LANGS.some(([c]) => c === s)) return s;
    const n = (navigator.language || "en").toLowerCase();
    if (n.startsWith("ja")) return "ja";
    if (n.startsWith("pt")) return "pt_BR";
    if (n.startsWith("ko")) return "ko";
    if (n.startsWith("zh")) return (n.includes("tw") || n.includes("hant") || n.includes("hk") || n.includes("mo")) ? "zh_TW" : "zh_CN";
    for (const [c] of LANGS) if (n.startsWith(c.split("_")[0])) return c;
    return "en";
  }
  function apply(l) {
    document.documentElement.lang = l.replace("_", "-");
    document.querySelectorAll("[data-i18n]").forEach((el) => { const v = tr(el.dataset.i18n, l); if (v) el.textContent = v; });
    document.querySelectorAll("[data-i18n-content]").forEach((el) => { const v = tr(el.dataset.i18nContent, l); if (v) el.setAttribute("content", v); });
  }
  function switcher(l) {
    const host = document.getElementById("lang-switcher"); if (!host) return;
    const g = document.createElement("div"); g.className = "input-group input-group-sm"; g.style.width = "auto";
    const ic = document.createElement("span"); ic.className = "input-group-text"; ic.innerHTML = '<i class="bi bi-translate"></i>';
    const sel = document.createElement("select"); sel.className = "form-select form-select-sm"; sel.style.maxWidth = "10rem";
    sel.setAttribute("aria-label", "Language / 言語"); sel.title = "Language / 言語";
    for (const [c, n] of LANGS) { const o = document.createElement("option"); o.value = c; o.textContent = n; if (c === l) o.selected = true; sel.appendChild(o); }
    sel.addEventListener("change", () => { localStorage.setItem("site_lang", sel.value); apply(sel.value); });
    g.appendChild(ic); g.appendChild(sel); host.appendChild(g);
  }
  const lang = resolveLang(); apply(lang); switcher(lang);
})();
