---
name: create-pr
description: 현재 브랜치를 push하고 GitHub PR을 만든다. PR 본문에 관련 Spec(F-ID), Linear 이슈, 구현 Tasks, 검증 결과, 미해결 사항을 채운다. push와 PR 생성은 각각 승인 후에 한다.
disable-model-invocation: true
argument-hint: "[Plan 파일명 또는 Linear ID, 선택]"
---

# PR 생성

대상: $ARGUMENTS

커밋은 `/git-commit`에서 끝나 있어야 한다. 이 Skill은 push와 PR만 다룬다. 규칙은 `.claude/rules/git.md`.

## 1. 사전 확인

1. `git branch --show-current`. `main`이면 중단.
2. `git status`. 커밋되지 않은 변경이 있으면 알리고 `/git-commit`을 먼저 하도록 안내한다.
3. `git fetch origin main` 후 `git log origin/main..HEAD --oneline`으로 PR에 들어갈 커밋을 본다 (로컬 `main`이 아니라 원격 기준). 없으면 중단.
4. 브랜치명과 커밋에서 Linear ID(`MEO-xx`), F-ID, Task ID를 찾는다. 찾지 못하면 인자나 사용자에게 묻는다. 끝내 없으면 "없음"으로 쓴다.
5. 문서 점검: 이 브랜치에서 구조나 설정이 바뀌었는데 `CLAUDE.md`, `docs/`가 낡았을 수 있으면 `sync-docs` 실행을 권한다 (자동 실행하지 않는다).

## 2. 검증 결과 수집

PR 본문에 쓸 검증 결과는 **실제로 실행한 결과만** 쓴다.

- 이 세션에서 `/verify-feature` 결과가 있으면 그것을 사용한다. 없으면 변경 영역의 검증 명령(`CLAUDE.md`의 표)을 지금 실행한다.
- 실행하지 않았거나 실행할 수 없는 항목은 "미검증"으로 쓴다. 통과로 쓰지 않는다.
- 검증 실패가 있으면 PR 생성 전에 사용자에게 알리고 진행 여부를 묻는다.

## 3. push (승인 필요)

push할 브랜치와 커밋 목록을 보여 주고 승인을 받는다.

- 첫 push: `git push -u origin <branch>`, 이후: `git push`
- force push 금지.

## 4. PR 작성

**제목**: `[Type] 요약` (`[Feat]` `[Fix]` `[Docs]` `[Refactor]` `[Style]` `[Test]` `[Chore]`). 50자 안팎, 마침표 없음.

**본문**: `.github/PULL_REQUEST_TEMPLATE.md`의 섹션 구조를 그대로 쓴다. 배경 없이 이 PR만 본 사람이 이해할 수 있게, 파일 나열이 아니라 "무엇을, 왜"를 쓴다.

- **What is this PR?**: 문제와 배경 → 이 PR이 해결하는 것, 결과
- **Changes**:
  - 주요 변경과 설계 결정(왜 그렇게 했는가). 구현한 Task 목록(`T-F10-01 ...`)
  - **검증 결과** 소제목: 실행한 명령과 결과 표, 미검증 항목과 이유, AC 충족 현황(`/verify-feature` 결과가 있으면 요약). 하네스로 구현한 경우 `git log --grep='AI 초안'`으로 찾은 AI 초안 커밋 SHA도 적는다 (없으면 생략)
  - **미해결 사항** 소제목: 남은 질문, 후속 작업, Plan과 다르게 된 부분
- **Related Issues**:
  - Spec: `docs/specs/<file>.md` F-xx~yy
  - Plan: `docs/plans/<feature>.md`
  - Linear: `Part of MEO-xx` (이슈 링크만 걸고 상태는 바꾸지 않는 표현). 머지 시 이슈를 닫으려면 사용자가 `Closes MEO-xx`로 바꾸도록 안내한다.
- **Screenshot**: UI 변경이면 스크린샷, 아니면 `해당 없음`
- **Check List**: 템플릿의 6개 항목을 모두 표시하고 충족된 것만 `[x]`로 체크한다. "테스트가 전부 통과되었나요?"는 실제 실행으로 확인된 경우에만 체크한다.

PR 본문 초안을 사용자에게 보여 준다.

## 5. PR 생성 (승인 필요)

초안 승인 후 `gh pr create`:

- `--base main --head <branch>`
- `--title`, `--body`
- `--assignee @me`
- `--label`: `gh label list`에 있는 라벨만. 변경 type에 맞는 것 하나 (feature, fix, docs, style, refactor, test, chore 계열)
- `--reviewer`: **교차 리뷰.** `gh api repos/{owner}/{repo}/collaborators --jq '.[].login'`으로 협업자를 얻고, PR 작성자(`gh api user --jq .login`)를 뺀 나머지 전원을 지정한다 (협업자 3명이면 작성자 외 2명). 사용자가 다르게 지정하면 그대로 따른다. 협업자 조회에 실패하거나 작성자를 빼고 0명이면 사용자에게 묻는다.

머지(`gh pr merge`)는 하지 않는다.

## 6. Linear 상태

Linear 이슈의 상태는 변경하지 않는다. 브랜치명과 PR 본문에 이슈 ID가 있으면 GitHub–Linear 연동이 PR 이벤트에 따라 상태를 갱신한다 (연동이 켜져 있는 경우). 연동 설정 여부는 이 Skill이 확인할 수 없으므로 PR 생성 후 Linear 이슈에 링크가 붙었는지 사용자에게 확인을 요청한다.

## 7. 결과

```text
### 브랜치: <name>
### PR: <url>
### 검증: 통과 N / 실패 N / 미검증 N
### 확인 요청: Linear 이슈에 PR 링크가 연결되었는지
```
