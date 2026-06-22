# BlogAi — AI 기술 블로그 작성 플랫폼

개발자가 주제·키워드·템플릿만 입력하면 AI가 **마크다운 기술 블로그 글**을 생성하고, Supabase에 저장·조회할 수 있는 웹 서비스입니다.

**[https://www.blogai.store](https://www.blogai.store)**

Next.js App Router, Feature-Sliced Design(FSD), Gemini/OpenAI API, Supabase를 활용한 **프론트엔드 중심 사이드 프로젝트**입니다.

---

## 주요 기능

| 기능                 | 설명                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **AI 글 생성**       | Gemini 또는 OpenAI로 제목·본문·키워드·메타 설명을 JSON 형태로 생성             |
| **생성·저장 플로우** | `/write/generating`에서 로딩 → 자동 저장 → 상세 페이지 이동                    |
| **템플릿 기반 작성** | TIL, 트러블슈팅, 딥다이브 등 스타일별 시스템 프롬프트 적용                     |
| **마크다운 렌더링**  | `react-markdown` + GFM + 코드 하이라이팅(SyntaxHighlighter)                    |
| **글 저장·관리**     | Supabase에 포스트 저장, 마이페이지·상세 페이지에서 조회·수정·삭제              |
| **저장 한도**        | 사용자당 최대 10개 포스트 (클라이언트·서버 이중 검증)                          |
| **소셜 로그인**      | Supabase OAuth 기반 인증                                                       |
| **생성 상태 동기화** | `useSyncExternalStore`로 sessionStorage 생성 상태를 하이드레이션 안전하게 구독 |
| **SEO**              | `sitemap.xml`, `robots.txt` 메타데이터 제공                                    |

---

## 기술 스택

| 영역            | 기술                                                  |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19, TypeScript         |
| Styling         | Tailwind CSS 4, `@tailwindcss/typography`             |
| AI              | Google Gemini (`gemini-2.5-flash`), OpenAI (선택)     |
| Database / Auth | Supabase (PostgreSQL, OAuth)                          |
| State           | TanStack Query (서버 상태), Zustand (클라이언트 상태) |
| Markdown        | react-markdown, remark-gfm, react-syntax-highlighter  |
| UI              | lucide-react, react-toastify                          |
| Architecture    | Feature-Sliced Design (FSD)                           |

---

## AI 글 생성 플로우 (핵심 구현)

글 생성은 **작성 페이지 → 생성 페이지 → 자동 저장 → 상세 페이지** 3단계로 이어집니다.

```
/write
  → sessionStorage에 작성 정보 저장
  → Cookie 1회 진입 토큰 발급 (grantGeneratingPageEntry)
  → /write/generating

/write/generating
  → proxy: Cookie 없으면 /write 리다이렉트
  → useArticleGeneration: POST /api/gemini | /api/openai
  → JSON { title, content, keywords, metaDescription }
  → useGeneratingDraft: 자동 저장 (POST /api/supabase)
  → TanStack Query 캐시 무효화 → /post/[id] 이동
```

### 생성 상태 관리

작성 중·완료·오류 상태는 `sessionStorage`에 보관하고, `useGenerationStatus` 훅이 `useSyncExternalStore`로 구독합니다. SSR과 CSR 간 상태 불일치(하이드레이션 mismatch)를 방지하기 위한 구조입니다.

| 상태         | 동작                                   |
| ------------ | -------------------------------------- |
| `generating` | 생성 페이지에서 AI API 호출 중         |
| `done`       | 생성 완료, 결과 sessionStorage 캐시    |
| `error`      | 생성 실패, 작성 페이지에서 재시도 안내 |

`/write`의 BottomCta는 생성 상태에 따라 버튼 문구·안내 메시지를 동적으로 변경합니다.

### 저장 한도 검증

| 시점           | 검증 위치                                                        |
| -------------- | ---------------------------------------------------------------- |
| 생성 버튼 클릭 | 클라이언트 `ensureUnderStoredPostLimit()`                        |
| AI API 호출    | 서버 `gateStoredPostLimitForAi()` — `/api/gemini`, `/api/openai` |
| 저장 API 호출  | 클라이언트 `ensureUnderStoredPostLimit()` + 서버 인증            |

### 관련 파일

| 파일                                                       | 역할                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `proxy.ts`                                                 | `/write/generating` Cookie 가드, `/dashboard`·`/write` 인증 가드 |
| `src/features/article-write/lib/writeGeneratingSession.ts` | sessionStorage·Cookie·생성 상태 이벤트                           |
| `src/features/article-write/model/useGenerationStatus.ts`  | `useSyncExternalStore` 기반 상태 구독                            |
| `src/features/article-write/model/useArticleGeneration.ts` | 클라이언트 AI fetch                                              |
| `src/features/article-write/model/useGeneratingDraft.ts`   | phase 관리, 자동 저장, `useRef`로 중복 저장 방지                 |
| `src/features/article-write/lib/saveGeneratedArticle.ts`   | 저장 API 호출 및 세션 정리                                       |
| `src/app/api/gemini/route.ts`                              | Gemini JSON 생성, 저장 한도·인증 게이트                          |
| `src/app/api/supabase/route.ts`                            | posts INSERT, 요청 본문 검증                                     |

---

## 페이지 구조

| 경로                  | 설명                                                |
| --------------------- | --------------------------------------------------- |
| `/`                   | 랜딩 페이지                                         |
| `/dashboard`          | 대시보드 (로그인 필요)                              |
| `/write`              | 블로그 작성 — 템플릿·주제·키워드 입력 (로그인 필요) |
| `/write/generating`   | AI 생성 + 자동 저장                                 |
| `/post`, `/post/[id]` | 글 목록·상세 (수정 가능)                            |
| `/mypage`             | 내 글 관리 — 필터·검색·페이지네이션·삭제            |
| `/example`            | 템플릿 예시                                         |

### API Routes

| 경로                 | 설명                  |
| -------------------- | --------------------- |
| `POST /api/gemini`   | Gemini 글 생성 (JSON) |
| `POST /api/openai`   | OpenAI 글 생성 (JSON) |
| `POST /api/supabase` | Supabase posts INSERT |

---

## 프로젝트 구조 (FSD)

[next.js `src` 디렉터리](https://nextjs.org/docs/app/building-your-application/configuring/src-directory) + [Feature-Sliced Design](https://feature-sliced.design/)을 사용합니다.

```
src/
├── app/                    # Next.js 라우팅·API Route·글로벌 스타일
├── widgets/                # Header, Landing, AppShell 등 UI 블록
├── features/               # 사용자 인터랙션 단위
│   ├── article-write/      # 글 작성·AI 생성 플로우
│   ├── auth/               # 소셜 로그인
│   ├── dashboard/          # 대시보드
│   ├── mypage/             # 내 글 관리
│   ├── post-view/          # 글 상세·수정
│   └── delete-template/    # 삭제 모달
├── entities/               # article, template, user (도메인·API)
└── shared/                 # ui, api(supabase), lib, config, types
```

- 경로 별칭: `@/*` → `./src/*`
- FSD 규칙: `.cursor/skills/feature-sliced-design/SKILL.md`
- 레이어는 위에서 아래로만 import (features → entities → shared)

---

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
# 또는
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Provider: gemini | openai (미설정·그 외 값이면 openai)
NEXT_PUBLIC_AI_PROVIDER=gemini

# Gemini (서버 전용 권장)
GEMINI_API_KEY=
# GEMINI_MODEL=gemini-2.5-flash   # 선택, 기본값 gemini-2.5-flash

# OpenAI (NEXT_PUBLIC_AI_PROVIDER=openai 일 때)
OPENAI_API_KEY=
# OPENAI_MODEL=gpt-4o-mini
```

> `GEMINI_API_KEY`는 서버 전용 env를 권장합니다. `NEXT_PUBLIC_` 접두사는 클라이언트에 노출될 수 있습니다.

### 3. 개발 서버

```bash
pnpm dev
# 또는
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

---

## 스크립트

| 명령어       | 설명             |
| ------------ | ---------------- |
| `pnpm dev`   | 개발 서버 실행   |
| `pnpm build` | 프로덕션 빌드    |
| `pnpm start` | 빌드 결과물 실행 |
| `pnpm lint`  | ESLint 실행      |

---

## Git Hooks (선택)

커밋 메시지 컨벤션·푸시 전 빌드 검사 hook은 아래로 설치할 수 있습니다.

```bash
bash scripts/install-hooks.sh
```

규칙: `.cursor/skills/git-commit-messages/SKILL.md`

---

## 참고 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Feature-Sliced Design](https://feature-sliced.design/)
