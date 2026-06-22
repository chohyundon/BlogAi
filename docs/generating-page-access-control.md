# `/write/generating` 접근 제어

AI 글 생성 페이지(`/write/generating`)는 **정상 플로우로만** 들어올 수 있게 막아 둔다.

- **서버:** 1회용 입장 쿠키 검증 → URL 직접 입력 차단
- **클라이언트:** sessionStorage 입력값 검증 → 데이터 없으면 생성 화면 미표시

> 생성 중 탭 닫기·새로고침·다른 페이지 이동은 아직 막지 않는다. (무단 접근 차단 + 상태 복구만 구현)

---

## 플로우

```
/write 대시보드
  → 입력값 sessionStorage 저장
  → 입장 쿠키 발급
  → /write/generating 이동
      → proxy.ts: 쿠키 없으면 /write 리다이렉트, 있으면 통과 후 쿠키 삭제
      → useGeneratingDraft: payload 없으면 /write 리다이렉트
```

---

## 관련 파일

| 파일                        | 역할                            |
| --------------------------- | ------------------------------- |
| `writeGeneratingEntry.ts`   | 쿠키 이름·경로 상수             |
| `writeGeneratingSession.ts` | payload 저장, 쿠키 발급/삭제    |
| `proxy.ts`                  | 서버에서 입장 쿠키 검증         |
| `BottomCta.tsx`             | 생성 시작 시 저장 + 쿠키 + 이동 |
| `useGeneratingDraft.ts`     | 클라이언트 2차 검증             |

---

## 1. 상수 — `writeGeneratingEntry.ts`

입장 쿠키와 보호 대상 경로를 정의한다.

```ts
export const WRITE_GENERATING_ENTRY_COOKIE = "write-generating-entry";
export const WRITE_GENERATING_ENTRY_VALUE = "1";
export const WRITE_GENERATING_ENTRY_MAX_AGE_SEC = 60;
export const WRITE_GENERATING_PATH = "/write/generating";
```

---

## 2. 입장권 발급 — `writeGeneratingSession.ts`

생성 버튼을 누르기 직전에 호출한다.

```ts
// 입력값 → sessionStorage
saveWriteGeneratingPayload({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
});

// 1회용 입장 쿠키 (60초, proxy가 검증 후 삭제)
grantGeneratingPageEntry();
```

세션 정리는 저장 성공·다시 생성 시 `clearWriteGeneratingPayload()`로 한 번에 비운다.

---

## 3. 서버 차단 — `proxy.ts`

`/write/generating` 요청마다 입장 쿠키를 확인한다.

```ts
function guardGeneratingPage(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname !== WRITE_GENERATING_PATH) return null;

  const hasEntry =
    req.cookies.get(WRITE_GENERATING_ENTRY_COOKIE)?.value ===
    WRITE_GENERATING_ENTRY_VALUE;

  if (!hasEntry) {
    return NextResponse.redirect(new URL("/write", req.url));
  }

  const res = NextResponse.next();
  clearGeneratingEntryCookie(res); // 통과 후 즉시 삭제 (1회용)
  return res;
}
```

| 동작      | 설명                                             |
| --------- | ------------------------------------------------ |
| 쿠키 없음 | `/write`로 리다이렉트                            |
| 쿠키 있음 | 통과 후 쿠키 삭제 → 같은 URL 재입력 시 다시 차단 |

---

## 4. 생성 시작 — `BottomCta.tsx`

정상 플로우만 생성 페이지로 보낸다.

```ts
const goToGenerating = () => {
  grantGeneratingPageEntry();
  router.push("/write/generating");
};

const handleGenerateArticle = () => {
  saveWriteGeneratingPayload({ ... });
  setGenerationStatus("generating");
  goToGenerating();
};
```

---

## 5. 클라이언트 2차 검증 — `useGeneratingDraft.ts`

서버를 통과해도 sessionStorage에 입력값이 없으면 생성 화면을 보여주지 않는다.

```ts
const [payload] = useState(() => peekWriteGeneratingPayload());

useEffect(() => {
  if (!payload) {
    toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
    router.replace("/write");
    return;
  }
}, [payload, router]);
```

---

## sessionStorage 키

| 키                             | 용도                            |
| ------------------------------ | ------------------------------- |
| `self:write-generating`        | 템플릿, 제목, 설명, 키워드      |
| `self:write-generation-status` | `generating` / `done` / `error` |
| `self:write-generation-result` | 생성 완료된 글 (캐시)           |

---

## 한 줄 요약

> **쿠키(서버 1회용) + sessionStorage payload(클라)** 이중 검증으로 `/write/generating` 무단 접근을 막는다.
