#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_DIR="$ROOT/.git/hooks"
SCRIPTS_DIR="$ROOT/scripts/hooks"

if [ ! -d "$ROOT/.git" ]; then
  echo "오류: 프로젝트 루트에서 실행하세요 (.git 없음)"
  exit 1
fi

mkdir -p "$HOOK_DIR"

if [ -f "$SCRIPTS_DIR/post-commit" ]; then
  cp "$SCRIPTS_DIR/post-commit" "$HOOK_DIR/post-commit"
  chmod +x "$HOOK_DIR/post-commit"
  echo "✅ post-commit 훅 설치됨 (커밋 후 자동 git push)"
fi

if [ -f "$SCRIPTS_DIR/pre-push" ]; then
  cp "$SCRIPTS_DIR/pre-push" "$HOOK_DIR/pre-push"
  chmod +x "$HOOK_DIR/pre-push"
  echo "✅ pre-push 훅 설치됨 (push 전 pnpm run build, 실패 시 push 차단)"
fi

if [ -f "$SCRIPTS_DIR/commit-msg" ]; then
  cp "$SCRIPTS_DIR/commit-msg" "$HOOK_DIR/commit-msg"
  chmod +x "$HOOK_DIR/commit-msg"
  echo "✅ commit-msg 훅 설치됨"
fi

if [ -f "$SCRIPTS_DIR/prepare-commit-msg" ]; then
  cp "$SCRIPTS_DIR/prepare-commit-msg" "$HOOK_DIR/prepare-commit-msg"
  chmod +x "$HOOK_DIR/prepare-commit-msg"
  echo "✅ prepare-commit-msg 훅 설치됨 (스테이징 diff → OpenAI 한 줄 제목)"
fi

TEMPLATE="$ROOT/scripts/git-commit-template.txt"
if [ -f "$TEMPLATE" ]; then
  git -C "$ROOT" config commit.template "$TEMPLATE"
  echo "✅ git commit.template → $TEMPLATE"
  echo "   (git commit 시 에디터에 컨벤션 안내가 열립니다)"
fi

echo "완료: $HOOK_DIR"
