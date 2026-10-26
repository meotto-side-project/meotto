---
name: meotto-branch-merge
description: 현재 변경사항을 feature 브랜치(worktree)에 커밋·푸시하고 PR 생성까지 수행
---

# MEOTTO Branch Merge

변경사항을 feature 브랜치에 커밋하고 `origin`에 push한 뒤 PR을 생성한다.
**main에 직접 머지·푸시하지 않는다** (`.claude/rules.md` — main 직접 커밋/푸시 금지, feature 브랜치 → PR → 머지 흐름 강제).

## 핵심 제약사항

- `git worktree`로 브랜치 생성 — `git checkout -b` 금지
- `git add -A` / `git add .` 금지 — 관련 파일만 명시적으로 스테이징
- Co-Authored-By 추가 절대 금지
- `--no-verify` 사용 금지
- force push 금지
- `.env`, 시크릿, 자격증명 파일 감지 시 제외 후 사용자 경고
- **main 브랜치에 병합(`git merge`)하거나 push 금지** — PR 생성까지만 수행, 머지는 GitHub 리뷰를 거쳐 수동으로 진행
- 리모트 이름은 `.claude/rules.md`에 명시된 것을 사용 (아직 미확정이면 `origin` 가정)
- 작업 후 worktree 반드시 정리 (`git worktree remove`)

## 브랜치 네이밍

```
feat/<kebab-case-설명>
fix/<kebab-case-설명>
refactor/<kebab-case-설명>
chore/<kebab-case-설명>
```

## 워크플로우

1. `git status` + `git diff`로 변경사항 분석
2. 변경 내용 기반으로 브랜치명 결정
3. `git worktree add ../<repo>-<branch> -b <branch>`로 worktree 생성
4. 변경 파일을 worktree 경로로 `cp`
5. worktree에서 `meotto-git-committer` 스킬로 커밋 수행
   - 작업 단위가 크면 논리적 단위로 분할 커밋
6. `git push -u origin <branch>`
7. `gh pr create --base main --head <branch> --title "..." --body "..."`
   - 제목: 커밋 컨벤션과 동일 (`type: subject`, 영어, 50자 이하)
   - 본문: Summary + Test plan 형식
8. main 워킹 디렉토리로 돌아와 untracked/modified 파일 정리
   - untracked 신규 파일 → 제거 (worktree에 이미 커밋됨)
   - modified 파일이 남아있으면 사용자에게 확인 후 처리 (임의 stash/삭제 금지)
9. `git worktree remove ../<repo>-<branch>`
10. 생성된 PR URL을 사용자에게 전달

## 주의사항

- untracked 파일 제거 전 반드시 worktree에 해당 파일이 커밋되어 있는지 확인
- PR 생성 후 main으로의 머지는 절대 자동 수행하지 않음 — 사용자가 GitHub에서 리뷰 후 직접 머지
- `gh` 인증이 안 돼 있거나 PR 생성 실패 시, push까지 완료된 상태임을 알리고 수동 PR 생성 링크(`git push` 출력의 `pull/new/<branch>` URL) 안내
