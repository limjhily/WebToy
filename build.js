/*
 * build.js — 흩어져 있는 CSS/JS를 하나의 HTML 파일로 합칩니다.
 *   node build.js  →  dist/single-file.html
 *
 * 정적 호스팅(GitHub Pages)에는 저장소 그대로 올리면 되고,
 * 이 단일 파일은 "파일 하나만 올리는" 환경(아티팩트 등)에서 씁니다.
 * 파일 하나 안에 모든 것이 들어 있으므로 링크만으로 그대로 동작합니다.
 */
const fs = require('fs');
const path = require('path');

const read = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const html = read('index.html');

const grab = (re) => {
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
};

const cssFiles = grab(/<link rel="stylesheet" href="([^"]+)">/g);
const jsFiles  = grab(/<script src="([^"]+)"><\/script>/g);

// 폰트 CDN은 환경에 따라 막힐 수 있어 단일 파일에서는 시스템 폰트로 대체
const css = cssFiles.map(read).join('\n')
  .replace(/@import url\([^)]*\);\s*/g, '');
const js = jsFiles.map(read).join('\n;\n');

const title = (html.match(/<title>([^<]*)<\/title>/) || [, '마음카드'])[1];

const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script src="[^"]+"><\/script>\s*/g, '')
  .trim();

const out = `<title>${title}</title>
<style>
${css}
</style>
${body}
<script>
${js}
</script>
`;

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist/single-file.html'), out);
console.log('dist/single-file.html', (out.length / 1024).toFixed(1) + 'KB');
