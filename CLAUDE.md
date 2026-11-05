# MEOTTO 모노레포

토마토 도장으로 칭찬을 주고받으며 마음을 전하는 모바일 앱. 프론트엔드와 백엔드를 한 저장소에서 관리한다.

| 영역 | 위치 | 스택 | 상세 지침 |
|---|---|---|---|
| Frontend | `frontend/` | pnpm + turbo, `apps/web`(Next), `apps/mobile`(Expo) | `frontend/apps/*/AGENTS.md`, `.claude/rules/frontend.md` |
| Backend | `backend/` | Java 21, Spring Boot 4, DDD, MySQL, Redis | `backend/CLAUDE.md`, `.claude/rules/backend.md` |
| Spec | `docs/specs/` | 기능별 명세 (F-ID, AC, Open Questions) | `docs/specs/README.md` |
| Plan | `docs/plans/` | Spec별 기술 설계 + Tasks | `.claude/skills/plan-feature` |

프로젝트 관리는 Linear 워크스페이스 `meotto`, 팀 키 `MEO` (https://linear.app/meotto/team/MEO/overview).

## 기능 스펙

기능을 구현하거나 수정하기 전에 [docs/specs/README.md](docs/specs/README.md)를 먼저 읽고, 목차에서 작업 대상 기능 파일만 추가로 읽는다.

- 커밋/PR에는 기능 ID(`F-xx`)를 적는다.
- 스펙에 **[논의 필요]**로 표시된 항목은 임의로 정하지 말고 사용자에게 확인한다.
- 구현 중 스펙과 다른 결정을 했다면 해당 스펙 파일도 함께 수정한다.
  - 스펙 수정은 AI가 직접 반영하고, 어떤 파일의 무엇을 바꿨는지 결과 보고에 적는다. 사용자는 PR diff에서 검토한다.

## SDD 워크플로

```text
Spec → Plan → Tasks → Linear → Implementation → Test → Verification → PR → Metrics
```

| 단계 | 명령 | 수행 | 사람 승인 |
|---|---|---|---|
| 1. 명세 분석 | `/plan-feature` (내부에서 `spec-analyst`) | 모호함, 누락, 의존성을 질문으로 정리 | 질문 답변은 사람 (Spec 수정은 AI가 반영) |
| 2. 설계 | `/plan-feature` | `docs/plans/<feature>.md` 생성 (기술 설계, API 계약, Tasks) | Plan과 API 계약 승인 |
| 3. Linear | `/sync-linear-issues` | Tasks를 이슈·서브이슈와 연결 | 생성 목록 확인 |
| 4. 구현 | `/implement-feature` | `frontend-codegen`, `backend-codegen` 조율 | 계약·DB 변경 시 |
| 5. 테스트 | `/implement-feature` 안의 테스트 단계, FE는 `/create-test` `/create-e2e` | AC마다 테스트를 작성하고 실행 (BE `./gradlew test`, FE는 설치된 도구만) | 도구 설치 시 |
| 6. 검증 | `/verify-feature` | `spec-verifier`가 AC별 증거 수집 (AC ↔ 테스트 대응 포함) | - |
| 7. PR | `/git-commit` → `/create-pr` | 커밋, push, PR | 커밋·push·PR 생성 각각 |
| 8. 측정 | `/log-metrics` | 시간, 수정량, AC 충족, 유지보수 비용을 `docs/metrics/`에 기록 (수동 PR도 같은 방식) | 기록 추가 시 |

단계 사이에는 사람이 확인한다. 위 명령은 모두 `/명령`으로 직접 실행한다 (자동 호출에 의존하지 않는다).

## 문서 책임

- `docs/specs/*.md`: **무엇을** 만드는가. 구현 중 결정이 달라지거나 사용자가 답을 주면 AI가 직접 수정하고 변경 내용을 보고한다. `[논의 필요]`처럼 사람이 정해야 하는 모호한 점은 임의로 정하지 않고 질문한다.
- `docs/plans/<feature>.md`: **어떻게** 만드는가. Plan(설계, API 계약)과 Tasks(작업 목록, Linear ID).
- Spec과 Plan이 충돌하면 Spec이 맞다. 충돌을 발견하면 임의로 해결하지 말고 질문한다.
- Task 진행 상태의 기준은 Linear다. Plan 파일에는 Linear ID만 기록한다.

## 검증 명령 (실제 사용 가능한 것)

| 영역 | 디렉터리 | 명령 |
|---|---|---|
| BE 포맷 | `backend/` | `./gradlew spotlessCheck` (고치기: `spotlessApply`) |
| BE 정적 분석 | `backend/` | `./gradlew checkstyleMain` |
| BE 테스트 | `backend/` | `./gradlew test` |
| FE 린트 | `frontend/` | `pnpm lint` |
| FE 타입 | `frontend/` | `pnpm check-types` |
| FE 빌드 | `frontend/` | `pnpm build` |
| FE 컴포넌트 테스트 | `frontend/apps/web` | Storybook + Vitest (**미설치**, `create-test` 참고) |
| FE E2E | `frontend/apps/web` | Playwright (**미설치**, `create-e2e` 참고) |

설치되지 않은 도구는 통과로 보고하지 않는다. "미검증"으로 보고한다.

## 안전 규칙

1. API 계약, DB 스키마, 삭제성 쿼리를 바꾸기 전에 승인을 받는다. (Spec 수정은 승인 없이 반영하되 보고한다.)
2. `git push`, PR 생성, merge는 승인 후에만 한다. `main`에 직접 커밋하지 않는다.
3. 기존 파일을 덮어쓰기 전에 현재 내용을 읽고 영향을 보고한다.
4. 검증이 실패하면 원인을 분석해 최대 2회까지만 수정한다. 그래도 실패하거나 요구사항이 모호하면 멈추고 보고한다.
5. "완료"는 실제 명령 실행 결과로만 판단한다. 실행하지 않은 검증을 통과했다고 쓰지 않는다.
6. Agent는 맡은 영역(`frontend/**` 또는 `backend/**`) 밖의 파일을 수정하지 않는다.

## 규칙 파일

- `.claude/rules/git.md`: 브랜치, 커밋, PR 규칙 (전체 공통)
- `.claude/rules/frontend.md`(공통), `frontend-web.md`, `frontend-mobile.md`, `backend.md`, `database.md`: 해당 경로를 다룰 때 로드
- `.claude/rules/specs.md`: `docs/specs`, `docs/plans`를 다룰 때 로드
