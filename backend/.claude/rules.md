# Claude Code 작업 규칙

## Git 규칙

- **main 브랜치는 직접 커밋/푸시 금지**
- 모든 작업은 feature 브랜치(worktree) → PR → 머지 흐름으로 진행
- 브랜치 머지 요청 없이 main push 금지
- 리모트/저장소 구성이 확정되면 이 파일에 실제 리모트 이름을 명시할 것 (현재는 `origin` 가정)
- PR 생성까지가 자동화 범위 — main으로의 실제 머지는 GitHub 리뷰를 거쳐 사용자가 수동으로 진행
