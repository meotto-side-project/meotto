---
name: git-commit
description: 변경사항을 분석해 팀 커밋 컨벤션(.claude/rules/git.md)에 맞게 논리 단위로 나눠 커밋한다. 커밋 계획을 먼저 보여 주고 승인 후 커밋한다. push는 하지 않는다.
disable-model-invocation: true
argument-hint: "[커밋 범위 힌트, 선택]"
---

# Git 커밋

규칙은 `.claude/rules/git.md`가 기준이다 (프론트엔드 commitlint 기준으로 통합).

## 하지 않는 것

- push, merge, rebase, reset 등 원격·이력 변경 (push는 `create-pr`에서 승인 후)
- `git add -A`, `git add .`, `--no-verify`
- `Co-Authored-By` 등 자동 서명 트레일러
- `.env*`(`.env.example` 제외), 키, 자격증명 스테이징. 발견하면 제외하고 알린다.

## 1. 사전 확인

1. `git branch --show-current`. **`main`이면 중단**하고 `.claude/rules/git.md`의 브랜치명으로 브랜치를 먼저 만들도록 안내한다.
2. `git status`, `git diff`(스테이징 안 된 것 포함)로 변경 전체를 본다.
3. 변경이 없으면 알리고 끝낸다.

## 2. 커밋 분할 계획

한 덩어리로 몰지 않고 아래 기준으로 나눈다.

- type이 다르면 분리 (`feat`/`fix`/`docs`/`refactor`/`test`/`chore`)
- FE와 BE 변경은 분리 (BE 커밋에는 scope를 쓰지 않는다)
- 기능/도메인이 다르면 분리, 로직과 문서와 설정도 분리
- 작은 변경(오타 등 연관된 한 묶음)은 억지로 쪼개지 않는다

**커밋 계획(커밋 N개, 각 메시지와 포함 파일)을 사용자에게 보여 주고 승인을 받는다.**

## 3. 메시지

```text
type: 요약

- 무엇을/왜
```

- type: `feat` `fix` `docs` `style` `refactor` `test` `chore` `revert`
- subject 50자 이내, 마침표 금지, 한글 가능
- FE 변경에만 scope(`web` `mobile` `fe`) 허용. BE는 scope 없음
- body는 필요할 때만. 모든 줄을 `-`로 시작한다. 제목 다음은 빈 줄
- Task/F-ID를 참조하려면 body에 `- F-12, T-F12-03 구현` 식으로 쓴다
- `/implement-feature` 직후의 커밋처럼 **AI가 만든 코드를 사람이 아직 고치지 않은 첫 커밋**이면 body에 `- AI 초안` 줄을 넣는다 (수정량 측정용, `/log-metrics`가 찾는다). 사람이 고친 뒤의 커밋에는 넣지 않는다. 구분이 애매하면 사용자에게 묻는다.

## 4. 커밋

승인된 계획대로 그룹마다 `git add <파일들>` → `git commit`을 반복한다.

- 훅이 실패하면(commitlint, lint-staged, spotless) 원인을 고치고 새 커밋으로 다시 시도한다. 우회하지 않는다.
- 로컬 commitlint 훅은 `frontend/` 기준이다. BE 커밋은 CI(`backend-ci.yml`)가 검사하므로, BE 메시지는 `type: subject` 형식에 scope가 없는지 직접 확인한다.

## 5. 결과

```text
### 브랜치: <name>
### 커밋: N개
- <hash> <type>: <요약>
### 남은 변경: 없음 / <파일>
다음: /create-pr (push는 승인 후)
```
