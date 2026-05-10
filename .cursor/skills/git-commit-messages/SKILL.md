---
name: git-commit-convention
description: >
  프로젝트 내 Git 커밋 메시지를 일관되게 작성하기 위한 규칙과 자동화 가이드.
  커밋 타입(feat, fix 등), 작성자, 시간 정보를 포함한 표준 형식을 정의한다.
  새 커밋 작성, 커밋 메시지 검토, git hook 설정 요청 시 반드시 이 스킬을 참고한다.
---

# Git Commit Convention

## 개요

이 규칙은 **현재 프로젝트 내에서만** 적용된다.  
`.git/hooks/` 를 통해 로컬 hook으로 강제하며, 팀원 각자가 설치해야 한다.

---

## 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
# Author: <이름> | <HH:MM>
```

### 예시

```
feat(auth): 소셜 로그인 기능 추가

Google OAuth2 연동 및 토큰 저장 로직 구현

Closes #42
# Author: 홍길동 | 14:32
```

---

## 커밋 타입 (Type)

| 타입       | 설명                         | 예시                                     |
| ---------- | ---------------------------- | ---------------------------------------- |
| `feat`     | 새로운 기능 추가             | `feat(user): 프로필 이미지 업로드`       |
| `fix`      | 버그 수정                    | `fix(login): 토큰 만료 시 무한루프 수정` |
| `docs`     | 문서 수정 (README 등)        | `docs: API 명세 업데이트`                |
| `style`    | 코드 포맷팅 (로직 변경 없음) | `style: 세미콜론 누락 수정`              |
| `refactor` | 리팩토링 (기능 변경 없음)    | `refactor(api): 중복 함수 통합`          |
| `test`     | 테스트 코드 추가/수정        | `test(auth): 로그인 단위 테스트 추가`    |
| `chore`    | 빌드, 패키지, 설정 변경      | `chore: eslint 설정 추가`                |
| `perf`     | 성능 개선                    | `perf(query): N+1 쿼리 최적화`           |
| `hotfix`   | 긴급 운영 버그 수정          | `hotfix(payment): 결제 금액 오류 수정`   |

---

## Scope (선택 사항)

괄호 안에 변경 범위를 명시한다. 프로젝트 모듈 또는 디렉토리 기준으로 작성한다.

```
feat(auth): ...
fix(user): ...
chore(ci): ...
```

범위가 전체에 해당하면 생략 가능하다: `docs: README 수정`

---

## Subject 규칙

- **한국어 또는 영어** 통일 (프로젝트 내 규칙으로 고정)
- 동사로 시작 (추가, 수정, 제거 / Add, Fix, Remove)
- 끝에 마침표(.) 금지
- 50자 이내 권장

---

## Author 태그 (필수)

커밋 메시지 마지막 줄에 아래 형식으로 추가한다:

```
# Author: <이름> | <HH:MM>
```

- 이름: 실명 또는 팀 내 닉네임 통일
- 시간: 커밋 시점의 로컬 시간 (24시간제)

> 이 줄은 `#`으로 시작해 git log에서 주석 처리되지 않도록  
> `git commit` 시 `-v` 옵션이나 직접 메시지 입력으로 포함해야 한다.  
> 아래 `commit-msg` hook에서 자동으로 삽입되도록 설정한다.

---

## 로컬 Git Hook 설정 (프로젝트 내 강제 적용)

### 1. `commit-msg` hook — 형식 검사 + Author 자동 삽입

파일 위치: `.git/hooks/commit-msg`

```bash
#!/bin/bash

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Author 자동 삽입 (이미 있으면 생략)
if ! grep -q "^# Author:" "$COMMIT_MSG_FILE"; then
  # GitHub 유저 아이디 추출 (우선순위 순)
  # 1. remote origin URL에서 추출 (가장 정확)
  #    HTTPS: https://github.com/username/repo.git
  #    SSH:   git@github.com:username/repo.git
  REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null)
  if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/ ]]; then
    GITHUB_ID="${BASH_REMATCH[1]}"
  else
    # 2. 이메일이 GitHub noreply 형식인 경우: username@users.noreply.github.com
    USER_EMAIL=$(git config user.email 2>/dev/null)
    if [[ "$USER_EMAIL" =~ ^([^+@]+)(\+[^@]+)?@users\.noreply\.github\.com$ ]]; then
      GITHUB_ID="${BASH_REMATCH[1]}"
    else
      # 3. 폴백: git user.name 사용
      GITHUB_ID=$(git config user.name)
    fi
  fi

  COMMIT_TIME=$(date +"%H:%M")
  echo "" >> "$COMMIT_MSG_FILE"
  echo "# Author: ${GITHUB_ID} | ${COMMIT_TIME}" >> "$COMMIT_MSG_FILE"
fi

# 커밋 타입 형식 검사
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|hotfix)(\(.+\))?: .{1,50}"
FIRST_LINE=$(head -n1 "$COMMIT_MSG_FILE")

if ! echo "$FIRST_LINE" | grep -qE "$PATTERN"; then
  echo ""
  echo "❌ 커밋 메시지 형식 오류!"
  echo ""
  echo "올바른 형식: <type>(<scope>): <subject>"
  echo "예시: feat(auth): 소셜 로그인 추가"
  echo ""
  echo "사용 가능한 타입: feat | fix | docs | style | refactor | test | chore | perf | hotfix"
  echo ""
  exit 1
fi

exit 0
```

### 2. Hook 실행 권한 부여

```bash
chmod +x .git/hooks/commit-msg
```

### 3. 팀원 공유를 위한 스크립트

`.git/hooks`는 git에 포함되지 않으므로, 프로젝트 루트에 설치 스크립트를 둔다.

**파일 위치: `scripts/install-hooks.sh`**

```bash
#!/bin/bash

HOOK_DIR=".git/hooks"
SCRIPTS_DIR="scripts/hooks"

echo "🔧 Git hooks 설치 중..."

cp "$SCRIPTS_DIR/commit-msg" "$HOOK_DIR/commit-msg"
chmod +x "$HOOK_DIR/commit-msg"

echo "✅ Git hooks 설치 완료!"
echo "   커밋 메시지 형식이 자동으로 검사됩니다."
```

**팀원은 클론 후 아래 명령 한 번만 실행:**

```bash
bash scripts/install-hooks.sh
```

---

## 커밋 예시 모음

```bash
# 기능 추가
feat(dashboard): 월별 매출 차트 추가

# 버그 수정
fix(api): 빈 응답 시 500 에러 처리

# 긴급 수정
hotfix(payment): 중복 결제 방지 로직 누락 수정

# 문서
docs: 커밋 컨벤션 가이드 추가

# 리팩토링
refactor(user): 서비스 레이어 의존성 분리
```

---

## 자주 하는 실수

| 잘못된 예      | 올바른 예                               |
| -------------- | --------------------------------------- |
| `update login` | `fix(login): 로그인 오류 메시지 수정`   |
| `기능 추가`    | `feat(user): 회원가입 이메일 인증 추가` |
| `Fix bug.`     | `fix(cart): 수량 0 이하 허용 버그 수정` |
| `WIP`          | `chore: 임시 작업 저장 (리뷰 불필요)`   |

---

## 참고

- [Conventional Commits 공식 문서](https://www.conventionalcommits.org/ko/)
- 이 규칙은 프로젝트 루트 `scripts/install-hooks.sh` 실행으로 자동 적용된다.
- `git config user.name` 이 올바르게 설정되어 있어야 Author 태그가 정확히 삽입된다.
