---
name: code-review
description: 변경된 프론트엔드/백엔드 코드를 프로젝트 규칙, 보안, 아키텍처, Spec 일치 기준으로 리뷰한다. 변경 경로에 따라 FE/BE 체크리스트를 선택한다. 수정은 하지 않고 제안만 한다.
argument-hint: "[범위: 파일/디렉터리/브랜치 기준, 기본은 현재 변경분]"
---

# 코드 리뷰 (읽기 전용)

대상: $ARGUMENTS (없으면 `git diff`와 `git diff main...HEAD`의 변경분)

수정하지 않고 지적만 한다 (요청 시 수정). 지적마다 `파일:라인`과 근거 규칙을 함께 쓴다. 근거 없는 지적은 하지 않는다.

## 1. 범위 결정

변경 파일 경로로 체크리스트를 고른다. `backend/**`면 BE, `frontend/**`면 FE, 둘 다면 둘 다 적용한다. `docs/specs/**`가 바뀌었으면 5번(스펙 일치)을 중심으로 본다.

## 2. 공통

- ❌ 비밀값(`.env`, 키, 토큰)이 포함되어 있다 → ✅ 제거
- ❌ 이 변경과 무관한 파일 수정, 불필요한 대규모 포맷 변경 → ✅ 분리
- ❌ Plan(`docs/plans/`)에 없는 API 필드/경로 변경 → ✅ 계약 변경 승인 확인

## 3. 백엔드 (`.claude/rules/backend.md`, `backend/CLAUDE.md` 기준)

### DDD 레이어
- [ ] Controller가 Service·DTO 외에 domain/infrastructure를 직접 import하지 않음
- [ ] Service가 Controller 레이어 클래스를 import하지 않음
- [ ] 도메인 모델(record)에 Spring 어노테이션 없음
- [ ] 외부 서비스(FCM, S3)를 Controller에서 직접 호출하지 않음
- [ ] 크로스 도메인 접근은 타 도메인 Service 경유

### Java 관용
- [ ] DTO·도메인 모델은 `record` (Bean Validation 필요 시 class 허용)
- [ ] `Optional` 체이닝 (`map`, `orElseThrow`)
- [ ] Lombok은 필요한 것만
- [ ] Response에 `static XxxResponse from(Xxx model)` 팩토리

### 보안
- [ ] 현재 사용자는 `SecurityUtil.getCurrentUserId()` (요청 파라미터 수신 금지)
- [ ] 리소스 뮤테이션 전 소유자 검증
- [ ] `SecurityConfig`에 새 엔드포인트의 인증 규칙 등록
- [ ] JWT 시크릿은 `JwtProperties`에서만, FCM 토큰 비노출, PII 로깅 없음

### 품질
- [ ] **주석 없음** (인라인, 블록, Javadoc)
- [ ] 미사용 import 없음
- [ ] 읽기 메서드에 `@Transactional(readOnly = true)`
- [ ] 비-200 응답에 `@ResponseStatus`
- [ ] 도메인 에러는 `BusinessException(ErrorCode)`, Controller에 ad-hoc try/catch 없음
- [ ] Entity FK는 `Long` ID 필드만
- [ ] 소프트 딜리트 조회에 `AndDeletedAtIsNull`
- [ ] N+1 없음 (루프 안 단건 조회 → `findAllByIdIn()`)
- [ ] 네이밍: `*Controller` `*Service` `*Repository` `*Entity` `*ErrorCode` `*Scheduler`, DTO는 `*Request` `*Response`

## 4. 프론트엔드 (`.claude/rules/frontend.md` 공통 + `frontend-web.md` 또는 `frontend-mobile.md` 기준)

변경 경로가 `apps/web`이면 웹, `apps/mobile`이면 모바일 항목을 추가로 본다.

### 공통 추가 점검
- ❌ 코드가 하는 일을 반복하는 주석, 주석 처리된 코드 (이유를 설명하는 주석은 허용)

### 웹 추가 점검
- ❌ 공유 콘텐츠 페이지에 `generateMetadata`(title, description, openGraph, twitter, canonical)가 없다
- ❌ 공유 페이지가 클라이언트에서만 데이터를 불러와 렌더링한다 (서버 렌더링 필요)
- ❌ 비공개·무효 토큰 케이스에서 이름, 도장 수 같은 개인 정보가 메타·OG에 들어간다 / `noindex`가 없다 / 없는 대상에 200을 응답한다

### 모바일 추가 점검
- ❌ 라우트(`src/app/`) 안에 컴포넌트·로직이 있다 → ✅ 밖으로 분리
- ❌ `StyleSheet`에 토큰이 아닌 임의 색·간격 값을 쓴다
- ❌ 눌리는 요소에 `accessibilityRole`/`accessibilityLabel`이 없거나 터치 영역이 44pt 미만이다
- ❌ 화면에서 `fetch`를 직접 호출한다 → ✅ `src/lib/api` 래퍼 + 쿼리 훅
- ❌ 토큰 같은 민감값을 `AsyncStorage`에 저장한다 → ✅ `expo-secure-store`

### 규칙 위반
- ❌ `any` 타입 → ✅ 구체 타입
- ❌ `console.log` 잔존 → ✅ 제거
- ❌ `src/**`의 `.js`/`.jsx`/`.mts` → ✅ `.ts`/`.tsx`
- ❌ 배럴(`index.ts`) import → ✅ 직접 경로
- ❌ import 방향 위반 (`ui`→`features`, feature 간 직접 import, `lib`→컴포넌트)
- ❌ 임의 색상·간격 값 → ✅ 디자인 토큰

### 데이터 패턴
- ❌ `axios` 직접 호출 → ✅ `get/post/patch/del` 래퍼
- ❌ 응답 Zod 검증(`responseSchema`) 없음 → ✅ 스키마 검증
- ❌ 쿼리 키·엔드포인트 하드코딩 → ✅ `constants/`
- ❌ 타입이 Plan의 API 계약과 다름 → ✅ 계약 일치

### UI 품질
- ❌ (웹) `ComponentProps` 확장 없이 네이티브 props 중복 정의
- ❌ (웹) `cn()` 없이 클래스 문자열 이어 붙이기
- ❌ 인터랙티브 요소에 라벨/접근성 속성, 시맨틱 태그 없음
- ❌ 불필요한 순차 `await`(워터폴), 인라인 객체 prop·effect 남용으로 인한 리렌더

## 5. Spec 일치

- 브랜치명, 커밋, Plan에서 F-ID를 찾아 `docs/specs/`의 해당 AC와 변경을 대조한다.
- ❌ 사용자에게 보이는 동작(흐름, 문구, 예외)이 바뀌었는데 Spec이 갱신되지 않았다 → 사람에게 알린다 (Spec은 AI가 고치지 않는다)
- ⚠️ Spec의 규칙·예외와 다르게 동작한다 → "스펙과 다른 변경"으로 보고 (의도 여부는 사람이 판단)
- F-ID를 찾지 못하면 "Spec 매핑 불가"로 표기한다.

## 결과 형식

```text
## 반드시 수정 (규칙 위반, 보안, 버그)
| 파일:라인 | 문제 | 근거 규칙 | 수정 제안 |

## 권장
| 파일:라인 | 문제 | 수정 제안 |

## 스펙 확인
| F-ID | 구분 | 내용 |

## 검토하지 못한 것
- (실행하지 않은 테스트, 읽지 못한 범위)

## 판정: ✅ 통과 / ⚠️ 권장 반영 / ❌ 수정 필수
총 N개: 반드시 수정 N, 권장 N
```

이슈가 없으면 "리뷰 완료 — 이슈 없음"과 함께 검토한 범위를 적는다.
