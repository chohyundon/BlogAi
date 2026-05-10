export const MOCK_TEMPLATES = [
  [
    {
      id: "TIL",
      title: "React 검색 필터링 동작 원리",
      content: `# 📌 TIL - React 검색 필터링 동작 원리

## 1. 오늘 배운 것: 핵심 개념 요약

React에서 검색 필터링은  
**input → state 변경 → 컴포넌트 재실행 → filter 재계산 → UI 갱신**  
구조로 동작한다.

filter 함수를 직접 호출하지 않아도  
state가 바뀌면 컴포넌트가 다시 실행되면서 자동으로 필터링이 적용된다.

---

## 2. 상세 내용: 코드 예시와 함께 설명

~~~tsx
const [searchQuery, setSearchQuery] = useState("");

<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>;

const filteredTemplates = templates.filter((template) => {
  if (!searchQuery.trim()) return true;

  return template.title
    .toLowerCase()
    .includes(searchQuery.trim().toLowerCase());
});
~~~

사용자가 input에 값을 입력하면 \`onChange\` 이벤트가 실행되고  
\`setSearchQuery()\`가 호출되면서 state가 변경된다.

state가 변경되면 컴포넌트 함수가 다시 실행되고,  
그 안에 있는 \`filter()\` 로직이 다시 계산된다.

그 결과 \`filteredTemplates\` 값이 달라지고  
\`map()\`을 통해 렌더링되는 UI가 자동으로 갱신된다.

---

## 3. 어려웠던 점: 겪은 문제와 해결 과정

처음에는 filter를 직접 호출하지 않았는데  
왜 검색 결과가 자동으로 바뀌는지 이해가 되지 않았다.

또한 \`includes()\`가 대소문자를 구분한다는 점을 몰라  
검색이 정상적으로 되지 않는 문제를 겪었다.

문제 해결 과정에서 React의 핵심은  
“함수형 컴포넌트는 state가 바뀌면 다시 실행된다”는 점이라는 걸 다시 정리했다.

---

## 4. 느낀 점: 개인적인 소감

이번 내용을 통해 React는 DOM을 직접 조작하는 방식이 아니라  
**상태 기반으로 UI를 재계산하는 구조**라는 점을 다시 체감했다.

단순한 검색 기능도 렌더링 흐름을 이해하지 못하면 헷갈릴 수 있다.  
앞으로는 state → render 흐름을 먼저 떠올리며 설계해야겠다.
`,
    },
    {
      id: "Trouble_Shooting",
      title: "검색 필터가 동작하지 않던 문제 해결",
      content: `# 🚧 Trouble Shooting - 검색 필터가 동작하지 않던 문제

## 1. 문제 상황

React에서 검색 기능을 구현했지만  
input에 값을 입력해도 리스트가 필터링되지 않는 문제가 발생했다.

검색어를 입력해도 모든 데이터가 그대로 보였고,  
특정 키워드를 입력해도 원하는 결과가 나오지 않았다.

---

## 2. 원인 분석

### ① 대소문자 구분 문제

~~~tsx
template.title.includes(searchQuery)
~~~

\`includes()\`는 대소문자를 구분하기 때문에  
"React"와 "react"는 서로 다른 문자열로 처리되었다.

---

### ② 공백 처리 문제

검색어가 공백이거나 빈 문자열일 때  
조건문이 명확하지 않아 필터가 예상과 다르게 동작했다.

---

## 3. 해결 과정

### 🔹 대소문자 통일

~~~tsx
template.title
  .toLowerCase()
  .includes(searchQuery.toLowerCase());
~~~

---

### 🔹 공백 제거 처리

~~~tsx
if (!searchQuery.trim()) return true;
~~~

---

## 4. 최종 코드

~~~tsx
const filteredTemplates = templates.filter((template) => {
  if (!searchQuery.trim()) return true;

  return template.title
    .toLowerCase()
    .includes(searchQuery.trim().toLowerCase());
});
~~~

---

## 5. 배운 점

- \`includes()\`는 기본적으로 대소문자를 구분한다.
- 검색 기능에서는 \`trim()\` 처리가 중요하다.
- React는 state 변경 시 컴포넌트를 다시 실행한다는 점을 항상 고려해야 한다.

---

## 6. 느낀 점

작은 기능이라도 문자열 처리와 렌더링 흐름을 정확히 이해하지 못하면  
예상치 못한 문제가 발생할 수 있다는 걸 느꼈다.

앞으로는 조건 흐름을 먼저 정리한 뒤 구현하는 습관을 가져야겠다.
`,
    },
    {
      id: "Deep_Dive",
      title: "React 렌더링과 상태 기반 재계산 구조 분석",
      content: `# 🔍 Deep Dive - React 렌더링과 상태 기반 재계산 구조

## 1. 문제 제기

왜 filter 함수를 직접 호출하지 않았는데도  
검색 결과가 자동으로 바뀌는가?

---

## 2. React의 렌더링 구조

React 함수형 컴포넌트는  
**state가 변경되면 함수 전체가 다시 실행된다.**

~~~tsx
const [searchQuery, setSearchQuery] = useState("");
~~~

\`setSearchQuery()\`가 실행되면  
컴포넌트 함수가 처음부터 다시 실행된다.

---

## 3. 재실행 과정

1. state 변경
2. 컴포넌트 재실행
3. filter() 재계산
4. map() 재실행
5. Virtual DOM 비교
6. 실제 DOM 업데이트

즉, filter는 "자동 실행"이 아니라  
렌더 과정에서 다시 계산되는 것이다.

---

## 4. 성능 관점

데이터가 많아질 경우  
매 렌더마다 filter()가 실행되므로  
useMemo를 활용해 최적화할 수 있다.

~~~tsx
const filteredTemplates = useMemo(() => {
  return templates.filter((template) => {
    if (!searchQuery.trim()) return true;
    return template.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
  });
}, [templates, searchQuery]);
~~~

---

## 5. 결론

React는 DOM을 직접 조작하는 구조가 아니라  
**상태(state)를 기반으로 UI를 재계산하는 구조**다.

검색 기능을 통해  
React의 렌더링 흐름을 다시 이해하게 되었다.
`,
    },
  ],
] as const;
