# BlogAi — AI 기술 블로그 작성 플랫폼

개발자가 주제·키워드·템플릿만 입력하면 AI가 **마크다운 기술 블로그 글**을 생성하고, Supabase에 저장·조회할 수 있는 웹 서비스입니다.

Next.js App Router, Feature-Sliced Design(FSD), Gemini/OpenAI API, **AbortController 기반 요청 취소**를 활용한 **풀스택 사이드 프로젝트**입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 글 생성** | Gemini 또는 OpenAI로 제목·본문·키워드·메타 설명을 JSON 형태로 생성 |
| **생성·저장 플로우** | `/write/generating`에서 로딩 → 자동 저장 → 상세 페이지 이동 |
| **페이지 이탈 시 취소** | `AbortController`로 AI 생성·DB 저장 요청을 연쇄 중단 |
| **템플릿 기반 작성** | TIL, 트러블슈팅, 딥다이브 등 스타일별 시스템 프롬프트 적용 |
| **마크다운 렌더링** | `react-markdown` + GFM + 코드 하이라이팅(SyntaxHighlighter) |
| **글 저장·관리** | Supabase에 포스트 저장, 마이페이지·상세 페이지에서 조회 |
| **저장 한도** | 사용자당 최대 10개 포스트 (AI 생성 전·저장 전 검증) |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, `@tailwindcss/typography` |
| AI | Google Gemini (`gemini-2.5-flash`), OpenAI (선택) |
| Database | Supabase (PostgreSQL) |
| State | Zustand, React Hooks |
| Markdown | react-markdown, remark-gfm, react-syntax-highlighter |
| Architecture | Feature-Sliced Design (FSD) |

---

## AI 글 생성 & 요청 취소 (핵심 구현)

글 생성 페이지(`/write/generating`)에서는 **AI 생성 API를 한 번**, 완료 후 **저장 API를 한 번** 호출합니다.

```
/write → sessionStorage에 작성 정보 저장
  → /write/generating
  → useArticleGeneration (클라이언트, AbortController)
  → POST /api/gemini (JSON)
  → Gemini REST generateContent (request.signal 연동)
  → JSON { title, content, keywords, metaDescription }
  → useGeneratingDraft → POST /api/supabase (AbortController)
  → Supabase posts INSERT → /post/[id] 이동
```

### 페이지 이탈 시 AbortController

사용자가 생성·저장 중 **뒤로가기·다른 페이지 이동**을 하면 불필요한 AI 토큰 소비와 DB 저장을 막기 위해 요청을 연쇄 취소합니다.

| 계층 | 처리 |
|------|------|
| **클라이언트** | `useEffect` cleanup에서 `AbortController.abort()` — AI fetch·저장 fetch 모두 `signal` 전달 |
| **Next.js Route** | `request.signal.aborted` 확인 후 **499** 반환 (에러 로그 없음) |
| **Gemini upstream** | `/api/gemini`에서 Google API `fetch`에 `signal: request.signal` 전달 |
| **중복 저장 방지** | `useRef`로 effect 재실행 시 자동 저장이 두 번 실행되지 않도록 처리 |

### 관련 파일

| 파일 | 역할 |
|------|------|
| `src/app/api/gemini/route.ts` | Gemini JSON 생성, `request.signal` → upstream abort |
| `src/app/api/supabase/route.ts` | posts INSERT, insert 전 client abort 확인 |
| `src/features/article-write/model/useArticleGeneration.ts` | 클라이언트 AI fetch + AbortController |
| `src/features/article-write/model/useGeneratingDraft.ts` | phase 관리, 자동 저장 + 저장 abort |
| `src/features/article-write/lib/saveGeneratedArticle.ts` | 저장 API 호출, `signal` 전달 |
| `src/features/article-write/ui/GeneratingDraft.tsx` | 생성·저장·리다이렉트 오케스트레이션 |

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/dashboard` | 대시보드 |
| `/write` | 블로그 작성 (템플릿·주제·키워드 입력) |
| `/write/generating` | AI 생성 + 자동 저장 |
| `/post`, `/post/[id]` | 글 목록·상세 |
| `/mypage` | 내 글 관리 |
| `/example` | 템플릿 예시 |

### API Routes

| 경로 | 설명 |
|------|------|
| `POST /api/gemini` | Gemini 글 생성 (JSON) |
| `POST /api/openai` | OpenAI 글 생성 (JSON) |
| `POST /api/supabase` | Supabase posts INSERT |

---

## 프로젝트 구조 (FSD)

[next.js `src` 디렉터리](https://nextjs.org/docs/app/building-your-application/configuring/src-directory) + Feature-Sliced Design을 사용합니다.

```
src/
├── app/                    # Next.js 라우팅·API Route·글로벌 스타일
├── pages/                  # (선택) 페이지 조합
├── widgets/                # Header, Landing, AppShell 등 UI 블록
├── features/               # article-write, auth, post-view, mypage …
│   └── article-write/
│       ├── model/          # useArticleGeneration, useGeneratingDraft
│       ├── lib/            # sessionStorage, saveGeneratedArticle
│       └── ui/             # DashBoard, GeneratingDraft, generating/*
├── entities/               # article, template, user (도메인·API)
└── shared/                 # ui, api(supabase), lib, config, types
```

- 경로 별칭: `@/*` → `./src/*`
- FSD 규칙: `.cursor/skills/feature-sliced-design/SKILL.md`

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

# AI Provider: gemini | openai (미설정 시 gemini)
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

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드 결과물 실행 |
| `pnpm lint` | ESLint 실행 |

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
- [Feature-Sliced Design](https://feature-sliced.design/)
