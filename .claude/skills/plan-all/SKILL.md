---
name: plan-all
description: docs/specs의 모든 기능에 대해 선행 순서대로 Plan을 일괄 생성하고, 승인된 뒤 Linear 이슈를 한 번에 만든다. 팀이 이슈판에서 전체 구현 목록을 볼 수 있게 한다. 단계마다 사람이 승인한다.
disable-model-invocation: true
argument-hint: "[plan | linear] 비우면 현재 상태를 보고 다음 단계를 안내"
---

# 전체 Plan과 Linear 이슈 일괄 생성

대상: $ARGUMENTS

이 Skill은 **조율**만 한다. Plan 작성은 `plan-feature`, 이슈 생성은 `sync-linear-issues`의 절차를 따른다. 두 단계(`plan`, `linear`)로 나뉘며 사이에 팀의 Plan 리뷰가 있다. 상태를 보고 지금 어느 단계인지 판단한다.

## 0. 현재 상태 확인

1. `docs/specs/README.md`의 목차에서 Spec 목록을 읽는다 (`design-system` 같은 구현 대상이 아닌 문서는 목차 설명을 근거로 제외한다).
2. `docs/plans/`의 기존 Plan과 `상태`를 읽는다.
3. 현재 브랜치가 `main`이 아닌지 확인한다. `main`이면 멈추고 작업 브랜치를 먼저 만들도록 안내한다.
4. 다음 단계를 보고한다:
   - Plan이 없는 Spec이 있음 → `plan` 단계
   - 모든 Plan이 `approved`이고 Linear 열이 비어 있음 → `linear` 단계
   - 그 외(일부만 approved 등) → 현황 표를 보여 주고 사용자에게 묻는다

## 단계 1: plan

1. Spec마다 `spec-analyst`를 Agent로 **병렬** 호출한다. 프롬프트에 Spec 경로, F-ID 범위, "출력 형식을 따라 질문 목록과 의존성을 돌려달라"를 넣는다.
2. 결과를 합쳐 사용자에게 보여 준다:
   - 선행 순서 (하드/소프트 의존 그래프)
   - 차단 질문 전체 (`[논의 필요]`, `(확인 필요)`, Open Questions) — Spec별로 묶는다
3. 사용자가 답한 질문은 해당 Spec에 반영한다 (`.claude/rules/specs.md`). 답이 없는 질문은 **보류**로 둔다. 멈추지 않는다.
4. 선행 순서대로 `plan-feature`의 3~4단계 절차로 Plan을 `draft`로 만든다.
   - 선행 Plan이 있으면 그 계약 표를 참조한다 (구현 여부와 무관).
   - 보류 질문에 걸린 F-ID의 Task는 만들되 `선행` 또는 `검증 방법`에 `보류: <질문 요약>`을 적는다. 질문이 해소되기 전에는 구현하지 않는다.
   - API 계약 표의 `상태`를 행마다 채운다. 보류 질문에 걸린 행은 `보류: <질문>`, 나머지는 `확정`이다.
   - `MSW 구성`(`T-{첫 F-ID}-98`)은 저장소에서 한 번만 만든다. 선행 순서상 **FE-web Task가 있는 첫 Plan**에만 넣고, 이후 Plan은 그 Task ID를 FE Task의 `선행`에 적는다.
   - `docs/plans/README.md`를 갱신한다 (Plan, 상태, 선행 Plan, 권장 구현 순서).
5. 사용자에게 요약을 보여 준다: Plan 수, Task 수(FE/BE/보류), 승인이 필요한 데이터 모델·API, 보류 목록.
6. 안내한다: "Plan 전체를 PR로 올려 팀이 리뷰하고 API 계약(`확정` 행)을 승인한 뒤, 각 Plan의 `상태`를 `approved`로 바꾸세요. 그다음 `/plan-all linear`를 실행합니다." 커밋과 PR은 `/git-commit`, `/create-pr`로 따로 한다.

## 단계 2: linear

1. `approved`가 아닌 Plan이 있으면 목록을 보여 주고, 해당 Plan은 제외할지 사용자에게 묻는다.
2. `sync-linear-issues all`의 절차를 그대로 따른다:
   - 연결 확인 → 마커·키워드로 중복 검색 → **전체 Plan의 계획 표 하나**를 보여 준다.
   - 이미 팀이 만든 이슈와 겹치면 새로 만들지 않고 `연결(기존 MEO-xx)`로 표시한다.
   - 보류 Task도 이슈로 만든다 (제목 끝 ` (논의 필요)`).
   - 담당자는 지정하지 않는다.
3. **표를 승인받은 뒤에만** 생성한다. 이슈 수가 많으면 상위 이슈 → 서브이슈 → blocked by 순으로 나눠 실행하고, 실패는 성공으로 기록하지 않는다.
4. 생성·연결된 Linear ID를 각 Plan의 Tasks 표와 상위 이슈 칸에 기록한다 (기록 전에 변경 내용을 보여 준다).
5. 결과 표를 보고한다: 생성 / 연결 / 건너뜀 / 실패 건수, 고아 이슈.

## 하지 않는 것

- Spec에 없는 내용을 지어내서 Plan을 채우지 않는다. 보류 질문을 임의로 정하지 않는다.
- 사용자 승인 없이 Linear 이슈를 만들거나 수정하지 않는다. 기존 이슈의 상태, 담당자, 내용을 바꾸지 않는다.
- 구현(`/implement-feature`)을 시작하지 않는다.
- 커밋, push, PR 생성을 하지 않는다.
