# self — AI 기술 블로그 작성 플랫폼

개발자가 주제·키워드·템플릿만 입력하면 AI가 **마크다운 기술 블로그 글**을 생성하고, **실시간 미리보기**와 함께 Supabase에 저장·조회할 수 있는 웹 서비스입니다.

Next.js App Router, Feature-Sliced Design(FSD), Gemini/OpenAI API, SSE 스트리밍을 활용한 **풀스택 사이드 프로젝트**입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 글 생성** | Gemini 또는 OpenAI로 제목·본문·키워드·메타 설명을 JSON 형태로 생성 |
| **실시간 스트리밍 미리보기** | 글 생성 중 본문이 마크다운으로 타이핑되듯 표시 (SSE) |
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

## AI 글 생성 & SSE 스트리밍 (핵심 구현)

글 생성 페이지(`/write/generating`)에서는 **API를 한 번만** 호출합니다.

```
/write → sessionStorage에 작성 정보 저장
  → /write/generating
  → useArticleGenerationStream (클라이언트)
  → POST /api/gemini  (Accept: text/event-stream)
  → Gemini generateContentStream
  → chunk / result / done SSE 이벤트
  → ReactMarkdown 실시간 미리보기
  → result 수신 후 Supabase 저장 → /post/[id] 이동
```

### 왜 EventSource가 아닌 fetch + SSE 파싱?

- `EventSource`는 **GET만** 지원 → 주제·키워드·템플릿을 POST body로 넘기기 어려움
- `fetch` + `ReadableStream`으로 **POST JSON + SSE** 조합 구현
- `AbortController`로 페이지 이탈 시 요청 취소

### SSE 이벤트 계약

| event | 설명 |
|-------|------|
| `chunk` | Gemini JSON 출력 조각 → `content` 필드 추출 후 미리보기 갱신 |
| `result` | 파싱 완료된 `{ title, content, keywords, metaDescription }` |
| `error` | 생성 실패 메시지 |
| `done` | 스트림 종료 (`[DONE]`) |

### 관련 파일

| 파일 | 역할 |
|------|------|
| `src/app/api/gemini/route.ts` | SSE 스트림 생성·JSON 응답 분기 |
| `src/features/article-write/model/useArticleGenerationStream.ts` | 클라이언트 SSE 수신·파싱 |
| `src/features/article-write/ui/GeneratingDraft.tsx` | 생성·저장·리다이렉트 오케스트레이션 |
| `src/features/article-write/ui/sse/Generation.tsx` | 실시간 미리보기 UI |
| `src/shared/lib/sseEncode.ts` | 서버 SSE 이벤트 인코딩 |
| `src/features/article-write/lib/extractMarkdownPreviewFromJsonStream.ts` | JSON 스트림 → content 미리보기 |

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/dashboard` | 대시보드 |
| `/write` | 블로그 작성 (템플릿·주제·키워드 입력) |
| `/write/generating` | AI 생성 + 실시간 미리보기 + 자동 저장 |
| `/post`, `/post/[id]` | 글 목록·상세 |
| `/mypage` | 내 글 관리 |
| `/example` | 템플릿 예시 |

### API Routes

| 경로 | 설명 |
|------|------|
| `POST /api/gemini` | Gemini 글 생성 (JSON 또는 SSE) |
| `POST /api/openai` | OpenAI 글 생성 (JSON) |
| `/api/supabase` | Supabase 연동 |

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
│       ├── model/          # useArticleGenerationStream 등
│       ├── lib/            # session, SSE 헬퍼
│       └── ui/             # DashBoard, GeneratingDraft, Generation …
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
