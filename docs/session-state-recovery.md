# 사용자가 페이지를 나가도 AI 글 생성 상태를 유지하는 방법

## Next.js Cookie + sessionStorage로 구현한 세션 복구 아키텍처

### 문제 상황

AI 글쓰기 앱에서 이런 상황이 발생했다:

- 사용자가 글 생성 중에 **탭을 닫거나 다른 페이지로 이동**
- 다시 돌아왔을 때 **생성 중인 상태와 입력값이 모두 사라짐**
- 사용자 입장에서 답답함 (재입력해야 함)

### 솔루션 설계

이 문제를 **3계층**으로 해결했다:

```
┌─────────────────────────────────────────┐
│ 1. Proxy (Server)                       │
│ Cookie로 진입 권한 제어                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. sessionStorage (Client)              │
│ • 입력값 (선택한 템플릿, 키워드 등)     │
│ • 생성 상태 (generating, done, error)  │
│ • 생성된 글 결과                        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. 컴포넌트 훅 (Client)                 │
│ 페이지 진입 시 sessionStorage에서 복구  │
└─────────────────────────────────────────┘
```

---

## 1단계: Proxy로 진입 제어 (서버)

### 왜 Cookie + Proxy가 필요한가?

단순히 sessionStorage만으로는 문제가 있다:

- 사용자가 임의로 `/write/generating` 진입 가능
- 브라우저 개발자 도구에서 sessionStorage를 조작 가능
- **입력값 없이 생성 페이지에 들어오는 경우 방어 필요**

이를 해결하기 위해 **서버 단계에서 권한 검증**:

```typescript
// proxy.ts
function guardGeneratingPage(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname !== WRITE_GENERATING_PATH) return null;

  const hasEntry =
    req.cookies.get(WRITE_GENERATING_ENTRY_COOKIE)?.value ===
    WRITE_GENERATING_ENTRY_VALUE;

  if (!hasEntry) {
    // 쿠키가 없으면 /write로 리다이렉트
    return NextResponse.redirect(new URL("/write", req.url));
  }

  const res = NextResponse.next();
  // 통과한 후 즉시 쿠키 삭제 (1회용)
  clearGeneratingEntryCookie(res);
  return res;
}

export async function proxy(req: NextRequest) {
  const generatingGuard = guardGeneratingPage(req);
  if (generatingGuard) return generatingGuard;

  return NextResponse.next();
}
```

**핵심: 1회용 쿠키**

- `/write` → `/write/generating`로 진입할 때만 쿠키 설정
- 서버에서 확인 후 **즉시 삭제**
- 재방문 시 쿠키가 없어서 자동 리다이렉트

---

## 2단계: sessionStorage에 상태 저장 (클라이언트)

### 저장할 데이터 구조

```typescript
// writeGeneratingSession.ts
export type WriteGeneratingPayload = {
  selectedTemplate: string; // 선택한 글쓰기 템플릿
  blogTitleValue: string; // 블로그 제목
  blogDescriptionValue: string; // 블로그 설명
  keywords: string[]; // 입력한 키워드들
};

export type GenerationStatus = "generating" | "done" | "error";
```

### sessionStorage 키 설계

```typescript
// 3가지 키로 상태 분리
export const WRITE_GENERATING_SESSION_KEY = "self:write-generating";
export const WRITE_GENERATION_STATUS_KEY = "self:write-generation-status";
export const WRITE_GENERATION_RESULT_KEY = "self:write-generation-result";
```

**왜 분리했나?**

1. **Payload** (`self:write-generating`): 사용자 입력값 저장
2. **Status** (`self:write-generation-status`): 현재 생성 단계 추적
3. **Result** (`self:write-generation-result`): 생성된 글의 최종 결과

### 저장 함수들

```typescript
// 1. 생성 페이지로 넘어가기 전에 호출
export function saveWriteGeneratingPayload(
  payload: WriteGeneratingPayload
): void {
  sessionStorage.setItem(WRITE_GENERATING_SESSION_KEY, JSON.stringify(payload));
}

// 2. 서버 권한 획득 (쿠키 설정)
export function grantGeneratingPageEntry(): void {
  document.cookie = [
    `${WRITE_GENERATING_ENTRY_COOKIE}=${WRITE_GENERATING_ENTRY_VALUE}`,
    "path=/",
    `max-age=60`, // 60초 유효
    "SameSite=Lax",
  ].join("; ");
}

// 3. 생성 상태 저장 + 리스너 호출
export function setGenerationStatus(status: GenerationStatus): void {
  sessionStorage.setItem(WRITE_GENERATION_STATUS_KEY, status);
  window.dispatchEvent(new Event("write-generation-status-change"));
}

// 4. 생성된 글 결과 저장
export function saveGenerationResult(article: GeneratedArticle): void {
  sessionStorage.setItem(WRITE_GENERATION_RESULT_KEY, JSON.stringify(article));
}
```

---

## 3단계: 복구 로직 (클라이언트 훅)

### useGeneratingDraft: 초기 상태 복구

```typescript
export function useGeneratingDraft() {
  const router = useRouter();

  // 1. 페이지 진입 시 sessionStorage에서 읽기
  const [payload] = useState<WriteGeneratingPayload | null>(() =>
    peekWriteGeneratingPayload()
  );

  // 2. 생성이 완료됐다면 결과도 복구
  const cachedResult =
    payload && getGenerationStatus() === "done" ? peekGenerationResult() : null;

  // 3. 초기 phase 결정
  const [phase, setPhase] = useState<GeneratingDraftPhase>(() =>
    cachedResult ? "done" : "loading"
  );

  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(() => cachedResult);

  // 4. Payload 없으면 /write로 돌려보냄
  useEffect(() => {
    if (!payload) {
      toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
      router.replace("/write");
      return;
    }
  }, [payload, router]);

  return { payload, phase, generatedArticle, errorMessage, ... };
}
```

**복구 흐름:**

1. 사용자가 `/write/generating` 진입
2. Proxy가 쿠키 확인 후 통과
3. `useGeneratingDraft`에서 `peekWriteGeneratingPayload()` 호출
4. sessionStorage에서 데이터 복구하고 화면에 표시

### useGenerationStatus: 창 다시 포커스 시 상태 동기화

```typescript
export function useGenerationStatus(): GenerationStatus | null {
  const [status, setStatus] = useState<GenerationStatus | null>(() =>
    resolveGenerationStatus()
  );

  useEffect(() => {
    // 상태 변경 감지
    const sync = () => setStatus(resolveGenerationStatus());

    // 3가지 이벤트로 동기화
    window.addEventListener("write-generation-status-change", sync);
    window.addEventListener("focus", sync); // 창 포커스
    window.addEventListener("pageshow", sync); // 뒤로가기 복구

    return () => {
      window.removeEventListener("write-generation-status-change", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  return status;
}
```

**왜 3가지 이벤트?**

- `write-generation-status-change`: 생성 상태가 바뀔 때
- `focus`: 사용자가 탭으로 돌아왔을 때
- `pageshow`: 브라우저 뒤로가기로 복구됐을 때

---

## 4단계: UI에서 표시

```typescript
// GeneratingDraft.tsx
export default function GeneratingDraft() {
  const { payload, phase, generatedArticle, handleSave, ... } = useGeneratingDraft();

  // sessionStorage에서 복구했으면 payload가 있음
  if (!payload) {
    return null;  // 진입 권한 없음 (자동 리다이렉트됨)
  }

  return (
    <div>
      {/* phase가 "done"이면 cachedResult에서 복구된 글 표시 */}
      <GeneratingDraftPhaseContent
        payload={payload}
        phase={phase}
        generatedArticle={generatedArticle}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
```

---

## 실제 시나리오로 따라가기

### 시나리오: 사용자가 생성 중에 탭을 닫았다가 돌아옴

```
[단계 1] /write에서 생성 시작
├─ saveWriteGeneratingPayload(payload)
│  └─ sessionStorage에 입력값 저장
├─ grantGeneratingPageEntry()
│  └─ document.cookie에 쿠키 설정
└─ router.push("/write/generating")

[단계 2] /write/generating 진입
├─ proxy.ts 확인
│  ├─ 쿠키가 있음 ✓
│  └─ 쿠키 삭제
└─ useGeneratingDraft() 실행
   ├─ peekWriteGeneratingPayload() → sessionStorage에서 입력값 복구
   └─ 화면에 "생성 중..."

[단계 3] 사용자가 탭 닫음 (브라우저는 메모리 해제하지만)
└─ sessionStorage는 유지됨 (브라우저 탭이 완전히 종료될 때까지)

[단계 4] 사용자가 같은 탭을 다시 열거나 히스토리로 돌아옴
├─ proxy.ts 확인
│  ├─ 쿠키가 없음 (이미 삭제됨) ✗
│  └─ /write로 리다이렉트

[해결책] 별도의 메커니즘으로 재진입
└─ useGenerationStatus()에서 sessionStorage 상태 감지
   └─ "생성 중"이면 자동으로 /write/generating 제안
```

---

## 핵심 설계 원칙

### 1. Cookie는 "진입 권한" (일회용)

```
✓ 서버 검증 가능
✓ 클라이언트 조작 어려움
✗ 탭을 닫으면 사라짐 (의도적)
```

### 2. sessionStorage는 "상태 복구" (동일 탭)

```
✓ 탭이 살아있는 동안 유지
✓ JS에서 직접 접근 가능
✗ 탭을 닫으면 사라짐
✗ 크로스 탭 공유 불가
```

### 3. 3가지 분리된 키

```
payload    → 사용자 입력 (진입 권한 확인용)
status     → 생성 단계 추적 (UI 표시용)
result     → 생성된 글 (저장 전 임시 캐시)
```

---

## 장단점 분석

### 장점

| 특징            | 설명                                       |
| --------------- | ------------------------------------------ |
| **간단한 구현** | Cookie + sessionStorage만으로 충분         |
| **보안**        | 서버에서 권한 검증, 클라이언트 조작 어려움 |
| **성능**        | DB 쿼리 불필요, 브라우저 API만 사용        |
| **UX**          | 탭이 살아있으면 상태 유지                  |

### 단점 & 해결책

| 문제                      | 해결책                              |
| ------------------------- | ----------------------------------- |
| 탭을 닫으면 데이터 사라짐 | IndexedDB 추가로 영구 저장 가능     |
| 크로스 탭 공유 불가       | localStorage + BroadcastChannel API |
| 브라우저 저장소 용량 제한 | 5MB 이상 필요하면 IndexedDB         |

---

## 추가: 더 강력한 복구를 원한다면?

### IndexedDB로 영구 저장

```typescript
// 브라우저 탭이 닫혀도 유지
async function saveToIndexedDB(payload: WriteGeneratingPayload) {
  const db = await openDB("BlogAi");
  const tx = db.transaction("sessions", "readwrite");
  await tx.objectStore("sessions").put({
    key: "write-generating",
    data: payload,
    timestamp: Date.now(),
  });
}

// 앱 시작 시 복구 시도
async function restoreFromIndexedDB() {
  const db = await openDB("BlogAi");
  const data = await db.get("sessions", "write-generating");
  if (data && Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
    return data.data; // 7일 이내만 복구
  }
}
```

### BroadcastChannel로 탭 간 동기화

```typescript
// 같은 오리진의 모든 탭에서 상태 공유
const channel = new BroadcastChannel("write-generation");

// 한 탭에서 상태 변경
channel.postMessage({ type: "status-change", status: "done" });

// 다른 탭에서 수신
channel.onmessage = (event) => {
  if (event.data.type === "status-change") {
    setGenerationStatus(event.data.status);
  }
};
```

---

## 결론

이 아키텍처의 핵심:

1. **Cookie**: 서버 레벨 진입 제어 (보안)
2. **sessionStorage**: 클라이언트 레벨 상태 복구 (성능)
3. **Event 리스너**: 창 포커스/백그라운드 전환 시 동기화 (UX)

이를 통해 사용자가 실수로 탭을 닫거나 다른 페이지로 이동했을 때도 **생성 상태를 보존**하고 **빠르게 복구**할 수 있다.
