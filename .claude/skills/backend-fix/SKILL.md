---
name: backend-fix
description: 백엔드 버그를 원인 분석 → 수정 → 회귀 테스트 → 검증까지 진행한다. 커밋은 하지 않는다.
argument-hint: "<에러 메시지, 스택트레이스, 재현 방법>"
---

# 백엔드 버그 수정

대상: $ARGUMENTS

수정 범위는 `backend/**`다. 커밋은 `/git-commit`이 한다.

## Phase 1: 진단

넓은 범위를 조사해야 하면 Agent 도구(Explore)로 병렬 조사하고, 좁으면 직접 한다. Agent는 대화를 볼 수 없으므로 에러와 조사 대상을 프롬프트에 명시한다.

**원인 분석**
- 에러 메시지/스택트레이스에서 발생 위치를 특정한다
- Controller → Service → Repository → Entity 흐름을 추적한다
- `SecurityUtil.getCurrentUserId()`와 소유자 검증 로직을 확인한다
- 같은 패턴이 다른 도메인에도 있는지 확인한다

**테스트 분석**
- `backend/src/test/`에서 관련 테스트를 찾는다
- 버그를 잡을 수 있는 기존 테스트가 있는지, `MockedStatic<SecurityUtil>` 패턴이 필요한지 본다

원인이 확정되지 않았다면 추정으로 수정하지 말고 가설과 확인 방법을 보고한다.

## Phase 2: 수정

1. 확인된 원인을 고친다. 변경이 API 계약, DB 스키마, 인증 규칙을 바꾸면 **멈추고 승인**을 받는다.
2. 같은 패턴의 다른 도메인 버그가 있으면 목록으로 보여 주고 함께 고칠지 묻는다 (범위 확장은 승인 후).
3. **회귀 테스트 필수**: 버그를 재현하는 테스트를 추가한다. 메서드명은 한국어. 수정 전 실패, 수정 후 통과여야 한다.
4. 주석을 쓰지 않는다 (주석 절대 금지).

## Phase 3: 검증

```bash
cd backend && ./gradlew spotlessApply && ./gradlew spotlessCheck checkstyleMain test
```

실패하면 원인을 분석해 최대 2회 고친다. 그래도 실패하면 멈추고 보고한다.

## 결과

```text
### 원인
[근본 원인 1줄]
### 수정 내용
- [파일:라인]: [변경 사항]
### 추가된 테스트
- [클래스#메서드]
### 검증
| 명령 | 결과 |
### 상태: ✅ 완료 / ⚠️ 수동 확인 필요
다음: /git-commit (fix: type)
```
