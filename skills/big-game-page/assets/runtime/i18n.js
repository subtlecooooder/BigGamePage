/* Presentation-only localization. The pinned engine, models and game state stay intact. */
(() => {
  const messages = /* BIGGAMEPAGE_EN */;
  const R = BGP.recipe, english = R.locales.en;
  messages[R.title] = english.title;
  messages[R.brief] = english.brief;
  R.objectives.forEach((text, index) => { messages[text] = english.objectives[index]; });
  const storageKey = 'big-game-page.language.v1';
  const params = new URLSearchParams(location.search);
  const canonical = value => /^zh(?:-|$)/i.test(value || '') ? 'zh' : /^en(?:-|$)/i.test(value || '') ? 'en' : value === 'auto' ? 'auto' : null;
  const browserLanguage = languages => {
    for (const language of languages || []) { const value = canonical(language); if (value && value !== 'auto') return value; }
    return 'en';
  };
  let stored = null, storageAvailable = true;
  try { stored = canonical(localStorage.getItem(storageKey)); } catch { storageAvailable = false; }
  let preference = canonical(params.get('lang')) || stored || 'auto';
  const browserLanguages = () => navigator.languages?.length ? [...navigator.languages] : [navigator.language || 'en'];
  let language = preference === 'auto' ? browserLanguage(browserLanguages()) : preference;
  const listeners = new Set(), cache = new Map(), missing = new Set();
  const han = /[\u3400-\u9fff]/;
  const escapeRE = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Single-character labels are translated only as complete labels. They must not
  // corrupt an unknown proper noun. Numeric units and quality labels are explicit.
  const phrases = new RegExp(Object.keys(messages).filter(key => key.length > 1).sort((a, b) => b.length - a.length).map(escapeRE).join('|'), 'g');
  function translate(text) {
    if (typeof text !== 'string' || language === 'zh' || !han.test(text)) return text;
    if (cache.has(text)) return cache.get(text);
    const trimmed = text.trim();
    let result;
    if (Object.hasOwn(messages, trimmed)) result = text.replace(trimmed, messages[trimmed]);
    else {
      result = text.replace(/（(低|中|高|极高|默认)）/g, (_, quality) => '(' + messages[quality] + ')')
        .replace(/Q 放下后战斗 · 警戒第\s*(\d+)\s*波/g, 'Q: drop to fight · Wave $1')
        .replace(/第\s*(\d+)\s*波增援抵达/g, 'Wave $1 reinforcements arrived')
        .replace(/第\s*(\d+)\s*波/g, 'Wave $1')
        .replace(/(\d)\s*(米|秒)(?=$|[ ·、，。；])/g, (_, number, unit) => number + (unit === '米' ? ' m' : ' s'))
        .replace(/(\d)\s*次(?=$|[ ·、，。；])/g, '$1')
        .replace(phrases, key => messages[key])
        .replace(/\s或\s/g, ' or ');
    }
    result = result.replace(/[，、]/g, ', ').replace(/。/g, '. ').replace(/；/g, '; ').replace(/：/g, ': ')
      .replace(/！/g, '! ').replace(/？/g, '? ').replace(/[“”]/g, '"').replace(/（/g, '(').replace(/）/g, ')')
      .replace(/([^\s])uses\b/g, '$1 uses').replace(/(\d)(s|waves)\b/g, '$1 $2').replace(/ {2,}/g, ' ');
    if (han.test(result) && missing.size < 160) missing.add(text);
    if (cache.size >= 768) cache.clear();
    cache.set(text, result);
    return result;
  }
  const app = document.getElementById('app');
  const textSources = new WeakMap(), attributeSources = new WeakMap();
  const skip = 'script,style,pre,code,.bgp-language,.h-obj-t,.comms-t';
  function translateNode(node) {
    if (!node.parentElement || node.parentElement.closest(skip)) return;
    const previous = textSources.get(node), current = node.nodeValue;
    const source = previous && current === previous.rendered ? previous.source : current;
    const rendered = language === 'en' && source === '关闭' && node.parentElement.closest('[data-act="close-panel"]') ? 'Close' : translate(source);
    textSources.set(node, {source, rendered});
    if (rendered !== current) node.nodeValue = rendered;
  }
  function translateAttributes(element) {
    if (element.closest(skip)) return;
    let sources = attributeSources.get(element);
    if (!sources) { sources = {}; attributeSources.set(element, sources); }
    for (const name of ['aria-label', 'title', 'placeholder']) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name), previous = sources[name];
      const source = previous && current === previous.rendered ? previous.source : current;
      const rendered = language === 'en' && name === 'aria-label' && source === '关闭' ? 'Close' : translate(source);
      sources[name] = {source, rendered};
      if (rendered !== current) element.setAttribute(name, rendered);
    }
  }
  function visit(root) {
    if (root.nodeType === 3) { translateNode(root); return; }
    if (root.nodeType !== 1 || root.closest(skip)) return;
    translateAttributes(root);
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return node.nodeType === 1 && node.matches(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    while (walk.nextNode()) {
      if (walk.currentNode.nodeType === 3) translateNode(walk.currentNode);
      else translateAttributes(walk.currentNode);
    }
  }
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') translateNode(record.target);
      else if (record.type === 'attributes') translateAttributes(record.target);
      else for (const node of record.addedNodes) visit(node);
    }
  });
  const observe = () => observer.observe(app, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
  let controls = null, select = null, hint = null;
  function renderLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.gameLanguage = language;
    document.title = (language === 'en' ? english.title : R.title) + ' · BigGamePage' + (language === 'zh' ? ' · 一页大作' : '');
    if (select) {
      select.value = preference;
      select.options[0].textContent = language === 'en' ? 'Browser language' : '跟随浏览器';
      controls.querySelector('label > span').textContent = language === 'en' ? 'Language' : '语言';
      hint.textContent = language === 'en' ? 'Also available when paused · Esc / P' : '暂停时也可切换 · Esc / P';
    }
    observer.disconnect();
    visit(app);
    observe();
  }
  function choose(value, persist = true) {
    preference = canonical(value) || 'auto';
    language = preference === 'auto' ? browserLanguage(browserLanguages()) : preference;
    cache.clear();
    if (persist) {
      try { preference === 'auto' ? localStorage.removeItem(storageKey) : localStorage.setItem(storageKey, preference); } catch { storageAvailable = false; }
      // A manual selection must also replace a deep-link override on reload.
      try { const url = new URL(location.href); url.searchParams.set('lang', preference); history.replaceState(null, '', url); } catch {}
    }
    renderLanguage();
    for (const listener of listeners) listener(language);
  }
  BGP.i18n = {
    t: translate,
    get lang() { return language; },
    onChange(listener) { listeners.add(listener); },
    snapshot() { return {language,preference,browserLanguages:browserLanguages(),storageAvailable,untranslated:[...missing]}; }
  };
  // This wrapper is installed last, after each archetype has selected its game factory.
  BGP.wrap('game', old => context => {
    const game = old(context);
    controls = document.createElement('aside'); controls.className = 'bgp-language';
    controls.innerHTML = '<label><span>Language</span><select aria-label="Language / 语言"><option value="auto">Browser language</option><option value="zh">简体中文</option><option value="en">English</option></select></label><small></small>';
    document.getElementById('ui').append(controls);
    select = controls.querySelector('select'); hint = controls.querySelector('small');
    select.addEventListener('change', () => choose(select.value));
    // Menu controls must not send movement/restart shortcuts into the game.
    controls.addEventListener('keydown', event => event.stopPropagation());
    controls.addEventListener('pointerdown', event => event.stopPropagation());
    const visibility = () => { controls.hidden = !['title','paused','dead','complete'].includes(game.state); };
    context.events.on('game:state', visibility);
    visibility(); renderLanguage();
    return game;
  });
  addEventListener('languagechange', () => { if (preference === 'auto') choose('auto', false); });
  renderLanguage();
})();
