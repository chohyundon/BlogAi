# 성능 개선 포인트

## 개요

구현 완료 후 실제 코드를 분석하면서 발견한 성능 개선 포인트를 정리했다.
기능 동작에는 문제가 없지만, 사용자 체감 속도와 불필요한 연산을 줄일 수 있는 부분들이다.

---

## 1. 에디터 타이핑 시 마크다운 재파싱 문제

**파일**: `src/features/post-view/ui/PostScreen.tsx:143-160`  
**우선순위**: 높음

### 문제

`content` state가 textarea의 `onChange`로 매 키입력마다 갱신되고, 이 값이 `ReactMarkdown`에 바로 전달된다.
`ReactMarkdown` + `remarkGfm`은 입력될 때마다 1500자 이상의 마크다운 전체를 재파싱한다.
글이 길수록 타이핑 반응성이 눈에 띄게 떨어진다.

### 현재 코드

```tsx
// PostScreen.tsx
<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
```

### 개선 방향

React 18의 `useDeferredValue`를 사용하면 타이핑(긴급 업데이트)은 즉시 반영되고,
마크다운 파싱(느린 업데이트)은 브라우저가 여유 있을 때 처리한다.
별도 라이브러리 없이 바로 적용 가능하다.

```tsx
import { useDeferredValue } from "react";

const deferredContent = useDeferredValue(content);

<ReactMarkdown remarkPlugins={[remarkGfm]}>{deferredContent}</ReactMarkdown>;
```

---

## 2. 마이페이지 필터·정렬이 매 렌더마다 재실행

**파일**: `src/features/mypage/ui/mypage.tsx:89-103`  
**우선순위**: 중간

### 문제

`filteredTemplates`, `sortedTemplates`, `currentPageItems` 세 연산이 `useMemo` 없이 컴포넌트 최상단에서 계산된다.
검색어를 한 글자 입력할 때마다 관련 없는 state 변경(예: 모달 open/close)에도 세 연산이 전부 재실행된다.

### 현재 코드

```ts
// mypage.tsx
const filteredTemplates = filterPostsByTypeAndSearch(
  templatesData ?? [],
  selectedTemplateType,
  searchQuery
);
const totalPages = Math.max(
  1,
  Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE)
);
const rangeStart = currentPage * TEMPLATES_PER_PAGE;
const sortedTemplates = sortPostsByCreatedDesc(filteredTemplates);
const currentPageItems = sortedTemplates.slice(
  rangeStart,
  rangeStart + TEMPLATES_PER_PAGE
);
```

### 개선 방향

각 계산의 의존성을 명확히 하고 `useMemo`로 캐싱한다.

```ts
const filteredTemplates = useMemo(
  () =>
    filterPostsByTypeAndSearch(
      templatesData ?? [],
      selectedTemplateType,
      searchQuery
    ),
  [templatesData, selectedTemplateType, searchQuery]
);

const totalPages = useMemo(
  () => Math.max(1, Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE)),
  [filteredTemplates.length]
);

const sortedTemplates = useMemo(
  () => sortPostsByCreatedDesc(filteredTemplates),
  [filteredTemplates]
);

const rangeStart = currentPage * TEMPLATES_PER_PAGE;

const currentPageItems = useMemo(
  () => sortedTemplates.slice(rangeStart, rangeStart + TEMPLATES_PER_PAGE),
  [sortedTemplates, rangeStart]
);
```

---

## 3. 마이페이지 목록에서 `content` 전체를 가져오는 문제

**파일**: `src/entities/user/api/getUserData.ts:8`  
**우선순위**: 높음

### 문제

마이페이지 목록을 불러올 때 `select('*')`로 모든 컬럼을 조회한다.
AI가 생성한 `content`는 1500자 이상이고, 포스트가 많아질수록 네트워크 페이로드가 그만큼 증가한다.
목록 화면에서 `content`는 실제로 사용되지 않는다.

### 현재 코드

```ts
// getUserData.ts
const { data, error } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", userId);
```

### 개선 방향

목록에 필요한 컬럼만 명시적으로 조회한다.
상세 페이지(`postWrite.ts`)는 `content`가 필요하므로 그대로 둔다.

```ts
// getUserData.ts — 목록용
const { data, error } = await supabase
  .from("posts")
  .select("id, title, created_at, template_type")
  .eq("user_id", userId);
```

> **주의**: `DatabaseDocument` 타입이 `content`를 필수 필드로 갖고 있다면,
> 목록용 타입을 별도로 분리(`Pick<DatabaseDocument, 'id' | 'title' | 'created_at' | 'template_type'>`)해야 한다.

---

## 4. 아무것도 하지 않는 `handleMouseUp`

**파일**: `src/features/post-view/ui/PostScreen.tsx:62-67`  
**우선순위**: 낮음

### 문제

`handleMouseUp`이 `window.getSelection()`을 호출하지만 반환값을 사용하지 않는다.
textarea에서 마우스를 뗄 때마다 불필요하게 실행된다.

### 현재 코드

```ts
const handleMouseUp = () => {
  const selection = window.getSelection();
  if (selection) {
    selection.toString(); // 반환값 미사용
  }
};
```

### 개선 방향

함수와 `onMouseUp={handleMouseUp}` 두 곳을 모두 제거한다.

---

## 개선 우선순위 정리

| 순위 | 파일             | 문제                              | 체감 효과              |
| ---- | ---------------- | --------------------------------- | ---------------------- |
| 1    | `PostScreen.tsx` | 타이핑마다 마크다운 재파싱        | 에디터 반응성          |
| 2    | `getUserData.ts` | `select('*')`로 content 전부 조회 | 네트워크 페이로드 감소 |
| 3    | `mypage.tsx`     | 필터·정렬 useMemo 미적용          | 검색 입력 반응성       |
| 4    | `PostScreen.tsx` | handleMouseUp 빈 함수             | 코드 정리              |
