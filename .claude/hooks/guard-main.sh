#!/usr/bin/env bash
# main 브랜치에서 git commit/push를 막는다. (.claude/rules/git.md)
CMD=$(jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0

if echo "$CMD" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(commit|push)'; then
  BRANCH=$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null)
  if [ "$BRANCH" = "main" ]; then
    echo "main 브랜치에서는 commit/push 할 수 없습니다. {type}/MEO-{번호}-{설명} 브랜치를 먼저 만드세요. (.claude/rules/git.md)" >&2
    exit 2
  fi
fi
exit 0
