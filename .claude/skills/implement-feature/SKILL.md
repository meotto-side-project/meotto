---
name: implement-feature
description: 승인된 Plan의 Task를 구현하도록 frontend-codegen, backend-codegen을 조율하고, 계약 일치와 검증 명령을 확인한다. 커밋과 push는 하지 않는다.
disable-model-invocation: true
argument-hint: "[Task ID 또는 Linear ID] 예: T-F10-03 또는 MEO-12 (여러 개는 공백으로 구분, 비우면 내게 배정된 Task)"
---

# Task 구현 조율

대상: $ARGUMENTS

이 Skill은 **조율**만 한다. 코드 작성은 Codegen Agent가 한다. 대화 내용은 Agent에 전달되지 않으므로 필요한 정보를 프롬프트에 명시한다.

## 1. 사전 조건 (하나라도 어긋나면 멈추고 보고)

0. 담당자 확인: 담당자는 Linear 이슈의 담당자가 기준이다 (Plan에는 없다).
   - `$ARGUMENTS`가 비어 있으면 Linear MCP로 담당자가 나인 `MEO` 이슈(Done 제외)를 조회해 Task 목록을 보여 주고 고르게 한다. Linear MCP가 없으면 Task ID를 직접 달라고 안내한다.
   - 대상 Task의 담당자가 비어 있거나 다른 사람이면 알리고, 진행할지 사용자에게 묻는다. 담당자 지정은 사용자 승인 후에만 한다. Linear MCP가 없으면 "담당자 미확인"으로 보고하고 진행한다.
1. `docs/plans/*.md`에서 대상 Task를 찾는다. Linear ID(`MEO-xx`)가 주어지면 Tasks 표의 Linear 열로 찾는다. 없으면 멈춘다.
2. 해당 Plan의 `상태`가 `approved`인지 확인한다. `draft`면 멈춘다.
3. 선행을 확인한다. 대상은 Task의 `선행` 열(같은 Plan과 다른 Plan의 Task)과 Plan의 "선행 Plan과 가정" 표다.
   - 각 선행 Task의 Linear 상태를 조회한다 (Linear MCP가 없으면 사용자에게 묻는다). `Done`이거나 코드에 이미 있으면 충족이다.
   - **하드 의존이 미충족이면 멈춘다.** 어떤 선행이 필요한지 보고하고, 선행 구현을 먼저 하거나 Plan의 가정 방식(`plan-feature` 선택지 B)으로 진행해도 되는지 사용자에게 묻는다. 허락 없이 선행 기능을 이 Skill에서 같이 구현하지 않는다.
   - 소프트 의존만 미충족이면 경고하고 진행한다. 통합·E2E 검증은 선행 완료 전까지 미검증으로 남긴다.
   - 가정으로 진행하는 Task는 가정 목록을 Agent 프롬프트에 그대로 넣고, 가정을 벗어나는 구현을 하지 않게 한다.
   - Task의 `선행`이나 연결된 API 계약 행이 `보류`이면 멈추고 어떤 질문이 해소되어야 하는지 보고한다. 계약 행이 `확정`일 때만 시작한다.
   - **FE Task는 BE Task의 완료를 기다리지 않는다.** Plan이 `approved`이고 API 계약 행이 `확정`이면 시작할 수 있다. API가 아직 없으면 MSW 목으로 구현한다. `실서버 연동 확인` Task만 BE Task 완료(Linear Done이고 쓸 수 있는 서버가 있음)를 확인한다.
4. 현재 브랜치가 `main`이 아닌지 확인한다. `main`이면 멈추고 `.claude/rules/git.md`의 브랜치명으로 브랜치를 만들도록 안내한다 (브랜치 생성은 사용자 승인 후).
5. `git status`로 작업 트리를 확인한다. 이 Task와 무관한 변경이 있으면 알린다.

## 2. 실행 계획 보고

대상 Task마다 영역, 담당 Agent, 건드릴 영역, 승인이 필요한 항목(데이터 모델 변경, 새 API)을 표로 보여 준다. 승인이 필요한 항목이 있고 Plan에서 승인되지 않았다면 사용자에게 승인을 받은 뒤 진행한다.

## 3. 구현

Task의 영역에 따라 Agent 도구로 호출한다.

| 영역 | Agent |
|---|---|
| FE-web, FE-mobile | `frontend-codegen` (프롬프트에 플랫폼 `web`/`mobile`을 명시) |
| BE | `backend-codegen` |
| 공통 | 영역별 Task로 쪼개 각각 호출. 쪼갤 수 없으면 사용자에게 선택을 묻는다 |

Agent 프롬프트에 반드시 넣을 것:
- Task ID와 Task 행 전체
- Plan 경로, Spec 경로, 해당 F-ID의 AC
- 수정 허용 경로 (`frontend/` 또는 `backend/`), 수정 금지 영역
- "커밋하지 말 것. 계약 변경이 필요하면 구현하지 말고 보고할 것"

BE와 FE Task가 같은 API를 다뤄도 **서로 기다리지 않는다.** 계약 표가 기준이고 FE는 MSW 목으로 구현한다. FE Agent 프롬프트에 "API가 구현되어 있지 않으면 계약 표 기준 MSW 핸들러를 만들고 목으로 연결까지 구현할 것"을 명시한다. `선행`(공통 준비 Task 등)이 있는 Task만 순서를 지킨다.

`실서버 연동 확인` Task: 목을 끄고(`NEXT_PUBLIC_API_MOCKING` 해제) 실제 서버로 화면이 동작하는지 확인하고, 계약과 다른 점은 고치지 말고 보고한다. 사람이 서버 환경을 알려 줘야 하면 묻는다.

## 4. 계약 확인

API가 걸린 Task는 Agent 보고의 `계약 변경 필요`와 실제 코드를 확인한다.
- Plan의 API 계약 표와 BE(Controller, DTO, ErrorCode), FE(호출부, Zod 스키마)를 대조한다.
- MSW 핸들러의 응답과 에러가 계약 표와 일치하는지도 대조한다.
- 불일치하거나 변경이 필요하면 **멈추고 사용자에게 승인을 요청**한다. 승인되면 Plan의 계약 표를 먼저 수정(변경 내용 제시 후)하고, 필요한 쪽의 Agent를 다시 호출한다.

## 5. 테스트 작성과 실행

구현 Task마다 Plan의 "테스트 전략"과 Task의 AC에 대응하는 테스트를 만든다.

| 영역 | 테스트 | 작성 |
|---|---|---|
| BE | 서비스 단위 테스트(Mockito), 필요하면 Controller 테스트 | `backend-codegen`이 구현과 함께 작성 (Agent 프롬프트에 "AC별 테스트 포함"을 명시) |
| FE-web | 컴포넌트·훅·스키마(Vitest + React Testing Library), 핵심 여정은 Playwright | `/create-test`, `/create-e2e` 절차로 `frontend-codegen`이 작성 |
| FE-mobile | jest-expo + RNTL, 핵심 여정은 Maestro | 위와 동일 |

- 테스트 도구가 설치되어 있지 않으면 테스트를 만들지 않고 "미검증"으로 기록한다. 도구 설치는 사용자 승인 후 별도 작업이다.
- 어떤 AC를 어느 테스트가 덮는지 보고 표에 적는다. 테스트로 덮을 수 없는 AC(실기기, 푸시 등)는 "사람 확인"으로 둔다.
- 테스트를 통과시키려고 테스트나 기대값을 약하게 고치지 않는다. 실패는 구현 문제인지 Spec 해석 문제인지 먼저 구분해 보고한다.

## 6. 검증과 재시도

- 영역별 검증 명령(`CLAUDE.md` 표)이 Agent 보고에 통과로 기록되어 있어도, 이 Skill이 직접 한 번 더 실행해 결과를 확인한다.
- 실패하면 원인을 분석하고 수정 지시를 담아 해당 Agent를 다시 호출한다. **같은 원인으로 최대 2회**. 그래도 실패하면 멈추고 실패 로그와 가설을 보고한다.
- 요구사항이 모호해 구현을 진행할 수 없다는 보고가 오면 추정하지 말고 질문으로 정리해 사용자에게 돌려준다.

## 7. 보고

```text
## 구현 결과
| Task | 영역 | 변경 파일 | 테스트(AC 대응) | 검증 | 상태 |

## 검증 명령 결과
| 명령 | 결과 |

## 미검증 / 사람 확인 필요
- ...

## 계약 변경 / 승인 필요 항목
- ...

## 다음 단계
/verify-feature <feature>  →  /git-commit  →  /create-pr
```

완료 판단은 명령 실행 결과와 함께 계약 일치, AC 대응 근거(실제 코드와 테스트)를 확인한 뒤에 한다. 명령이 통과해도 이 근거가 없으면 완료로 쓰지 않는다. Linear 상태는 바꾸지 않는다 (GitHub–Linear 연동에 맡긴다).

사람이 코드를 고치기 전에 `/git-commit`으로 먼저 커밋하면 그 커밋이 "AI 초안"으로 기록된다 (`git-commit`이 body에 표시). 수정량 측정을 위해 이 순서를 안내한다.
