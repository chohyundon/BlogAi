# Lighthouse 측정 결과 (2026-07-25, d88ddd0278bf44c4ce471e71de1ec70271455517)

측정 환경: `pnpm build && pnpm start` (프로덕션 빌드), `npx lighthouse` (headless Chrome, 기본 모바일 에뮬레이션/스로틀링), 커밋되지 않은 작업 중 변경사항을 stash하지 않고 현재 워킹 트리 상태 그대로 측정. Before/After 모두 동일한 커밋(`d88ddd0`)의 워킹 트리에서, 접근성 수정 diff 적용 전/후로 측정한 값.

## Before vs After

| 페이지 | 지표 | Before | After | 변화 |
|---|---|---|---|---|
| 홈 (/) | Performance | 76 | 76 | 동일 |
| 홈 (/) | Accessibility | 95 | 100 | +5 |
| 홈 (/) | Best Practices | 100 | 100 | 동일 |
| 홈 (/) | SEO | 100 | 100 | 동일 |
| 블로그 목록 (/post) | Performance | 75 | 76 | +1 (오차범위) |
| 블로그 목록 (/post) | Accessibility | 96 | 100 | +4 |
| 블로그 목록 (/post) | Best Practices | 100 | 100 | 동일 |
| 블로그 목록 (/post) | SEO | 63 | 63 | 동일 |
| 포스트 상세 (/post/[id]) | 전체 | 측정 실패 | 측정 실패 | 동일 (사유 아래 참고) |

### 결론

- **Accessibility 개선 확인됨**: 홈 95→100, 블로그 목록 96→100. 이번에 수정한 3건(CTA/하단 배너 명도 대비, 푸터 명도 대비, Aside 리스트 시맨틱)이 실제로 accessibility 감점 요인을 모두 해소했음.
- **Performance/Best Practices/SEO 회귀 없음**: 세 카테고리 모두 Before와 동일하거나(블로그 목록 Performance는 75→76으로 1점 상승, Lighthouse 측정 특성상 오차범위 내 변동이며 이번 수정과 무관) 이번 접근성 수정으로 인한 하락은 관찰되지 않음.

원본 리포트:
- Before: `lighthouse-reports/home.report.json`, `lighthouse-reports/home.report.html`, `lighthouse-reports/post-list.report.json`, `lighthouse-reports/post-list.report.html`
- After: `lighthouse-reports/after-home.report.json`, `lighthouse-reports/after-home.report.html`, `lighthouse-reports/after-post-list.report.json`, `lighthouse-reports/after-post-list.report.html`

## 포스트 상세 (/post/[id]) 측정 실패 사유 (Before와 동일)

- `.env`의 `NEXT_PUBLIC_SUPABASE_URL` 호스트(`jggpmjisybranwreqhac.supabase.co`)가 이번에도 DNS 조회 시 `NXDOMAIN`을 반환함 (`google.com`은 정상 조회되므로 샌드박스 전체 네트워크 차단이 아니라 이 특정 Supabase 호스트만의 문제).
- `/post`도 `/post/[id]`도 Supabase에서 실제 게시글 데이터를 가져오지 못해 "실제 존재하는 id"를 확보할 방법이 없었음. `/post/1`로 직접 접근해도 에러 상태(`error`/`notFound` 관련 텍스트)가 렌더링되는 것을 확인함.
- Before 측정 시와 동일한 원인, 동일한 결과이므로 이번에도 측정을 스킵함.

## After 측정에서 남아있는 이슈 (이번 접근성 수정과 무관한 항목)

### 홈 (/)

- [Performance] Largest Contentful Paint — score 0.02 (LCP 관련, Before에도 동일하게 존재하던 이슈).
- [Performance] `render-blocking-insight`, `legacy-javascript-insight`, `unused-javascript`, `network-dependency-tree-insight`, `interactive` (TTI score 0.39) — 모두 Before에서도 확인되던 성능 이슈 범주로, 이번 접근성 수정 대상이 아니었음.

### 블로그 목록 (/post)

- [Performance] 홈과 동일한 패턴(LCP score 0.03, TTI score 0.3, `unused-javascript` 등). 이 페이지는 Supabase 연결 실패로 에러/로딩 상태로 귀결되므로 실제 콘텐츠 기준 성능으로 보기 어려움 (Before 리포트에서도 동일하게 언급됨).
- [Best Practices] `valid-source-maps` (score 0) — 1차 자바스크립트 번들에 소스맵 누락. 카테고리 가중치상 전체 점수(100)에는 영향 없음. Before 리포트에는 명시적으로 기록되지 않았던 항목이나, 접근성 수정과 무관한 빌드 설정 이슈로 추정됨.
- [SEO] `is-crawlable` (score 0) — `src/app/post/page.tsx`의 `metadata.robots = { index: false, follow: false }`로 인한 의도된 noindex 설정. Before와 동일하게 유지됨.

## Best Practices

두 페이지 모두 100점 유지 (post-list의 `valid-source-maps` 개별 감점은 카테고리 총점에는 반영되지 않음).
