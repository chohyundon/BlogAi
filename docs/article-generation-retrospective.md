# AI 글 생성 — 예외 상황 고민 회고

## 서문

프로젝트를 구현하면서 기능을 완성하는 데 집중한 나머지, 다양한 관점에서 충분히 고민하지 못했다는 것을 깨달았다.  
구현이 끝나면 ‘이제 다 했다’는 안도감이 들었고, 그 때문에 사용성이나 예외 상황·개선 가능성을 놓치기도 했다.

이번 기회를 통해 **구현에서 끝나는 것이 아니라, 완성 이후에도 더 나은 방향을 고민하는 습관**을 만들어가고자 한다.

---

## 예외 상황 생각해보기

현재 상황을 다이어그램으로 정리해 봤다.

- 유저가 블로그 글 생성 중 나가면 → API로 데이터를 유지해 DB에 insert할지
- 아니면 **AbortController**로 네트워크 요청을 취소할지

두 갈래의 흐름을 기준으로 대응을 나눴다.

---

## 1. AbortController — 진행 중 요청 취소

유저가 글 생성·저장 중 이탈할 때 연결을 끊는 방법이다.

### 흐름

1. 글 생성 완료 → 자동으로 DB 저장 시도 (데이터 유지)
2. 저장 중 유저가 나가면 → `AbortController`로 취소 신호 (`AbortSignal`)
3. 이미 진행 중인 요청은 최대한 마무리하되, 불필요한 후속 처리는 막음

### 뒤로 가기 버튼

`GeneratingDraftHeader`의 Link는 단순히 `/write`로 이동한다.

```tsx
<Link href="/write" className="...">
  <ArrowLeft size={20} />
  <span>뒤로 가기</span>
</Link>
```

### 저장 요청 — signal로 제어

`AbortController`를 선언하고 ref로 추적한다. 컴포넌트 언마운트 시 cleanup에서 `abort()`를 호출한다.

```ts
const activeSaveAbortRef = useRef<AbortController | null>(null);

useEffect(() => {
  return () => {
    activeSaveAbortRef.current?.abort();
  };
}, []);

const controller = new AbortController();
activeSaveAbortRef.current = controller;

const { postId } = await saveGeneratedArticle(
  article,
  payload.selectedTemplate,
  { signal: controller.signal }
);
```

`abort()` — 진행 중인 fetch 요청을 취소하는 함수.

### AI API 요청 — fetch에도 signal 연결

```ts
useEffect(() => {
  if (!payload) {
    /* ... */ return;
  }

  const controller = new AbortController();

  const run = async () => {
    try {
      const res = await fetch(aiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      // ...
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) return;
      setError(/* 실제 에러만 */);
    }
  };

  run();
  return () => controller.abort();
}, [payload, templateKey]);
```

### 정리 — 뒤로 가기 클릭 시

```
사용자 "뒤로 가기" 클릭
  ↓
Next.js /write 네비게이션
  ↓
GeneratingDraft 언마운트
  ↓
useGeneratingDraft cleanup
  ├─ activeSaveAbortRef.abort() → DB 저장 fetch 취소
  └─ useArticleGeneration cleanup → AI API fetch 취소
  ↓
isAbortError로 AbortError 필터링 → 상태 꼬임 방지
  ↓
/write 렌더링
```

### 토큰 비용

AbortController 없을 때: 이탈 후에도 AI 응답이 이어져 **약 600토큰** 낭비 관찰.  
적용 후: **약 800토큰** 분량의 불필요한 소비를 줄일 수 있었다.

---

## 2. 이탈 후에도 상태 유지 — sessionStorage

유저가 시도할 만한 시나리오를 막아 보자.

1. 뒤로가기 했을 때 데이터·상태 유지
2. 경로를 강제로 쳤을 때 예외 처리

### 뒤로가기

예외 처리 없이 뒤로가면 **토큰 낭비**가 발생했다.  
sessionStorage에 상태를 넣어, 생성 중에는 버튼으로 재생성하지 못하게 막았다.

```ts
export function setGenerationStatus(status: GenerationStatus): void {
  sessionStorage.setItem(WRITE_GENERATION_STATUS_KEY, status);
  notifyGenerationStatusChange();
}
```

```ts
export type GenerationStatus = "generating" | "done" | "error";
```

| status       | 동작                                              |
| ------------ | ------------------------------------------------- |
| (없음)       | 기본 — "AI 글 생성하기"                           |
| `generating` | "생성 화면으로 이동" — 재생성 대신 생성 화면 복귀 |
| `done`       | "생성 결과 보기"                                  |
| `error`      | "생성 화면으로 이동"                              |

---

## 3. URL 직접 입력 — proxy + 쿠키

### 시도: sessionStorage를 proxy에서 쓰기

Next.js 16에서는 `middleware.ts` → **`proxy.ts`** 로 이름이 바뀌었다.  
처음엔 sessionStorage의 status를 활용하려 했다.

**문제:** proxy(미들웨어)는 **sessionStorage에 접근할 수 없다.**

- sessionStorage → 브라우저에만 존재
- 쿠키 → 요청마다 서버로 전송 → `req.cookies`로 읽기 가능

### 해결: 1회용 입장 쿠키

```ts
function guardGeneratingPage(req) {
  if (pathname !== "/write/generating") return;

  const hasEntry = req.cookies.get("write-generating-entry")?.value === "1";

  if (!hasEntry) {
    return redirect("/write");
  }

  const res = next();
  clearGeneratingEntryCookie(res); // 통과 후 즉시 삭제 (1회용)
  return res;
}
```

### 토큰(입장권) 플로우

```
/write에서 버튼 클릭 → grantGeneratingPageEntry() → 쿠키 발급
  ↓
/write/generating 요청 → proxy 쿠키 확인 → 통과 → 쿠키 삭제
  ↓
재진입(URL 직접 입력·새로고침) → 쿠키 없음 → /write 리다이렉트
```

의도: 정상 플로우로만 생성 페이지 입장. URL 북마크·직접 입력 차단.

### 입장 쿠키의 한계 (요약)

| 문제             | 설명                                           |
| ---------------- | ---------------------------------------------- |
| 새로고침 시 튕김 | 첫 입장 후 쿠키 삭제 → F5 시 `/write`로 이동   |
| 보안은 약함      | `=1` 고정값, DevTools 우회 가능 (UX 가드 수준) |
| 이중 관리        | 쿠키(서버) + sessionStorage(클라)              |
| 탭 닫기          | sessionStorage 소멸                            |
| 재진입           | `/write`에서 버튼으로 새 쿠키 발급 필요        |

---

## 아직 해결해야 할 숙제

- [ ] **새로고침** — 쿠키 1회 삭제로 인한 튕김 (status 쿠키 유지 등 검토)
- [ ] **DB 기반 상태** — sessionStorage 한계 보완, 탭 닫기·복구, 보안·영속성

---

## 결론

이번 작업을 통해 **“기능이 돌아간다”와 “서비스로 완성됐다”는 다른 문제**라는 걸 분명히 느꼈다. 구현이 끝난 뒤에야 비로소 예외 상황, 사용성, 비용까지 보이기 시작했고, 그 과정이 이번 회고의 핵심이다.

### 무엇을 해결했는가

유저 이탈과 비정상 진입을 **세 겹**으로 나눠 대응했다.

**1. 진행 중 요청 정리 — AbortController**  
뒤로 가기·페이지 이탈 시 컴포넌트 언마운트 cleanup에서 AI fetch와 DB 저장 요청을 `abort()`로 끊었다. 불필요한 토큰 소비와 저장 중 상태 꼬임을 줄이는 데 초점을 맞췄다.

**2. 같은 탭 복귀 — sessionStorage + status**  
`generating` / `done` / `error`를 sessionStorage에 두고, `/write` 복귀 시 버튼 문구·동작을 바꿨다. 생성 중이면 재생성 대신 “생성 화면으로 이동”으로 흐름을 이어 준다.

**3. URL 직접 입력 — proxy + 1회용 쿠키**  
proxy는 sessionStorage를 읽을 수 없어, 쿠키로 서버 단 입장을 제어했다. 생성 버튼 클릭 시만 쿠키를 발급하고, proxy가 확인 후 삭제하는 **1회용 입장권**으로 `/write/generating` 무단 접근을 막았다.

### 무엇을 배웠는가

- **저장소마다 역할이 다르다.** sessionStorage는 클라이언트 복구, 쿠키는 서버 가드. 하나로 통일할 수 없어 이중 관리가 생긴다.
- **모든 방어는 트레이드오프다.** 1회용 쿠키는 URL 직접 입력은 막지만, 새로고침 UX 문제를 남긴다.
- **가드 ≠ 보안.** `write-generating-entry=1`은 정상 플로우 확인용이고, 진짜 영속성·보안은 DB 쪽 과제다.

### 앞으로

| 과제                | 방향                            |
| ------------------- | ------------------------------- |
| 새로고침 시 튕김    | status 쿠키 유지 또는 서버 세션 |
| 탭 닫기             | DB job 저장                     |
| sessionStorage 의존 | 생성 상태를 DB에 두고 복구      |

이번에는 **구현 이후의 고민**이 더 값 있었다. AbortController로 비용을 줄이고, sessionStorage로 같은 탭 복귀를 살리고, 쿠키·proxy로 서버 단 입장을 막는 식으로 **레이어마다 맡을 일을 나눴다.** 완벽한 해법은 아니지만, “왜 이렇게 나눴는지”와 “어디가 아직 약한지”를 아는 것이 다음 개선의 발판이 될 것이다.

앞으로는 기능을 붙인 뒤에도 **이탈 · 새로고침 · 직접 URL 입력 · 비용** 네 가지를 체크리스트로 두고, **구현 완료를 시작점**으로 삼고 싶다.
