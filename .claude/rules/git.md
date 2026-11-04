# Git 협업 규칙 (프론트·백엔드 공통)

커밋 규칙의 기준은 `frontend/commitlint.config.mjs`다.

## 브랜치

- `main` 직접 커밋, push 금지. 모든 작업은 브랜치 → PR → 리뷰 후 사람이 머지.
- 브랜치명: `{type}/MEO-{번호}-{kebab-설명}` (예: `feature/MEO-12-stamp-send-api`)
  - type: `feature` `fix` `refactor` `docs` `chore` `test`
  - Linear 이슈 ID(`MEO-12`)를 넣으면 GitHub–Linear 연동이 브랜치와 PR을 이슈에 자동 연결한다.
  - 이슈가 없으면 ID 부분을 생략하되 사용자에게 알린다.

## 커밋 메시지

```text
type: 요약

- 변경 내용 (무엇을/왜)
```

- type: `feat` `fix` `docs` `style` `refactor` `test` `chore` `revert`
- subject는 50자 이내, 마침표 금지, 한글 가능.
- scope는 쓰지 않는 것이 기본이다. FE 변경에만 `web` `mobile` `fe`를 쓸 수 있다. **BE 변경에는 scope를 쓰지 않는다** (`backend-ci.yml`의 검사가 scope를 거부한다).
- body는 선택. 쓰면 제목과 빈 줄로 구분하고 **모든 줄을 `-`로 시작**한다.
- `Co-Authored-By` 등 자동 서명 트레일러를 넣지 않는다 (body 줄 규칙 위반이기도 하다).
- 논리 단위로 쪼갠다: type이 다르거나, FE와 BE가 섞이거나, 관심사가 다르면 분리.
- `git add -A`, `git add .` 금지. 파일을 명시해서 스테이징한다.
- `--no-verify` 금지.

## PR

- 제목: `[Type] 요약` (`[Feat]` `[Fix]` `[Docs]` `[Refactor]` `[Style]` `[Test]` `[Chore]`)
- 본문: `.github/PULL_REQUEST_TEMPLATE.md` 양식을 채운다. 관련 Spec(F-ID), Linear 이슈, 검증 결과, 미해결 사항을 포함한다.
- 라벨: `.github/labels.json`에 있는 것만 사용한다.
- push, PR 생성, 머지는 사용자 승인 후에만 한다. force push 금지.

## 훅 주의

- 이 저장소의 `core.hooksPath`는 `frontend/.husky`다 (commitlint, lint-staged).
- `backend/.githooks`는 로컬에서 자동 동작하지 않는다. BE 커밋 검증은 CI(`backend-ci.yml`)에서 이뤄진다.

## 시크릿

`.env*`(`.env.example` 제외), 키, 자격증명 파일은 스테이징하지 않는다. 발견하면 제외하고 사용자에게 알린다.
