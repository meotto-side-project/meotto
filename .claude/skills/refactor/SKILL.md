---
name: refactor
description: 동작 변화 없이 구조를 개선하는 리팩터링. 영향 범위를 먼저 분석하고, 입출력·DB 구조가 바뀌면 중단한다. FE(컴포넌트 분리, 훅 추출, 타입 개선)와 BE(레이어, 관용구 정리) 공통.
argument-hint: "<대상 파일/클래스/컴포넌트>"
---

# 안전 리팩터링

대상: $ARGUMENTS

**원칙: 동작(기능) 변화 없음.** 커밋은 `refactor:` type.

## Phase 1: 사전 분석 (수정 전)

1. 대상과 참조하는 모든 파일을 찾는다 (Grep).
2. 기존 테스트가 대상 동작을 얼마나 덮는지 확인한다.
   - BE: `backend/src/test/`
   - FE: 컴포넌트 테스트(있는 경우), 없으면 "테스트 없음"으로 기록
3. 다음이 바뀌는지 판단한다: API 입출력, DB 구조, 인터페이스 계약, Plan의 API 계약.

**하나라도 바뀌면 중단하고** 영향 범위를 보고한다. 이 Skill로 진행하지 않는다.

## Phase 2: 안전망

테스트가 덮지 않는 동작이면 먼저 테스트를 추가할지 사용자에게 묻는다. 테스트 도구가 없으면(FE) 안전망 없이 진행한다는 사실을 알리고 동의를 받는다.

## Phase 3: 리팩터링

### 백엔드 (`.claude/rules/backend.md`)
- 주석 제거 (주석 절대 금지)
- `Optional`, `Stream`, `var` 등 Java 관용 패턴, DTO는 `record`로 전환 가능하면 전환
- 소프트 딜리트 쿼리 `AndDeletedAtIsNull` 통일, 미사용 import 제거
- 레이어 경계 위반 정리

### 프론트엔드 (`.claude/rules/frontend.md`)
- 과대 컴포넌트(렌더 + 데이터 + 로직 혼재) 분리, 위치 규칙(ui/features) 유지
- 반복 상태/로직은 `use*` 커스텀 훅으로 추출
- 컴포넌트 안 fetch는 `queries/` 훅으로 이동
- `import type` 선호, `any` 제거, 중복 타입 정리
- 배럴 금지, import 방향 유지

## Phase 4: 검증

`CLAUDE.md`의 영역별 검증 명령을 실행한다 (BE: spotlessCheck, checkstyleMain, test / FE: lint, check-types). 실행 결과가 통과여야 완료다.

실패하면 원인을 분석해 최대 2회 고치고, 그래도 안 되면 변경을 중단하고 보고한다.

## 결과

```text
### 변경 범위 (기능 불변)
- [파일]: [무엇을 어떻게]
- 입출력 변경: 없음 / DB 변경: 없음
### 테스트 상태
- 기존: 통과/실패, 추가: N개, 미검증: ...
### 검증 명령
| 명령 | 결과 |
```
