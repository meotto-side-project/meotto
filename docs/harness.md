# AI 개발 하네스 사용 가이드

Meotto에서 Claude Code로 기능을 개발하는 방법입니다. Spec(명세)을 기준으로 설계, 구현, 검증, PR까지 같은 절차로 진행하고, 사람이 승인하는 지점을 분명히 둡니다.

> 상태: 도입 초기입니다. 시범 기능에 적용하면서 다듬는 중이므로, 막히거나 이상한 점은 PR로 고치거나 팀에 공유해 주세요.

## 1. 핵심 원칙

- **Spec이 기준입니다.** `docs/specs/*.md`가 무엇을 만들지 정합니다. 사람이 답한 내용과 구현 중 달라진 결정은 AI가 Spec에 직접 반영하고 보고합니다(PR diff에서 검토). 사람이 정해야 할 모호한 점은 AI가 임의로 정하지 않고 질문합니다.
- **중요한 단계는 `/명령`으로 직접 실행합니다.** AI가 알아서 이어서 진행하지 않습니다.
- **"완료"는 실행 결과로만 말합니다.** 돌리지 않았거나 도구가 없어서 못 돌린 검증은 "미검증"으로 보고됩니다.
- **push, PR 생성, DB 스키마·API 계약 변경은 항상 승인받습니다.**

## 2. 처음 한 번 준비

1. Claude Code를 설치하고 이 저장소 루트(`meotto/`)에서 실행합니다. 루트에서 실행해야 `.claude/`의 명령이 모두 보입니다.
2. `gh auth status`로 GitHub CLI 로그인을 확인합니다.
3. **Linear 연결**: 저장소의 `.mcp.json`에 Linear 서버가 등록되어 있습니다. Claude Code를 시작하면 이 프로젝트의 MCP 서버를 쓸지 묻는 프롬프트가 뜨니 승인하고, `/mcp`에서 `linear`를 선택해 로그인합니다. `/mcp`에서 `linear`가 connected로 보이면 됩니다.
4. 백엔드 작업이 있으면 JDK 21, 프론트엔드 작업이 있으면 Node 22와 pnpm이 필요합니다 (각 폴더 README 참고).

## 3. 기능 하나를 만드는 흐름

```text
Spec → Plan → Tasks → Linear → 구현 → 테스트 → 검증 → PR → 측정
```

| 단계 | 명령 | AI가 하는 일 | 사람이 하는 일 |
|---|---|---|---|
| 1 | `/plan-feature <spec 파일명>` | `spec-analyst`로 모호한 점·누락·선행 기능을 질문으로 정리 | 질문에 답함 (답한 내용은 AI가 Spec에 반영) |
| 2 | (같은 명령) | `docs/plans/<feature>.md` 작성: 기술 설계, API 계약 표, Tasks | **Plan과 API 계약을 읽고 승인**(`상태: approved`로 변경) |
| 3 | `/sync-linear-issues <plan>` | Tasks를 Linear 이슈·서브이슈로 만들 목록을 보여 줌 | 목록을 확인하고 승인 (승인 전에는 Linear를 바꾸지 않음) |
| 4 | `/implement-feature <Task ID 또는 MEO-번호>` | Task 영역에 따라 `frontend-codegen`/`backend-codegen` 호출, 검증 명령 실행 | 계약·DB 변경이 필요하면 승인 |
| 5 | `/implement-feature`의 테스트 단계, FE는 `/create-test` `/create-e2e` | AC마다 테스트를 작성하고 실행. 도구가 없는 테스트는 만들지 않고 "미검증"으로 남김 | 테스트 도구 설치 승인 |
| 6 | `/verify-feature <feature>` | `spec-verifier`가 AC별 증거(테스트 포함)를 모아 충족/미충족/미검증 판정 | 결과 확인, 수동으로 봐야 할 항목 확인 |
| 7 | `/git-commit` → `/create-pr` | 커밋 분할 계획, PR 본문 작성 | 커밋 계획, push, PR 생성을 **각각 승인** |
| 8 | `/log-metrics <PR> <manual\|harness>` | 시간·수정량 등을 모아 `docs/metrics/`에 기록 | 작업 시간 등 자가 입력 |

### 선행 기능이 있을 때

Plan을 만들 때는 **선행 기능의 Plan이 있는지만** 봅니다. 선행 기능이 구현되어 있을 필요는 없습니다. 선행 Plan이 없으면 멈추고 선택지를 보여 줍니다.

- **A.** 선행 기능의 Plan부터 만든다
- **B.** 선행 Plan이 있다고 가정하고 진행한다 (가정은 Plan에 기록됨)
- **C.** 선행 없이 가능한 범위만 먼저 한다

구현 순서는 `/implement-feature`가 구현 시점에 지킵니다. 선행 Task가 구현되지 않았으면 그 Task에서 멈춥니다.

`docs/plans/README.md`에서 Plan별 상태와 권장 구현 순서를 볼 수 있습니다.

### 여러 명이 나눠서 만들 때 (FE 2명 + BE 1명)

한 명이 Spec 하나를 전부 맡지 않아도 됩니다. Plan의 Task가 **F-ID × 영역** 단위라서, 사람마다 자기 Task만 실행하면 됩니다.

예) `friends.md`: FE-A는 F-50·F-51, FE-B는 F-52~F-54, BE는 모든 F-ID의 API.

1. **Plan과 Linear 이슈는 구현 전에 전부 미리 만들어 둡니다.** 한 명이 `/plan-all plan`으로 모든 Spec의 Plan을 선행 순서대로 일괄 생성하고(구현 여부와 무관, 선행 Plan만 있으면 됨), **Plan 전체를 PR로 올려 팀이 리뷰·머지**합니다 (API 계약 표 포함). 미정 질문이 걸린 F-ID의 Task는 "보류"로 표시됩니다.
2. Plan이 `approved`가 되면 `/plan-all linear`로 Linear 이슈를 한 번에 만듭니다 (표 하나, 승인 한 번). 팀이 이미 만든 이슈와 겹치면 새로 만들지 않고 연결하고, 보류 Task도 `(논의 필요)`로 만들어 이슈판에서 보이게 합니다. 담당자는 지정하지 않고 팀이 Linear에서 정합니다.
3. 이슈판에서 자기 Task를 골라 담당자로 지정한 뒤, `/implement-feature MEO-xx MEO-yy`로 **자기 Task만** 구현하고, `/verify-feature friends F-50~51`로 자기 F-ID 범위만 검증하고, 자기 브랜치로 PR을 올립니다.
4. 여러 F-ID가 쓰는 공통 코드(공용 컴포넌트, 쿼리 키 등)는 Plan의 **공통 준비 Task**(`T-F50-00` 식)를 한 명이 먼저 끝냅니다. 그 뒤에 나머지가 시작합니다.

**FE는 BE를 기다리지 않습니다.** API 계약 표의 해당 행이 `확정`되면 FE는 바로 시작하고, API가 아직 없으면 MSW로 목 서버를 만들어 화면과 API 연결까지 구현합니다. BE가 끝나면 Plan 마지막의 `실서버 연동 확인` Task에서 목을 끄고 실제 서버로 확인합니다. 목으로만 확인한 AC는 검증 결과에 `실서버 연동 미검증`으로 남습니다. (`msw` 설치는 승인이 필요합니다.)

## 4. 명령 목록

**SDD 워크플로**: `/plan-all`(전체 Plan·이슈 일괄), `/plan-feature`, `/sync-linear-issues`, `/implement-feature`, `/verify-feature`, `/log-metrics`

**프론트엔드**: `/create-component`, `/create-api-hook`, `/create-test`, `/create-e2e`

**백엔드**: `/backend-fix`(버그 수정), `/db-sync`(Entity와 스키마 갭 점검), `/seed-test-data`(테스트 데이터 SQL)

**공통**: `/code-review`, `/refactor`, `/git-commit`, `/branch-merge`(브랜치 준비 → 커밋 → PR), `/create-pr`, `/qa-pr`(사람이 확인할 QA 체크리스트), `/sync-docs`(문서와 코드 일치 점검)

**Agent**(보통 위 명령이 알아서 호출합니다): `spec-analyst`, `spec-verifier`, `frontend-codegen`, `backend-codegen`. 단독으로 요청할 수 있는 것은 `security-audit`(백엔드 보안 감사), `a11y-audit`(접근성 감사)입니다.

`/verify-feature`와 `/qa-pr`의 차이: 앞은 AC를 증거로 **판정**하고, 뒤는 PR에서 사람이 **직접 확인할 곳**을 좁혀 줍니다.

## 5. 사람이 반드시 승인하는 것

- API 계약 변경
- DB 스키마 변경(Entity 컬럼·테이블), 삭제성 쿼리
- 커밋 계획, `git push`, PR 생성, 머지 (`settings.json`이 push·PR 생성을 확인 프롬프트로 막아 둡니다)
- Linear 이슈 생성

AI는 `main`에 커밋·push하지 못합니다(훅이 차단). 검증이 실패하면 같은 원인으로 최대 2번까지만 고치고, 그래도 안 되면 멈추고 보고합니다.

## 6. Git 규칙 요약 (`.claude/rules/git.md`)

- 브랜치: `{type}/MEO-{번호}-{설명}` (type: feature, fix, refactor, docs, chore, test)
- 커밋: `type: 요약`, 제목 50자 이내·마침표 없음, 본문을 쓰면 **모든 줄을 `-`로 시작**. 백엔드 커밋에는 scope를 쓰지 않습니다. 서명 트레일러(`Co-Authored-By`)는 넣지 않습니다.
- PR 제목: `[Feat] 요약` 형식. 본문에 관련 Spec(F-ID), Linear 이슈, 검증 결과, 미해결 사항을 적습니다.
- Linear 이슈 ID가 브랜치와 PR에 들어가면 GitHub–Linear 연동이 이슈를 연결합니다. 하네스는 Linear 상태를 직접 바꾸지 않습니다.

## 7. 현재 한계

- **시범 전입니다.** 위 흐름은 설계가 끝났고 실제 기능에 적용해 본 적은 아직 없습니다.
- **프론트엔드 테스트 도구가 설치되어 있지 않습니다.** Storybook+Vitest(컴포넌트), Playwright(E2E)를 쓰기로 했지만 미설치라, 해당 검증은 "미검증"으로 보고됩니다. `/create-test`, `/create-e2e`는 설치 여부를 먼저 확인하고 없으면 멈춥니다.
- **모바일(Expo) 규칙은 팀에 RN 경험이 없어서 가장 단순한 기본값으로 정했습니다**(`.claude/rules/frontend-mobile.md`). 써 보며 문제가 있으면 그 파일을 고칩니다. 이 프로젝트는 웹뷰 기반이라 화면은 웹(`apps/web`)에 만들고, 모바일(`apps/mobile`)은 웹을 띄우는 껍데기 + 푸시 알림 같이 꼭 필요한 네이티브 기능만 맡습니다. 공유 링크 페이지는 SEO·소셜 미리보기에 맞춥니다. Plan Task의 영역은 `FE-web`/`FE-mobile`/`BE`로 나눕니다. `/create-component` 등은 첫 인자로 `web` 또는 `mobile`을 받습니다.
- **MSW는 아직 설치되어 있지 않습니다.** 첫 FE 작업에서 설치 승인을 받고 구성합니다 (저장소에서 한 번만 두는 `MSW 구성` Task, 번호 `-98`).
- 백엔드 도메인이 아직 없어서 `backend-codegen`의 패턴이 실제 코드로 검증된 적은 없습니다.

## 8. 문제 해결

| 증상 | 원인과 해결 |
|---|---|
| `main 브랜치에서는 commit/push 할 수 없습니다` | 의도된 차단입니다. 작업 브랜치를 먼저 만드세요. |
| `/sync-linear-issues`가 Linear 미연결이라고 함 | `/mcp`에서 `linear` 로그인을 확인하세요. 필요하면 Claude Code를 다시 시작합니다. |
| 명령이 보이지 않음 | 저장소 루트에서 실행했는지 확인하세요. |
| BE 파일 편집 후 "주석 금지" 경고 | 백엔드는 주석을 쓰지 않습니다. 해당 줄을 지우세요. |
| `/plan-feature`가 선행 Plan이 없다며 멈춤 | 정상 동작입니다. 위 A/B/C 중 선택하세요. |

## 9. 하네스 고치기

규칙·Skill·Agent는 모두 `.claude/`에 있고 코드와 같은 방식으로 PR 리뷰를 거칩니다.

- 공통 지침: 루트 `CLAUDE.md`, 경로별 규칙: `.claude/rules/*.md`
- 절차(Skill): `.claude/skills/<이름>/SKILL.md`, 전문 역할(Agent): `.claude/agents/<이름>.md`
- 무언가 AI가 반복해서 잘못하면 대화에서 고치지 말고 해당 규칙·Skill 파일을 고쳐 PR로 올려 주세요.
- 도입 효과(시간, 수정량, AC 누락, 유지보수 비용)는 `docs/metrics/sdd-pilot.md`에 `/log-metrics`로 기록합니다. 하네스를 쓰지 않은 수동 PR도 같은 방식으로 기록해야 비교가 됩니다.
