---
name: plan-feature
description: 승인된 Spec을 기술 설계(Plan)와 검증 가능한 Tasks로 변환해 docs/plans/<feature>.md를 만든다. spec-analyst로 모호함을 먼저 걸러낸다.
disable-model-invocation: true
argument-hint: "<Spec 파일명 또는 F-ID 범위> 예: home 또는 F-10~F-16"
---

# Spec → Plan + Tasks

대상: $ARGUMENTS

`docs/specs/`는 수정하지 않는다. 결과물은 `docs/plans/<spec 파일명>.md` 하나다. 문서 규칙은 `.claude/rules/specs.md`.

## 1. 대상 확인

- `$ARGUMENTS`가 비어 있으면 `docs/specs/README.md`의 목차를 보여 주고 대상을 묻는다.
- 대상 Spec 파일이 없거나 F-ID를 찾지 못하면 멈추고 알린다.
- `docs/plans/<feature>.md`가 이미 있으면 내용을 읽고, 덮어쓰지 말고 "갱신"으로 진행한다. 변경 내용을 먼저 사용자에게 보여 준다.

## 2. Spec 분석 (Agent 호출)

Agent 도구로 `spec-analyst`를 호출한다. Agent는 대화를 볼 수 없으므로 프롬프트에 다음을 넣는다.

- Spec 파일 경로, F-ID 범위
- "출력 형식을 따라 질문 목록을 돌려달라"

결과를 사용자에게 그대로 요약해 보여 준다.

**차단 질문이 있으면 여기서 멈춘다.** 사용자가 답하거나 Spec을 고친 뒤 다시 실행하도록 안내한다. 사용자가 답변을 대화로 주면 그 내용을 Plan의 "결정 사항"에 기록하되, Spec 파일 자체는 고치지 않고 Spec 수정이 필요하다고 알린다.

## 3. Plan 작성

차단 질문이 해소된 후 아래 양식으로 작성한다. 코드베이스를 읽어 현재 존재하는 것(도메인, 컴포넌트, 공통 모듈)을 확인하고 재사용 가능한 것은 Task에 반영한다.

````markdown
# Plan: <기능명>

- Spec: docs/specs/<file>.md
- F-ID: F-xx ~ F-yy
- 상태: draft
- Linear 상위 이슈: (미연동)

## 결정 사항
- (분석 단계에서 사용자가 확정한 내용. 없으면 "없음")

## 기술 설계
(구조, 데이터 흐름, 주요 설계 선택과 이유)

## 프론트엔드 범위
- web: ...
- mobile: ...

## 백엔드 범위
- 도메인/패키지: ...

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
(없으면 "없음")

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID |
|---|---|---|---|---|---|---|---|

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 새 필드나 경로는 Spec에 없는 설계이므로 승인 대상이다.

## 구현 순서와 의존성
(BE 선행 필요 여부, 공통 컴포넌트 선행 등)

## 테스트 전략
- BE: 서비스 단위 테스트 대상
- FE: 컴포넌트(스토리 play), E2E 대상
- 자동 검증이 불가능해 사람이 확인할 AC

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|
| T-F10-01 | ... | BE | F-10 AC2 | - | gradlew test | |
````

작성 규칙:
- Task는 한 번에 검증 가능한 크기로 쪼갠다. 영역(FE/BE/공통)을 섞지 않는다.
- 모든 AC는 최소 한 Task에 연결된다. 연결되지 않은 AC가 있으면 표 아래에 나열한다.
- Task ID는 `T-{F-ID 숫자}-{nn}`이며 한 번 부여하면 바꾸지 않는다.
- 검증 방법에는 실제 실행 가능한 명령 또는 "수동 확인: <방법>"을 쓴다. 미설치 도구를 전제로 하지 않는다.
- Spec에 없는 내용을 지어내지 않는다. 필요하지만 Spec에 없는 것은 "제안" 표시와 함께 계약/설계에 넣고 승인 대상임을 밝힌다.

## 4. 마무리

- 파일을 `상태: draft`로 저장한다.
- 사용자에게 요약을 보여 준다: Task 수(FE/BE), 승인 필요 항목(데이터 모델 변경, 새 API), 미해결 질문.
- **`approved`로 바꾸는 것은 사람이다.** 승인 후 `/sync-linear-issues`, `/implement-feature` 순으로 진행하도록 안내한다.
