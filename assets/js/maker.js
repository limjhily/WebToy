/* ─────────────────────────────────────────────
   maker.js — 카드 제작 화면 로직
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const T = window.WT;
  const STORE = 'webtoy.draft.v1';

  const state = Object.assign({}, T.DEFAULTS);

  /* ── 저장된 초안 복원 ─────────────────── */
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && typeof saved === 'object') Object.assign(state, saved);
  } catch (e) {}

  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  };

  /* ── 토스트 ──────────────────────────── */
  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 1900);
  }

  /* ── 선택 UI 만들기 ──────────────────── */
  function renderTemplates() {
    $('tplGrid').innerHTML = T.TEMPLATES.map(t => `
      <button type="button" class="tpl" data-id="${t.id}" aria-pressed="false">
        <span class="emo">${t.emoji}</span>
        <b>${t.name}</b><span>${t.desc}</span>
      </button>`).join('');
    $('tplGrid').addEventListener('click', e => {
      const b = e.target.closest('.tpl');
      if (!b) return;
      state.t = b.dataset.id;
      // 템플릿을 처음 고를 때는 어울리는 테마를 함께 제안한다
      if (!state._themeTouched) {
        state.th = T.byId(T.TEMPLATES, state.t).theme;
        syncThemes();
      }
      syncTemplates();
      changed();
    });
  }
  const syncTemplates = () => document.querySelectorAll('.tpl').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.id === state.t)));

  function renderThemes() {
    $('themeRow').innerHTML = T.THEMES.map(t => `
      <button type="button" class="theme" data-id="${t.id}" aria-pressed="false" title="${t.name}">
        <span class="sw" style="background:linear-gradient(140deg,${t.swatch[0]},${t.swatch[1]})"></span>
        <small>${t.name}</small>
      </button>`).join('');
    $('themeRow').addEventListener('click', e => {
      const b = e.target.closest('.theme');
      if (!b) return;
      state.th = b.dataset.id;
      state._themeTouched = true;
      syncThemes();
      changed();
    });
  }
  const syncThemes = () => document.querySelectorAll('.theme').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.id === state.th)));

  function renderBgms() {
    $('bgmRow').innerHTML = T.BGMS.map(b => `
      <button type="button" class="chip" data-id="${b.id}" aria-pressed="false">
        ${b.emoji} ${b.name}</button>`).join('');
    $('bgmRow').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state.bgm = b.dataset.id;
      syncBgms();
      changed();
    });
  }
  const syncBgms = () => document.querySelectorAll('#bgmRow .chip').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.id === state.bgm)));

  /* ── 텍스트 입력 ─────────────────────── */
  const FIELDS = { fTo: 'to', fTitle: 'title', fMsg: 'msg', fFrom: 'from' };
  function bindFields() {
    Object.keys(FIELDS).forEach(id => {
      const el = $(id), key = FIELDS[id];
      el.value = state[key] || '';
      el.addEventListener('input', () => {
        state[key] = el.value;
        if (id === 'fMsg') $('msgCount').textContent = el.value.length;
        changed();
      });
    });
    $('msgCount').textContent = ($('fMsg').value || '').length;
  }

  /* ── 사진: 링크에 담기도록 강하게 압축 ── */
  const IMG_BUDGET = 46000;   // 링크에 담을 사진의 최대 글자 수(약 34KB)

  function shrink(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let max = 720, out = null;
          // 크기와 품질을 번갈아 낮추며 목표 용량에 맞춘다
          for (let round = 0; round < 5; round++) {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const cx = c.getContext('2d');
            cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
            cx.drawImage(img, 0, 0, w, h);
            for (let q = 0.74; q >= 0.34; q -= 0.1) {
              out = c.toDataURL('image/jpeg', q);
              if (out.length <= IMG_BUDGET) return resolve(out);
            }
            max = Math.round(max * 0.75);
          }
          resolve(out);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function bindImage() {
    $('fImg').addEventListener('change', async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { toast('이미지 파일만 올릴 수 있어요'); return; }
      toast('사진을 압축하는 중…');
      try {
        state.img = await shrink(f);
        showThumb();
        changed();
        toast('사진이 추가됐어요');
      } catch (err) {
        toast('사진을 불러오지 못했어요');
      }
      e.target.value = '';
    });
    $('removeImg').addEventListener('click', () => {
      state.img = null; showThumb(); changed();
    });
  }

  function showThumb() {
    const on = !!state.img;
    $('thumb').classList.toggle('on', on);
    $('dropZone').style.display = on ? 'none' : 'block';
    if (on) $('thumbImg').src = state.img;
  }

  /* ── 링크 만들기 ─────────────────────── */
  function payload() {
    return {
      v: 1, t: state.t, th: state.th,
      to: state.to || '', title: state.title || '',
      msg: state.msg || '', from: state.from || '',
      bgm: state.bgm, img: state.img || null
    };
  }
  const cardBase = () =>
    location.origin + location.pathname.replace(/index\.html$/, '');
  async function buildLink(data) {
    return cardBase() + '#c=' + await window.Codec.encode(data || payload());
  }

  /* ── 미리보기 ────────────────────────── */
  let prevTimer;
  async function refreshPreview() {
    // 해시만 바꾸면 iframe이 새로 로드되지 않으므로 쿼리로 강제 새로고침
    const code = await window.Codec.encode(payload());
    $('preview').src = cardBase() + '?p=' + Date.now() + '#c=' + code;
  }
  function changed() {
    save();
    clearTimeout(prevTimer);
    prevTimer = setTimeout(refreshPreview, 420);
  }

  /* ── 결과 시트 ───────────────────────── */
  function openSheet(url) {
    $('linkOut').value = url;
    $('openBtn').href = url;
    const warn = $('lenWarn');
    if (url.length > 12000) {
      warn.hidden = false;
      warn.textContent = `사진 때문에 링크가 조금 길어요(${url.length.toLocaleString()}자). ` +
        '대부분의 앱에서는 잘 열리지만, 링크가 잘린다면 사진을 빼고 다시 만들어 보세요.';
    } else warn.hidden = true;
    $('sheet').classList.add('on');
    $('sheetBg').classList.add('on');
  }
  function closeSheet() {
    $('sheet').classList.remove('on');
    $('sheetBg').classList.remove('on');
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) {}
      ta.remove();
      return ok;
    }
  }

  /* ── 이벤트 연결 ─────────────────────── */
  function bindActions() {
    const go = () => $('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('startBtn').addEventListener('click', go);
    $('jumpMake').addEventListener('click', go);
    $('reloadPrev').addEventListener('click', refreshPreview);

    $('makeLink').addEventListener('click', async () => {
      if (!state.msg.trim() && !state.title.trim()) {
        toast('메시지를 한 줄이라도 적어주세요');
        $('fMsg').focus();
        return;
      }
      openSheet(await buildLink());
    });

    $('copyBtn').addEventListener('click', async () => {
      const ok = await copy($('linkOut').value);
      toast(ok ? '복사 완료! 카톡에 붙여넣으세요' : '복사에 실패했어요. 링크를 길게 눌러 복사해주세요');
    });

    $('shareBtn').addEventListener('click', async () => {
      const url = $('linkOut').value;
      if (navigator.share) {
        try {
          await navigator.share({
            title: '💌 카드가 도착했어요',
            text: (state.to ? state.to + '님께 ' : '') + '카드를 보냈어요. 열어보세요!',
            url
          });
          return;
        } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      toast(await copy(url) ? '공유 기능이 없어 링크를 복사했어요' : '링크를 길게 눌러 복사해주세요');
    });

    $('closeSheet').addEventListener('click', closeSheet);
    $('sheetBg').addEventListener('click', closeSheet);
    addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  }

  /* ── 샘플 카드 링크 ──────────────────── */
  async function makeDemo() {
    $('demoBtn').href = await buildLink({
      v: 1, t: 'giftbox', th: 'rose', to: '지훈',
      title: '스물아홉 번째 생일, 축하해!',
      msg: '올해도 네 옆에서 케이크를 자를 수 있어서 다행이야.\n' +
           '바쁘다는 핑계로 자주 못 봤지만, 늘 같은 마음으로 응원하고 있어.\n\n' +
           '올 한 해도 웃을 일만 가득하길 🎂',
      from: '종훈', bgm: 'orgel', img: null
    });
  }

  /* ── 시작 ────────────────────────────── */
  function init() {
    const app = document.getElementById('cardApp');
    if (app) app.remove();
    renderTemplates(); renderThemes(); renderBgms();
    syncTemplates(); syncThemes(); syncBgms();
    bindFields(); bindImage(); bindActions();
    showThumb();
    refreshPreview();
    makeDemo();
  }

  window.MakerApp = { init };
})();
