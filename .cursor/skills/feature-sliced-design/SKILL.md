---
name: fsd-architecture
description: >
  Next.js 프로젝트에 Feature-Sliced Design(FSD) 아키텍처를 적용하기 위한 구조 규칙과 가이드.
  파일 생성, 이동, 컴포넌트 분류, import 규칙 작업 시 반드시 이 스킬을 참고한다.
  "FSD", "레이어", "슬라이스", "구조 변경", "어디에 넣어야" 같은 키워드가 나오면 무조건 이 스킬을 먼저 읽는다.
---

# FSD Architecture — Next.js

## 핵심 원칙

FSD는 **레이어(Layer) → 슬라이스(Slice) → 세그먼트(Segment)** 3단계 계층 구조다.

- 레이어는 위에서 아래로만 참조 가능 (단방향 의존성)
- 같은 레이어 내 슬라이스끼리는 참조 금지
- 모든 외부 공개 API는 반드시 `index.ts`를 통해서만 노출

---

## 레이어 계층 (위 → 아래 순서로만 import 가능)

```
app/          ← Next.js App Router 전용 (라우팅, 레이아웃, 미들웨어)
pages/        ← 각 라우트의 진입 컴포넌트 (page.tsx 조합)  ← FSD의 pages
widgets/      ← 독립적인 UI 블록 (Header, Sidebar, Feed 등)
features/     ← 사용자 인터랙션 단위 (로그인, 장바구니 담기 등)
entities/     ← 비즈니스 도메인 모델 (User, Product, Order 등)
shared/       ← 공통 유틸, UI 컴포넌트, 설정 (도메인 무관)
```

> ✅ `features`는 `entities`, `shared`를 import할 수 있다  
> ❌ `entities`는 `features`를 import할 수 없다  
> ❌ 같은 레이어의 `features/auth`와 `features/cart`는 서로 import 금지

---

## Next.js + FSD 디렉토리 구조

```
project-root/
├── app/                          # Next.js App Router (라우팅 전용)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 루트 페이지 → pages 레이어 조합만
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   └── providers.tsx             # 전역 Provider 묶음
│
├── src/                          # FSD 레이어 루트
│   ├── pages/                    # 라우트별 UI 조합 (widgets 조합)
│   │   ├── login/
│   │   │   ├── ui/LoginPage.tsx
│   │   │   └── index.ts
│   │   └── dashboard/
│   │       ├── ui/DashboardPage.tsx
│   │       └── index.ts
│   │
│   ├── widgets/                  # 독립 UI 블록
│   │   ├── header/
│   │   │   ├── ui/Header.tsx
│   │   │   ├── ui/Header.module.css
│   │   │   └── index.ts
│   │   └── sidebar/
│   │       ├── ui/Sidebar.tsx
│   │       └── index.ts
│   │
│   ├── features/                 # 사용자 인터랙션 기능 단위
│   │   ├── auth/
│   │   │   ├── api/authApi.ts
│   │   │   ├── model/useAuth.ts
│   │   │   ├── ui/LoginForm.tsx
│   │   │   └── index.ts
│   │   └── cart/
│   │       ├── api/cartApi.ts
│   │       ├── model/useCart.ts
│   │       ├── ui/AddToCartButton.tsx
│   │       └── index.ts
│   │
│   ├── entities/                 # 비즈니스 도메인 모델
│   │   ├── user/
│   │   │   ├── api/userApi.ts
│   │   │   ├── model/user.types.ts
│   │   │   ├── model/useUser.ts
│   │   │   ├── ui/UserCard.tsx
│   │   │   └── index.ts
│   │   └── product/
│   │       ├── model/product.types.ts
│   │       ├── ui/ProductCard.tsx
│   │       └── index.ts
│   │
│   └── shared/                   # 도메인 무관 공통 코드
│       ├── api/
│       │   └── httpClient.ts     # axios/fetch 기본 설정
│       ├── config/
│       │   └── env.ts
│       ├── lib/
│       │   └── utils.ts
│       ├── ui/                   # 공통 UI (Button, Input, Modal 등)
│       │   ├── Button/
│       │   │   ├── Button.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       └── types/
│           └── common.types.ts
```

---

## Next.js App Router와 FSD 연결 규칙

Next.js `app/` 디렉토리는 **라우팅 전용**으로만 사용한다.  
실제 UI 로직은 `src/pages/` 레이어에 위치시키고, `app/` 에서는 이를 import해서 조합한다.

```tsx
// app/dashboard/page.tsx  ← 라우팅만 담당
import { DashboardPage } from "@/pages/dashboard";

export default function Page() {
  return <DashboardPage />;
}
```

```tsx
// src/pages/dashboard/ui/DashboardPage.tsx  ← 실제 UI 조합
import { Header } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { ProductList } from "@/widgets/product-list";

export const DashboardPage = () => (
  <div>
    <Header />
    <Sidebar />
    <ProductList />
  </div>
);
```

---

## 세그먼트 (Segment) 종류

슬라이스 내부 폴더 구조:

| 세그먼트   | 용도                                   |
| ---------- | -------------------------------------- |
| `ui/`      | React 컴포넌트, CSS Module             |
| `model/`   | 상태 관리, 커스텀 훅, 타입             |
| `api/`     | 서버 통신 함수                         |
| `lib/`     | 슬라이스 전용 유틸                     |
| `config/`  | 슬라이스 전용 상수/설정                |
| `index.ts` | Public API (외부 공개 진입점) **필수** |

---

## index.ts Public API 규칙

각 슬라이스의 `index.ts`는 외부에 공개할 것만 명시적으로 export한다.  
내부 구현은 직접 경로로 import하지 않는다.

```ts
// src/features/auth/index.ts
export { LoginForm } from "./ui/LoginForm";
export { useAuth } from "./model/useAuth";
export type { AuthUser } from "./model/auth.types";
// authApi는 외부 공개 불필요 → export 안 함
```

```ts
// ✅ 올바른 import
import { LoginForm } from "@/features/auth";

// ❌ 잘못된 import (내부 구현 직접 참조)
import { LoginForm } from "@/features/auth/ui/LoginForm";
```

---

## tsconfig.json Path Alias 설정

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./app/*"]
    }
  }
}
```

---

## 파일 분류 판단 기준

새 파일을 만들 때 아래 질문 순서로 레이어를 결정한다:

1. **도메인과 무관한 공통 코드인가?** → `shared/`
2. **특정 비즈니스 모델(User, Product 등)을 표현하는가?** → `entities/`
3. **사용자 행동(버튼 클릭, 폼 제출 등) 하나를 담당하는가?** → `features/`
4. **여러 features/entities를 조합한 독립 UI 블록인가?** → `widgets/`
5. **특정 라우트의 전체 화면을 조합하는가?** → `pages/`

---

## 자주 하는 실수

| 실수                                         | 올바른 방법                                |
| -------------------------------------------- | ------------------------------------------ |
| `features/auth`에서 `features/cart` import   | 공통 로직은 `shared/`나 `entities/`로 이동 |
| `app/dashboard/page.tsx`에 UI 로직 직접 작성 | `src/pages/dashboard/ui/`에 작성 후 import |
| `index.ts` 없이 내부 파일 직접 import        | 반드시 `index.ts`를 통해서만 export        |
| `shared/`에 도메인 로직 포함                 | `entities/` 또는 `features/`로 이동        |
| 컴포넌트와 타입을 `shared/`에 몰아넣기       | 도메인 관련이면 `entities/`에 위치         |

---

## 참고

- [FSD 공식 문서](https://feature-sliced.design/)
- [FSD + Next.js 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)
