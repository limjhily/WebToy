/* ─────────────────────────────────────────────
   app.js — 한 페이지에서 두 화면을 나눠 띄우는 라우터
   주소에 #c=... 가 있으면 "받은 카드", 없으면 "카드 만들기"
   ───────────────────────────────────────────── */
(function () {
  'use strict';
  const isCard = /(^|[#?&])c=/.test(location.hash) || /(^|[?&])c=/.test(location.search);
  if (isCard) window.CardApp.boot();
  else window.MakerApp.init();
})();
