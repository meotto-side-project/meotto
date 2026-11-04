---
name: implement-feature
description: 승인된 Plan의 Task를 구현하도록 frontend-codegen, backend-codegen을 조율하고, 계약 일치와 검증 명령을 확인한다. 커밋과 push는 하지 않는다.
disable-model-invocation: true
argument-hint: "<Task ID 또는 Linear ID> 예: T-F10-03 또는 MEO-12 (여러 개는 공백으로 구분)"
---

# Task 구현 조율

대상: $ARGUMENTS

이 Skill은 **조율**만 한다. 코드 작성은 Codegen Agent가 한다. 대화 내용은 Agent에 전달되지 않으므로 필요한 정보를 프롬프트에 명시한다.

## 1. 사전 조건 (하나라도 어긋나면 멈추고 보고)

1. `docs/plans/*.md`에서 대상 Task를 찾는다. Linear ID(`MEO-xx`)가 주어지면 Tasks 표의 Linear 열로 찾는다. 없으면 멈춘다.
2. 해당 Plan의 `상태`가 `approved`인지 확인한다. `draft`면 멈춘다.
3. Task의 선행 Task가 있으면 완료 여부를 사용자에게 확인한다 (상태 기준은 Linear, 또는 사용자의 답).
4. 현재 브랜치가 `main`이 아닌지 확인한다. `main`이면 멈추고 `.claude/rules/git.md`의 브랜치명으로 브랜치를 만들도록 안내한다 (브랜치 생성은 사용자 승인 후).
5. `git status`로 작업 트리를 확인한다. 이 Task와 무관한 변경이 있으면 알린다.

## 2. 실행 계획 보고

대상 Task마다 영역, 담당 Agent, 건드릴 영역, 승인이 필요한 항목(데이터 모델 변경, 새 API)을 표로 보여 준다. 승인이 필요한 항목이 있고 Plan에서 승인되지 않았다면 사용자에게 승인을 받은 뒤 진행한다.

## 3. 구현

Task의 영역에 따라 Agent 도구로 호출한다.

| 영역 | Agent |
|---|---|
| FE | `frontend-codegen` |
| BE | `backend-codegen` |
| 공통 | 영역별 Task로 쪼개 각각 호출. 쪼갤 수 없으면 사용자에게 선택을 묻는다 |

Agent 프롬프트에 반드시 넣을 것:
- Task ID와 Task 행 전체
- Plan 경로, Spec 경로, 해당 F-ID의 AC
- 수정 허용 경로 (`frontend/` 또는 `backend/`), 수정 금지 영역
- "커밋하지 말 것. 계약 변경이 필요하면 구현하지 말고 보고할 것"

BE와 FE Task가 같은 API를 다루면 **BE를 먼저** 구현하고, 계약이 확정된 뒤 FE를 호출한다. 서로 독립적인 Task만 병렬로 호출한다.

## 4. 계약 확인

API가 걸린 Task는 Agent 보고의 `계약 변경 필요`와 실제 코드를 확인한다.
- Plan의 API 계약 표와 BE(Controller, DTO, ErrorCode), FE(호출부, Zod 스키마)를 대조한다.
- 불일치하거나 변경이 필요하면 **멈추고 사용자에게 승인을 요청**한다. 승인되면 Plan의 계약 표를 먼저 수정(변경 내용 제시 후)하고, 필요한 쪽의 Agent를 다시 호출한다.

## 5. 검증과 재시도

- 영역별 검증 명령(`CLAUDE.md` 표)이 Agent 보고에 통과로 기록되어 있어도, 이 Skill이 직접 한 번 더 실행해 결과를 확인한다.
- 실패하면 원인을 분석하고 수정 지시를 담아 해당 Agent를 다시 호출한다. **같은 원인으로 최대 2회**. 그래도 실패하면 멈추고 실패 로그와 가설을 보고한다.
- 요구사항이 모호해 구현을 진행할 수 없다는 보고가 오면 추정하지 말고 질문으로 정리해 사용자에게 돌려준다.

## 6. 보고

```text
## 구현 결과
| Task | 영역 | 변경 파일 | 검증 | 상태 |

## 검증 명령 결과
| 명령 | 결과 |

## 미검증 / 사람 확인 필요
- ...

## 계약 변경 / 승인 필요 항목
- ...

## 다음 단계
/verify-feature <feature>  →  /git-commit  →  /create-pr
```

완료 판단은 명령 실행 결과로만 한다. Linear 상태는 바꾸지 않는다 (GitHub–Linear 연동에 맡긴다).
