/* ─────────────────────────────────────────────
   scenes.js — 템플릿별 커버 연출 + 여는 인터랙션
   build(el, templateId, onOpen) 하나로 제작기 미리보기와 카드가 공유한다.
   ───────────────────────────────────────────── */
(function (g) {
  'use strict';

  const MARKUP = {
    giftbox: `<div class="gift">
        <div class="pop"></div>
        <div class="box"></div>
        <div class="lid"></div>
        <div class="bow"><i></i><i></i><b></b></div>
      </div>`,
    envelope: `<div class="env">
        <div class="body"></div>
        <div class="paper"><i></i><i></i><i></i><i></i></div>
        <div class="flap"></div>
        <div class="seal">✦</div>
      </div>`,
    cake: `<div class="cake">
        <div class="tier t2"><div class="candle"></div><div class="flame"></div><div class="smoke"></div></div>
        <div class="tier t1"></div>
      </div>`,
    scratch: `<div class="scratch">
        <div class="under"><span>🎉</span></div>
        <canvas></canvas>
      </div>`,
    balloon: `<div class="balloon-wrap">
        <div class="balloon"><span class="string"></span></div>
      </div>`,
    curtain: `<div class="curtain">
        <div class="star">✨</div>
        <div class="half l"></div><div class="half r"></div>
        <div class="rail"></div>
      </div>`
  };

  const SOUND = { giftbox:'pop', envelope:'up', cake:'down', scratch:'up', balloon:'pop', curtain:'up' };

  /* 스크래치 카드: 은박을 문질러 지우는 캔버스 */
  function initScratch(root, done) {
    const cvs = root.querySelector('canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let finished = false, drawing = false, sampled = 0;

    function paint() {
      const r = cvs.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cvs.width = Math.max(1, r.width * dpr);
      cvs.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gr = ctx.createLinearGradient(0, 0, r.width, r.height);
      gr.addColorStop(0, '#c9ccd6'); gr.addColorStop(.35, '#9aa0b0');
      gr.addColorStop(.55, '#dfe3ea'); gr.addColorStop(1, '#8e93a3');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.font = '600 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('여기를 문질러 주세요', r.width / 2, r.height / 2 + 5);
      ctx.globalCompositeOperation = 'destination-out';
    }

    function pos(e) {
      const r = cvs.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }

    function scratchAt(e) {
      if (finished) return;
      const { x, y } = pos(e);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(22, cvs.clientWidth * .09), 0, 6.283);
      ctx.fill();
      if (++sampled % 8 === 0) check();
    }

    function check() {
      const d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < d.length; i += 4 * 40) { total++; if (d[i] < 40) clear++; }
      if (total && clear / total > .42) { finished = true; done(); }
    }

    const start = e => { drawing = true; scratchAt(e); e.preventDefault(); };
    const move = e => { if (drawing) { scratchAt(e); e.preventDefault(); } };
    const end = () => { drawing = false; if (!finished) check(); };

    cvs.addEventListener('pointerdown', start);
    cvs.addEventListener('pointermove', move);
    addEventListener('pointerup', end);
    addEventListener('resize', () => { if (!finished) paint(); });
    requestAnimationFrame(paint);
  }

  /**
   * @param {HTMLElement} el   .scene 요소
   * @param {string} tpl       템플릿 id
   * @param {Function} onOpen  열렸을 때 호출
   * @param {Object} [opt]     {emoji:'🎉'} 스크래치 밑그림
   */
  function build(el, tpl, onOpen, opt) {
    const id = MARKUP[tpl] ? tpl : 'giftbox';
    el.className = 'scene';
    el.dataset.tpl = id;
    el.innerHTML = MARKUP[id];

    let opened = false;
    function open() {
      if (opened) return;
      opened = true;
      el.classList.add('is-open');
      try { g.BGM && g.BGM.blip(SOUND[id]); } catch (e) {}
      if (onOpen) onOpen();
    }

    if (id === 'scratch') {
      if (opt && opt.emoji) el.querySelector('.under span').textContent = opt.emoji;
      initScratch(el, open);
    } else {
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    }
    return { open, isOpen: () => opened };
  }

  g.Scenes = { build, MARKUP };
})(window);
