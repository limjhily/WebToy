# 마음카드 (WebToy)

링크 하나로 보내는 **인터랙티브 웹 카드**.
가입·설치 없이 몇 가지만 고르면 공유 링크가 만들어지고, 카카오톡에 붙여넣기만 하면 끝입니다.

## 특징

- **서버 없음** — 카드 내용이 링크(URL 해시) 안에 압축되어 담깁니다. DB도, 로그인도 없습니다.
- **여는 연출 6종** — 선물상자 / 편지봉투 / 생일 케이크 / 스크래치 / 풍선 / 커튼콜
- **테마 6종** — 로즈 · 선셋 · 민트 · 포레스트 · 나이트 · 모노
- **BGM 4종** — Web Audio API로 그때그때 합성합니다 (음원 파일 0바이트)
- **사진 첨부** — 링크에 담기도록 자동으로 축소·압축
- **실시간 미리보기** — 만드는 화면 옆에서 실제 카드가 바로 보입니다
- 외부 라이브러리 없음 (폰트 CDN 하나뿐, 없어도 동작)

## 폴더 구조

```
index.html            제작 화면 + 카드 화면 (한 페이지, #c=… 이면 카드 모드)
card.html             예전 링크 호환용 리다이렉트
assets/css/base.css   공통 디자인 토큰
assets/css/themes.css 카드 테마 팔레트
assets/css/card.css   카드 화면 + 여는 연출
assets/css/maker.css  제작 화면
assets/js/codec.js    카드 데이터 ↔ URL 해시 (압축 + base64url)
assets/js/data.js     템플릿·테마·BGM 목록
assets/js/audio.js    BGM 합성
assets/js/confetti.js 색종이 효과
assets/js/scenes.js   템플릿별 연출과 인터랙션
assets/js/card.js     카드 화면 로직
assets/js/maker.js    제작 화면 로직
assets/js/app.js      두 화면을 나누는 라우터
assets/og/cover.jpg   링크 미리보기 썸네일 (1200×630)
build.js              전부 한 파일로 합치기 → dist/single-file.html
tools/og-template.html 썸네일 디자인 원본
tools/make-og.js       썸네일을 PNG/JPG로 굽는 스크립트
```

## 실행

빌드가 필요 없습니다. 정적 서버로 열기만 하면 됩니다.

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## 배포

**GitHub Pages** — 저장소 Settings → Pages → Source를 이 브랜치 / `root` 로 지정하면 끝.
공유 링크는 `https://<사용자>.github.io/WebToy/#c=…` 형태가 됩니다.

**파일 하나로 배포** — `node build.js` 를 실행하면 `dist/single-file.html` 이 만들어집니다.
CSS·JS가 모두 인라인되어 있어 그 파일 하나만 올려도 동작합니다.

## 링크 미리보기 (OG 썸네일)

카카오톡·문자·인스타에 링크를 붙여넣으면 `assets/og/cover.jpg` 가 미리보기로 뜹니다.

- `og:image` 는 **절대 주소만** 인식되므로, GitHub Pages가 아닌 곳에 올린다면
  `index.html` 상단의 `https://limjhily.github.io/WebToy/` 부분을 실제 주소로 바꿔주세요.
- 썸네일을 새로 만들려면 `tools/og-template.html` 을 수정하고
  `npm i -D playwright && node tools/make-og.js` 를 실행합니다.
- 카카오톡은 미리보기를 캐시합니다. 이미지를 바꿨는데 예전 것이 보이면
  [카카오 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화하세요.

### 카드마다 다른 썸네일은 왜 안 되나요

카드 내용은 주소의 `#` 뒤(해시)에 담기는데, **해시는 서버로 전송되지 않습니다.**
게다가 카카오톡 미리보기 봇은 자바스크립트를 실행하지 않습니다.
그래서 서버 없이는 "지훈아 생일 축하해" 같은 개별 문구를 썸네일에 넣을 수 없고,
모든 카드 링크가 위의 공통 썸네일을 공유합니다.
카드마다 다른 썸네일이 필요하면 Cloudflare Workers · Vercel 같은 곳에
이미지를 그려주는 작은 서버를 붙여야 합니다.

## 링크 길이에 대해

카드 내용이 링크에 담기므로 **사진을 넣으면 링크가 길어집니다**(대략 6만 자).
사진 없이 만들면 300자 안팎이라 어디에 붙여넣어도 안전합니다.
사진은 최대 720px, 약 34KB까지 자동 압축되며, 링크가 길어지면 제작 화면에서 안내합니다.
