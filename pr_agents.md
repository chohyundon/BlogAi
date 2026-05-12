## PR instructions

## 1. 변경 내용

- Cursor 에이전트가 PR 초안을 작성할 때 따를 제목·본문 구조와 하단 체크리스트(`pnpm lint`, `pnpm test`)를 명시함.

## 2. 변경 이유

- PR 설명 형식을 레포 안에서 통일하고, Git 커밋 컨벤션과 맞는 제목 형태를 쓰기 위함.
- `@pr_agents.md`로 에이전트나 작성자가 동일한 템플릿으로 초안을 생성할 수 있게 함.

## 3. 주요 구현 내용

- 애플리케이션 코드 변경 없음. 문서 1개만 추가.

## 4. 확인 사항

- PR 제목의 `[<project_name>]`는 실제 프로젝트명으로 치환해 사용하면 됨.
- 에이전트 사용 시 채팅에 `@pr_agents.md`를 붙이면 형식 준수가 더 안정적임

- PR description:
  pull_request_template.md 형식에 맞춰 작성

포함할 내용:

1. 변경 내용
2. 변경 이유
3. 주요 구현
4. 영향 범위
5. 테스트 여부

---

- [ ] pnpm lint
- [ ] pnpm test
