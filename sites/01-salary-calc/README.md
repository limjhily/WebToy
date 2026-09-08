# 월급계산소 — sites/01-salary-calc

2026년 요율 기준 직장인 급여·세금 계산기 6종 + 애드센스 필수 페이지 3종. 빌드 없음, 정적 파일만.

## 로컬 실행
```bash
cd sites/01-salary-calc && python3 -m http.server 8080
```

## Cloudflare Pages 배포
1. Pages → Create project → 이 저장소 연결
2. Build command: 비움 / Build output directory: `sites/01-salary-calc`
3. Custom domain 연결 (애드센스는 `*.pages.dev` 승인 안 됨)

## 배포 전 바꿀 것
- 모든 HTML·robots.txt·sitemap.xml 의 `YOUR-DOMAIN.com` → 실제 도메인 (`grep -rl YOUR-DOMAIN . | xargs sed -i 's/YOUR-DOMAIN.com/실제도메인/g'`)
- `contact.html` 의 `YOUR-EMAIL@example.com`
- 애드센스 승인 후: 각 HTML `<head>` 주석 자리에 스크립트, `.ad-slot` 안에 광고 코드, 루트에 `ads.txt`

## 요율 갱신
`assets/rates.js` 한 파일만 수정. 1월(세율·최저임금·실업급여 상하한), 7월(국민연금 기준소득월액 상하한).

---

## 애드센스 수익형 사이트 프로젝트 (2026-09~)

- `docs/adsense-niche-research.md` — 국내외 조사로 뽑은 수익 분야 20개, 벤치마크, 제작 순서, 승인 체크리스트
- `sites/01-salary-calc/` — 1순위 사이트 "월급계산소" (연봉 실수령액·4대보험·퇴직금·실업급여·주휴수당·연차). 정적 파일, Cloudflare Pages 배포용
