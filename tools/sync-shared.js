#!/usr/bin/env node
// shared/ 의 공용 파일을 각 사이트의 assets/shared/ 로 복사합니다.
// Cloudflare Pages 는 사이트 폴더 하나만 배포하므로, 상위 폴더를 참조할 수 없어 복사가 필요합니다.
// 공용 파일을 고친 뒤 `node tools/sync-shared.js` 를 실행하고 커밋하세요.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = path.join(root, 'shared');
const sitesDir = path.join(root, 'sites');
const files = fs.readdirSync(src).filter(f => fs.statSync(path.join(src, f)).isFile());
let n = 0;
for (const site of fs.readdirSync(sitesDir)) {
  const dest = path.join(sitesDir, site, 'assets', 'shared');
  if (!fs.existsSync(path.join(sitesDir, site, 'assets'))) continue;
  fs.mkdirSync(dest, { recursive: true });
  for (const f of files) { fs.copyFileSync(path.join(src, f), path.join(dest, f)); n++; }
  console.log(`  ${site} <- ${files.length}개`);
}
console.log(`완료: 파일 ${n}개 복사`);
