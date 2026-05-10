# self

Next.js(App Router) + TypeScript + Tailwind CSS 프로젝트입니다.

## 프로젝트 구조 (Feature-Sliced Design)

[next.js 문서의 `src` 디렉터리](https://nextjs.org/docs/app/building-your-application/configuring/src-directory)를 사용합니다.

```
self/
├── src/
│   ├── app/                 # 라우팅·API 라우트·글로벌 스타일 (Next App Router 전용)
│   ├── shared/
│   │   ├── ui/              # 버튼·모달 등 공통 UI
│   │   ├── api/             # 예: Supabase 클라이언트
│   │   ├── lib/             # 프롬프트 등 순수 헬퍼
│   │   ├── config/          # 사이드바·헤더·로그인 상수 등
│   │   └── types/           # DB 등 공통 타입
│   ├── entities/
│   │   ├── article/api       # 게시 작성 API 클라이언트 등
│   │   ├── template/         # config·model·API·목 데이터
│   │   └── user/api
│   ├── features/            # 시나리오 단위(auth·글 작성·대시보드·마이페이지 등)
│   └── widgets/             # 헤더·앱 쉘·랜딩·템플릿 쇼케이스 등 UI 블록
├── public/
├── proxy.ts
├── next.config.js
├── postcss.config.mjs
└── tsconfig.json
```

경로 별칭은 `tsconfig`의 `@/*` → `./src/*` 입니다.

## FSD 규약

폴더 배치와 import 방향 검토 시 `.cursor/skills/feature-sliced-design/SKILL.md` 를 참고하면 됩니다.

## 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 스크립트

| 명령어          | 설명             |
| --------------- | ---------------- |
| `npm run dev`   | 개발 서버 실행   |
| `npm run build` | 프로덕션 빌드    |
| `npm run start` | 빌드 결과물 실행 |
| `npm run lint`  | ESLint 실행      |

## 참고

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
