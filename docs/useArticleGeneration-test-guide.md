# useArticleGeneration 테스트 가이드

## 📋 개요

`useArticleGeneration` Hook의 동작을 검증하는 vitest 테스트 스위트입니다.

- **모듈**: `useArticleGeneration.test.ts`
- **테스트 대상**: 기사 자동 생성 로직
- **주요 기능**: Fetch 요청, 상태 관리, 에러 처리

---

## 🎯 핵심 기능

### 1. **초기 상태**

- `article`: `null`
- `error`: 빈 문자열 (`""`)
- `isGenerating`: `false`

### 2. **Payload 검증**

- `null` 입력 시 에러 메시지 설정: `"작성 정보가 없습니다."`
- 올바른 Payload 입력 시 정상 작동

### 3. **AI Provider 설정**

- 환경변수 `NEXT_PUBLIC_AI_PROVIDER`로 제공자 결정
  - `gemini` → `/api/gemini` 호출
  - 미설정 → `/api/openai` 호출 (기본값)

---

## 🧪 테스트 케이스 상세

### ✅ 기본 상태 테스트

#### 1. **Null Payload 처리**

```
입력: payload = null
기대: error = "작성 정보가 없습니다.", isGenerating = false
```

#### 2. **초기 상태 검증**

```
입력: 정상 payload + template
기대: article = null, error = "", isGenerating = false
```

---

### ✅ 성공 시나리오

#### 3. **Fetch 성공 처리**

```
흐름:
1. Hook 호출 → isGenerating = true
2. Fetch 완료 (ok: true)
3. Response 파싱 및 상태 업데이트
4. article 설정 + error 초기화 + isGenerating = false

응답 구조:
{
  title: string
  content: string
  keywords: string[]
  metaDescription?: string
}
```

#### 4. **Keywords 정규화**

```
입력: keywords = null 또는 undefined
처리: 빈 배열로 변환 []
```

#### 5. **Content 정규화**

```
입력: content = undefined
처리: 빈 문자열로 변환 ""
```

---

### ❌ 에러 시나리오

#### 6. **HTTP 에러 응답**

```
상황: ok = false, status = 500
응답: { error: "Internal Server Error" }
결과: error = "Internal Server Error"
```

#### 7. **HTTP 404 (에러 필드 없음)**

```
상황: ok = false, status = 404
응답: {}
결과: error = "HTTP 404" (상태코드 사용)
```

#### 8. **네트워크 에러**

```
상황: fetch 거부 (Network error)
결과: error = "Network error"
```

#### 9. **에러 후 상태 확인**

```
입력: Network error 발생
검증:
  - error ≠ ""
  - article = null
  - isGenerating = false
```

---

### 🔄 요청 및 재렌더링

#### 10. **POST 요청 형식 검증**

```
요청 구조:
Method: POST
URL: /api/openai 또는 /api/gemini
Headers: Content-Type: application/json
Body: mockPayload (JSON)
```

#### 11. **Payload 변경 시 재요청**

```
흐름:
1. 초기 Props로 Hook 호출 → fetch 1회
2. Payload 변경 (selectedTemplate 변경)
3. Rerender → fetch 2회 발생
```

#### 12. **Template Key 전달**

```
입력: useArticleGeneration(payload, "custom-template")
결과: article.template = "custom-template"
```

---

### 🛑 정리 및 취소

#### 13. **Cleanup 시 요청 취소**

```
흐름:
1. Hook 마운트 → fetch 시작
2. unmount() 호출
3. AbortSignal 활성화 → fetch 취소
```

---

## 🔍 Mock 설정

### 전역 Mock

```typescript
global.fetch = vi.fn();
```

### Setup / Cleanup

```typescript
beforeEach: vi.clearAllMocks() + delete process.env.NEXT_PUBLIC_AI_PROVIDER;
afterEach: vi.clearAllMocks();
```

### Mock 응답 예시

```typescript
{
  ok: boolean
  status: number
  json: async () => ({ ... })
}
```

---

## 📊 테스트 매트릭스

| 카테고리 | 테스트          | 상태 |
| -------- | --------------- | ---- |
| 초기화   | Null Payload    | ✅   |
| 초기화   | 초기 상태       | ✅   |
| 성공     | Fetch 성공      | ✅   |
| 정규화   | Keywords 정규화 | ✅   |
| 정규화   | Content 정규화  | ✅   |
| 에러     | HTTP 에러       | ✅   |
| 에러     | HTTP 404        | ✅   |
| 에러     | 네트워크 에러   | ✅   |
| 에러     | 에러 후 상태    | ✅   |
| 요청     | POST 형식       | ✅   |
| 재렌더링 | Payload 변경    | ✅   |
| 템플릿   | Template Key    | ✅   |
| 정리     | Cleanup         | ✅   |

---

## 🎓 핵심 학습 포인트

### 1. **Effect Dependencies**

- Payload 변경 감지 → 새 요청 발생
- Template Key는 결과에만 영향

### 2. **에러 처리 전략**

- 서버 에러 메시지 우선 사용
- 없으면 HTTP 상태코드 표시

### 3. **상태 동기화**

- Fetch 중: `isGenerating = true`
- 완료/에러: `isGenerating = false` (필수)

### 4. **메모리 누수 방지**

- Unmount 시 AbortSignal로 요청 취소
- 불필요한 상태 업데이트 방지

### 5. **Input Validation**

- Null payload 명시적 거부
- 응답 필드 정규화 (null → 기본값)

---

## 🔗 관련 파일

- **구현체**: `src/features/article-write/model/useArticleGeneration.ts`
- **타입**: `@/entities/article/model/postArticleInput`
- **테스트**: `src/features/article-write/model/useArticleGeneration.test.ts`
