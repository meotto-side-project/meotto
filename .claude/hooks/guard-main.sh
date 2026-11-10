#!/usr/bin/env bash
# main 브랜치에서 git commit/push를 막는다. (.claude/rules/git.md)
CMD=$(jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0

# git 전역 옵션(-C <경로>, -c k=v, --no-pager 등)이 서브커맨드 앞에 와도 잡는다.
GIT_PREFIX='(^|[;&|[:space:]])git([[:space:]]+(-C[[:space:]]+[^[:space:]]+|-c[[:space:]]+[^[:space:]]+|--[a-z-]+(=[^[:space:]]+)?|-[a-zA-Z]))*[[:space:]]+'

if echo "$CMD" | grep -qE "${GIT_PREFIX}(commit|push)([[:space:]]|\$)"; then
  BRANCH=$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null)
  if [ "$BRANCH" = "main" ]; then
    echo "main 브랜치에서는 commit/push 할 수 없습니다. {type}/MEO-{번호}-{설명} 브랜치를 먼저 만드세요. (.claude/rules/git.md)" >&2
    exit 2
  fi
fi

# 다른 브랜치에서 원격 main으로 push하는 경우(git push origin main, HEAD:main, +main)도 막는다.
if echo "$CMD" | grep -qE "${GIT_PREFIX}push([[:space:]]|\$)" \
  && echo "$CMD" | grep -qE '[[:space:]:+](refs/heads/)?main([[:space:]]|$)'; then
  echo "원격 main으로 push 할 수 없습니다. 브랜치를 push하고 PR을 만드세요. (.claude/rules/git.md)" >&2
  exit 2
fi
exit 0
