'use strict';
(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('#language');
  const soundButton = document.querySelector('#sound');
  const links = [...document.querySelectorAll('.play')];
  const buildStatus = document.querySelector('#build-status');
  let language = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'zh';
  let sound = false;
  let catalogReady = false;
  let catalogFailed = false;
  for (const img of document.querySelectorAll('img[data-alt-en]')) img.dataset.altZh = img.alt;

  function renderStatus() {
    buildStatus.classList.toggle('warning', catalogFailed);
    const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    buildStatus.textContent = catalogReady
      ? (language === 'zh' ? '四款游戏已就绪 · 每份严格小于 2,000,000 字节 · 默认静音' : 'Four games ready · each under 2,000,000 bytes · muted by default')
      : !catalogFailed
        ? (language === 'zh' ? '正在载入游戏列表…' : 'Loading the game list…')
        : local
          ? (language === 'zh' ? '首次运行请执行 python3 scripts/build.py，再通过本地 HTTP 服务打开此页。' : 'Run python3 scripts/build.py first, then open this page through the local HTTP server.')
          : (language === 'zh' ? '游戏列表暂时无法载入，请稍后刷新页面。' : 'The game list could not be loaded. Please refresh the page shortly.');
  }
  function renderSound() {
    soundButton.setAttribute('aria-pressed', String(sound));
    document.querySelector('#sound-label').textContent = language === 'zh' ? `声音：${sound ? '开启' : '关闭'}` : `Sound: ${sound ? 'on' : 'off'}`;
    for (const link of links) {
      link.href = `games/${link.dataset.game}.html${sound ? '' : '?noaudio=1'}`;
    }
  }
  function renderLanguage() {
    root.dataset.language = language;
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    languageButton.textContent = language === 'zh' ? 'EN ↗' : '中文 ↗';
    languageButton.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换为简体中文');
    for (const img of document.querySelectorAll('img[data-alt-en]')) img.alt = language === 'zh' ? img.dataset.altZh : img.dataset.altEn;
    document.querySelector('#copy-status').textContent = '';
    renderSound(); renderStatus();
  }
  languageButton.addEventListener('click', () => { language = language === 'zh' ? 'en' : 'zh'; renderLanguage(); });
  soundButton.addEventListener('click', () => { sound = !sound; renderSound(); });
  document.querySelector('#copy').addEventListener('click', async () => {
    const value = document.querySelector('#commands').textContent;
    const status = document.querySelector('#copy-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      status.textContent = language === 'zh' ? '已复制。请在仓库根目录的终端中执行。' : 'Copied. Run in a terminal at the repository root.';
    } catch {
      const range = document.createRange(); range.selectNodeContents(document.querySelector('#commands'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      status.textContent = language === 'zh' ? '浏览器不允许自动复制，已选中命令，请按 Ctrl/Cmd+C。' : 'Clipboard permission unavailable. Commands selected; press Ctrl/Cmd+C.';
    }
  });
  renderLanguage();
  // The showcase may read local metadata. Games themselves have no network dependency.
  fetch('games/catalog.json').then(response => {
    if (!response.ok) throw new Error('Build catalog missing');
    return response.json();
  }).then(catalog => {
    catalogReady = catalog.length === 4 && catalog.every(g => Number.isInteger(g.bytes) && g.bytes < 2000000 && links.some(a => a.dataset.game === g.id));
    catalogFailed = !catalogReady;
    renderStatus();
  }).catch(() => { catalogFailed = true; renderStatus(); });
})();
