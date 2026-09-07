/*
 * make-og.js — tools/og-template.html 을 1200×630 PNG로 굽습니다.
 *   npm i -D playwright && node tools/make-og.js
 * 결과: assets/og/cover.jpg  (카카오톡·트위터 링크 미리보기 이미지)
 *
 * 이미지 디자인을 바꾸려면 tools/og-template.html 만 고치고 다시 실행하세요.
 */
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1
  });
  await page.goto('file://' + path.join(__dirname, 'og-template.html'));
  await page.waitForTimeout(600);          // 폰트·그라디언트가 자리잡을 시간
  await page.locator('.og').screenshot({
    path: path.join(__dirname, '..', 'assets/og/cover.jpg'),
    type: 'jpeg', quality: 88
  });
  await browser.close();
  console.log('assets/og/cover.jpg 생성 완료 (1200×630)');
})();
