/* ─────────────────────────────────────────────
   data.js — 템플릿 · 테마 · BGM 목록 (제작기와 카드가 함께 사용)
   ───────────────────────────────────────────── */
(function (g) {
  'use strict';

  const TEMPLATES = [
    { id:'giftbox',  name:'선물상자',   hint:'상자를 탭해서 열어보세요',
      desc:'탭하면 리본이 풀리고 뚜껑이 열립니다', emoji:'🎁', theme:'rose' },
    { id:'envelope', name:'편지 봉투',  hint:'봉투를 탭해서 열어보세요',
      desc:'봉인이 떨어지고 편지가 스르륵 올라옵니다', emoji:'💌', theme:'sunset' },
    { id:'cake',     name:'생일 케이크', hint:'촛불을 탭해서 꺼주세요',
      desc:'촛불을 끄면 축하 폭죽이 터집니다', emoji:'🎂', theme:'night' },
    { id:'scratch',  name:'스크래치',   hint:'손가락으로 문질러 보세요',
      desc:'긁어서 숨겨진 메시지를 공개합니다', emoji:'🪙', theme:'mint' },
    { id:'balloon',  name:'풍선 터뜨리기', hint:'풍선을 탭해서 터뜨리세요',
      desc:'풍선이 팡 터지며 카드가 나타납니다', emoji:'🎈', theme:'forest' },
    { id:'curtain',  name:'커튼콜',     hint:'커튼을 탭해서 열어보세요',
      desc:'무대 커튼이 양옆으로 걷힙니다', emoji:'🎭', theme:'mono' }
  ];

  const THEMES = [
    { id:'rose',   name:'로즈',   swatch:['#fbe7ee','#e2557a'] },
    { id:'sunset', name:'선셋',   swatch:['#fde3d0','#f0722c'] },
    { id:'mint',   name:'민트',   swatch:['#e2f2ee','#159c86'] },
    { id:'forest', name:'포레스트', swatch:['#e6eddc','#4b7f3c'] },
    { id:'night',  name:'나이트',  swatch:['#171a33','#8f7bff'] },
    { id:'mono',   name:'모노',   swatch:['#ecebe8','#1a1a1a'] }
  ];

  const BGMS = [
    { id:'none',    name:'없음',     emoji:'🔇' },
    { id:'orgel',   name:'오르골',   emoji:'🎶' },
    { id:'fanfare', name:'축하 팡파레', emoji:'🎉' },
    { id:'wave',    name:'잔잔한 물결', emoji:'🌊' },
    { id:'twinkle', name:'반짝반짝',  emoji:'✨' }
  ];

  const DEFAULTS = {
    v: 1,
    t: 'giftbox',
    th: 'rose',
    title: '',
    to: '',
    msg: '',
    from: '',
    bgm: 'orgel',
    img: null
  };

  const byId = (list, id, fallback) =>
    list.find(x => x.id === id) || list.find(x => x.id === fallback) || list[0];

  g.WT = { TEMPLATES, THEMES, BGMS, DEFAULTS, byId };
})(window);
