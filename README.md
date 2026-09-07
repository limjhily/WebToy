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
build.js              전부 한 파일로 합치기 → dist/single-file.html
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

## 링크 길이에 대해

카드 내용이 링크에 담기므로 **사진을 넣으면 링크가 길어집니다**(대략 6만 자).
사진 없이 만들면 300자 안팎이라 어디에 붙여넣어도 안전합니다.
사진은 최대 720px, 약 34KB까지 자동 압축되며, 링크가 길어지면 제작 화면에서 안내합니다.
