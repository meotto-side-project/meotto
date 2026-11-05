#!/usr/bin/env bash
# 편집 직후 규칙 위반 징후를 Claude에게 알린다. (.claude/rules/backend.md, frontend.md)
FILE=$(jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] || [ ! -f "$FILE" ] && exit 0

HITS=""
case "$FILE" in
  */backend/src/*.java)
    HITS=$(grep -nE '^[[:space:]]*(//|/\*|\*[[:space:]/])|;[[:space:]]*//|TODO|FIXME|System\.out\.print' "$FILE" 2>/dev/null)
    LABEL="주석 금지 / TODO·FIXME·System.out 금지"
    ;;
  */frontend/*/src/*.ts|*/frontend/*/src/*.tsx|*/frontend/*/app/*.ts|*/frontend/*/app/*.tsx)
    HITS=$(grep -nE 'console\.[a-zA-Z]+|:[[:space:]]*any\b|<any>|as any\b' "$FILE" 2>/dev/null)
    LABEL="console.* / any 금지"
    ;;
esac

if [ -n "$HITS" ]; then
  printf '[MEOTTO 규칙 경고] %s\n%s\n%s\n' "$LABEL" "$FILE" "$HITS" >&2
  exit 2
fi
exit 0
