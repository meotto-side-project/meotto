---
paths:
  - "backend/**"
---

# 백엔드 규칙

패키지 구조, 핵심 코드 패턴(Entity, Service, Controller, ErrorCode), API 응답 표준은 `backend/CLAUDE.md`가 기준이다. 여기에는 반드시 지킬 불변 조건만 둔다.

## 코드

- **주석 절대 금지**: 인라인, 블록, Javadoc 모두. 코드로 의도를 드러낸다.
- 미사용 import 금지.
- DDD 레이어 경계를 지킨다: Controller는 Service와 DTO에만 의존, Service는 Controller 클래스를 import하지 않음, 도메인 모델(record)에는 Spring 어노테이션 금지.
- FK는 `Long` ID 필드만 쓰고 JPA 연관관계 매핑은 쓰지 않는다.
- 비즈니스 오류는 `BusinessException(XxxErrorCode)`로만 던진다. Controller에 try/catch를 두지 않는다.

## 보안 불변 조건

- 현재 사용자는 `SecurityUtil.getCurrentUserId()`로만 얻는다. 요청 파라미터로 userId를 받지 않는다.
- 리소스를 변경하기 전에 소유자를 검증한다.
- 새 엔드포인트는 `SecurityConfig`에 인증 규칙을 명시한다 (현재 `/admin/**` 외 전부 허용 상태).
- JWT 시크릿은 `JwtProperties`에서만 참조한다. PII를 로깅하지 않는다.
- FCM 토큰을 응답에 노출하지 않는다.

## 테스트와 검증

- 서비스 테스트는 `@ExtendWith(MockitoExtension.class)`, 파일명 `XxxServiceTest`, 메서드명은 한국어 (`findById_다른_유저면_403_예외`).
- 코드 변경 후 `backend/`에서 `./gradlew spotlessCheck checkstyleMain test`가 통과해야 한다 (CI와 동일).
- 포맷 위반은 `./gradlew spotlessApply`로 고친다.

## 승인이 필요한 변경

DB 스키마(Entity 컬럼, 테이블), 삭제성 쿼리, 인증 규칙 변경은 `.claude/rules/database.md`와 `CLAUDE.md`의 안전 규칙에 따라 사전 승인을 받는다.
