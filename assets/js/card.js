/* ─────────────────────────────────────────────
   card.js — 링크를 해석해 카드를 그리고 여는 화면
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const body = document.body;

  function payloadFromUrl() {
    const h = location.hash.replace(/^#/, '');
    if (h.startsWith('c=')) return decodeURIComponent(h.slice(2));
    const q = new URLSearchParams(location.search).get('c');
    return q || (h || null);
  }

  function themeColors() {
    const cs = getComputedStyle(document.documentElement.querySelector ? body : body);
    const pick = n => (cs.getPropertyValue(n) || '').trim();
    return [pick('--t-accent'), pick('--t-accent-2'), pick('--t-sparkle'), '#ffffff']
      .filter(Boolean);
  }

  function show(el) { el.hidden = false; }

  async function boot() {
    document.body.classList.add('card-body');
    const maker = document.getElementById('maker');
    if (maker) maker.remove();
    document.getElementById('cardApp').hidden = false;

    const raw = payloadFromUrl();
    const data = raw ? await window.Codec.decode(raw) : null;

    if (!data || typeof data !== 'object') { show($('oops')); return; }

    const T = window.WT;
    const tpl = T.byId(T.TEMPLATES, data.t, 'giftbox');
    const theme = T.byId(T.THEMES, data.th, 'rose');
    body.dataset.theme = theme.id;

    const to = (data.to || '').slice(0, 40);
    const from = (data.from || '').slice(0, 40);
    const title = (data.title || '').slice(0, 60);
    const msg = (data.msg || '').slice(0, 2000);

    document.title = to ? `${to}님께 도착한 카드` : '도착한 카드';

    /* 커버 */
    $('coverTo').innerHTML = to
      ? 'To.<strong></strong>'
      : '<strong></strong>';
    const strong = $('coverTo').querySelector('strong');
    strong.textContent = to || '당신에게';
    $('hintText').textContent = tpl.hint;
    show($('cover'));

    /* 편지 내용 채우기 */
    $('lTo').textContent = to ? `To. ${to}` : '';
    $('lTitle').textContent = title || '마음을 담아 보냅니다';
    $('lMsg').textContent = msg;
    if (from) { $('lFromName').textContent = from; $('lFrom').hidden = false; }
    if (data.img) { $('lImg').src = data.img; $('lPhoto').hidden = false; }

    /* 사운드 토글 */
    const soundBtn = $('sound');
    const hasBgm = data.bgm && data.bgm !== 'none' && window.BGM.has(data.bgm);
    function syncSound() { soundBtn.textContent = window.BGM.playing() ? '🔊' : '🔈'; }
    soundBtn.addEventListener('click', () => {
      if (window.BGM.playing()) window.BGM.stop(); else window.BGM.play(data.bgm);
      syncSound();
    });

    /* 열기 */
    window.Scenes.build($('scene'), tpl.id, () => {
      if (hasBgm) { window.BGM.play(data.bgm); soundBtn.hidden = false; syncSound(); }
      const cover = $('cover');
      cover.classList.add('is-gone');
      setTimeout(() => {
        cover.hidden = true;
        show($('letter'));
        body.classList.add('is-open');
        window.Confetti.celebrate(themeColors());
      }, 460);
    }, { emoji: tpl.emoji });
  }

  window.CardApp = { boot };
})();
