/* ─────────────────────────────────────────────
   confetti.js — 캔버스 색종이/반짝이 효과 (외부 라이브러리 없음)
   ───────────────────────────────────────────── */
(function (g) {
  'use strict';

  let cvs, ctx, parts = [], raf = null, dpr = 1;

  function mount() {
    if (cvs) return;
    cvs = document.createElement('canvas');
    cvs.className = 'confetti-layer';
    Object.assign(cvs.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '90'
    });
    document.body.appendChild(cvs);
    ctx = cvs.getContext('2d');
    resize();
    addEventListener('resize', resize);
  }

  function resize() {
    if (!cvs) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cvs.width = innerWidth * dpr;
    cvs.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const rnd = (a, b) => a + Math.random() * (b - a);

  /** 한 지점에서 색종이가 터진다. opts: {x,y,count,colors,power,ribbon} */
  function burst(opts) {
    const o = Object.assign({
      x: innerWidth / 2, y: innerHeight * .45, count: 90, power: 15,
      colors: ['#e2557a', '#ffd166', '#5bc0be', '#8f7bff', '#ffffff'],
      spread: Math.PI * 2, dir: -Math.PI / 2
    }, opts || {});
    mount();
    for (let i = 0; i < o.count; i++) {
      const ang = o.dir + rnd(-o.spread / 2, o.spread / 2);
      const sp = rnd(o.power * .35, o.power);
      parts.push({
        x: o.x, y: o.y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        w: rnd(5, 11), h: rnd(7, 15),
        rot: rnd(0, Math.PI * 2), vr: rnd(-.28, .28),
        color: o.colors[(Math.random() * o.colors.length) | 0],
        life: 1, decay: rnd(.006, .013),
        shape: Math.random() < .28 ? 'circle' : 'rect'
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /** 화면 위에서 천천히 내려오는 꽃가루 */
  function rain(count, colors) {
    mount();
    for (let i = 0; i < (count || 40); i++) {
      parts.push({
        x: rnd(0, innerWidth), y: rnd(-innerHeight * .6, -10),
        vx: rnd(-.6, .6), vy: rnd(1.2, 3.2),
        w: rnd(4, 9), h: rnd(6, 12),
        rot: rnd(0, 6.28), vr: rnd(-.15, .15),
        color: (colors || ['#e2557a', '#ffd166', '#8f7bff', '#ffffff'])[(Math.random() * 4) | 0],
        life: 1, decay: .0035, drift: rnd(.01, .03), phase: rnd(0, 6.28),
        shape: Math.random() < .3 ? 'circle' : 'rect'
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += 0.22;
      p.vx *= 0.985; p.vy *= 0.985;
      if (p.drift) { p.phase += p.drift; p.x += Math.sin(p.phase) * .8; }
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > innerHeight + 60) { parts.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.283); ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.4 + 0.6 * Math.abs(Math.cos(p.rot))));
      }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /** 축하 연출 한 세트 */
  function celebrate(colors) {
    const c = colors && colors.length ? colors : null;
    burst({ x: innerWidth * .5, y: innerHeight * .42, count: 110, power: 17, colors: c || undefined });
    setTimeout(() => burst({ x: innerWidth * .18, y: innerHeight * .55, count: 55, power: 13, colors: c || undefined }), 180);
    setTimeout(() => burst({ x: innerWidth * .82, y: innerHeight * .55, count: 55, power: 13, colors: c || undefined }), 320);
    setTimeout(() => rain(46, c || undefined), 500);
  }

  g.Confetti = { burst, rain, celebrate };
})(window);
