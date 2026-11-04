---
name: branch-merge
description: main에서 작업 중인 변경사항을 규칙에 맞는 새 feature 브랜치로 옮기고 git-commit → create-pr 흐름으로 이어준다. 이름과 달리 main에 병합하지 않는다.
disable-model-invocation: true
argument-hint: "<Linear 이슈 ID, type, 설명> 예: MEO-12 feature stamp-send-api"
---

# 브랜치 생성 → 커밋 → PR

대상: $ARGUMENTS

이 Skill은 **브랜치 준비**만 직접 한다. 커밋은 `git-commit`, push와 PR은 `create-pr`의 절차를 따른다. **main에 병합하거나 push하지 않는다.** 머지는 GitHub 리뷰 후 사람이 한다.

## 1. 현재 상태 확인

- `git branch --show-current`, `git status`로 현재 브랜치와 변경을 확인한다.
- 이미 `main`이 아닌 작업 브랜치에 있다면 브랜치를 만들 필요가 없다. 바로 `/git-commit`으로 안내한다.
- 변경이 없으면 알리고 끝낸다.

## 2. 브랜치명 결정

`{type}/MEO-{번호}-{kebab-설명}` (`.claude/rules/git.md`). 인자에 Linear ID가 없으면 사용자에게 묻고, 이슈가 없다고 하면 ID 없이 `{type}/{kebab-설명}`으로 한다.

## 3. 브랜치 생성 (승인 후)

브랜치명과 옮겨질 변경 파일 목록을 보여 주고 승인을 받은 뒤 만든다.

- 기본: `git switch -c <branch>`. 변경은 작업 트리에 그대로 따라간다.
- 다른 작업과 격리하고 싶다고 사용자가 요청하면 `git worktree add ../<repo>-<branch> -b <branch>`를 쓰고, 끝나면 `git worktree remove`로 정리한다. 변경 파일 복사가 필요하면 무엇을 복사했는지 보고한다.
- 기존 변경을 stash하거나 삭제하지 않는다.

## 4. 이어서

1. `/git-commit` 절차로 커밋 계획을 세우고 승인받아 커밋한다.
2. `/create-pr` 절차로 push(승인)와 PR 생성(승인)을 한다.

## 주의

- force push, `--no-verify` 금지.
- main으로의 실제 머지는 자동으로 하지 않는다.
- `gh` 인증이 없거나 PR 생성에 실패하면 push까지 끝난 상태임을 알리고 `pull/new/<branch>` 링크를 안내한다.
