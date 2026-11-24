# Plan: 스플래시 · 온보딩 · 인증

- Spec: docs/specs/auth-onboarding.md
- F-ID: F-01 ~ F-04
- 상태: approved
- 선행 Plan: (없음) 소프트 가정: `send-stamp`(F-24), `home`(F-10~F-12, F-16)
- Linear 상위 이슈: FE MEO-43, BE MEO-26 (기존 이슈 재사용)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| send-stamp (F-24) | 소프트 | 미작성(순서상 이후) | 공유 링크 진입 후 이동할 토마토 보내기 라우트가 있다. 라우트 경로는 `send-stamp` Plan이 정한다. 선행 방향은 `send-stamp`의 `T-F24-02`가 `T-F04-02`를 선행으로 두는 한쪽뿐이다(순환 방지). `T-F04-02`는 이동할 경로를 가정으로 두고 먼저 만든다 |
| home (F-10~F-12) | 소프트 | 미작성(순서상 이후) | 로그인 성공 후 이동할 회원 홈 라우트(`/`)가 있다 |
| design-system | 하드(문서) | 구현 대상 아님 | 색상·타이포·버튼 토큰은 `docs/specs/design-system.md` 기준으로 쓴다 |

## 결정 사항
- 로그인 상태 유지: 토큰은 HttpOnly 쿠키가 맡고, 네이티브는 로그인 성공 시 웹이 보낸 `AUTH_LOGIN_SUCCESS`로 로그인 플래그만 저장한다. 앱은 시작할 때 이 플래그로 분기하고 `AUTH_STATE`로 웹에 전달한다.

## 기술 설계
- 인증의 중심은 `Member`다. 소셜 로그인(카카오·Apple, 네이버는 검수 대기로 보류)으로 가입과 로그인을 처리하고, 응답의 `isNewMember`로 프로필 입력 화면 진입 여부를 가른다. 신규 회원은 `C-3`으로 프로필을 완료해야 가입이 끝난다.
- 아이디(`@아이디`) 랜덤 제안은 가입 전에 호출되는 `C-2`가 담당한다. 아이디 유일성은 `C-3`에서 DB 유니크 제약과 서비스 검증으로 보장한다.
- **토큰 전달 방식 확정**: `access_token`/`refresh_token` 둘 다 HttpOnly·Secure·SameSite=None 쿠키로 전달한다. 응답 본문에는 토큰 값이 들어가지 않는다 (`global/security/jwt`, `cookie` 기존 구현 그대로). `httpOnly` 쿠키는 클라이언트 JS/네이티브가 값을 직접 읽을 수 없으므로, 네이티브 보안 저장소로 토큰 "값"을 옮기는 방식은 애초에 불가능하다 — 네이티브 쪽은 웹뷰의 쿠키 저장소가 요청마다 자동으로 쿠키를 붙이는 것에 의존하게 된다. 따라서 네이티브는 토큰이 아니라 로그인 플래그만 보관한다(위 "결정 사항").
- 스플래시는 웹뷰가 뜨기 전에 보여야 하므로 네이티브(`FE-mobile`)다. 온보딩·로그인 화면은 웹(`FE-web`)이다. 공유 링크 진입(F-04)은 일반 브라우저에서도 열려야 하므로 웹이다.
- 앱 설치 여부 분기, 딥링크 처리는 네이티브 몫이다(`T-F04-03`).

## 프론트엔드 범위
- web: 온보딩 3장, 로그인 화면, 가입 프로필 입력 화면, 공유 링크 진입 라우트, 공통 API 클라이언트·인증 상태, MSW 구성(저장소 전체에서 한 번)
- mobile: 네이티브 스플래시와 시작 분기, 소셜 로그인 SDK 연동(필요 시)과 토큰 보관 브리지, 딥링크·앱스토어 분기

## 백엔드 범위
- 도메인/패키지: `domain/member`(회원 Entity, 아이디 제안·중복 검증), `domain/auth`(소셜 로그인, 토큰 발급), `domain/sharelink`(공유 링크 해석)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `member` 테이블 | 신규: id, provider, provider_id, nickname, handle(유니크), profile_image_url, notification_enabled, board_public, sent_praise_visibility, last_active_at + BaseEntity 컬럼 | 제안. `(provider, provider_id)` 유니크. 설정 컬럼은 `mypage-settings`, `notifications`가 쓰며 기본값은 해당 Plan의 보류 질문에 걸린다. 이 Plan에서는 컬럼만 만든다 |
| `share_link` 테이블 | 신규: id, member_id, token(유니크) | 제안. 링크 형식이 보류라 `T-F04-01` 승인 시 확정 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | POST | `/api/auth/kakao` body `{ accessToken }` (카카오) / `/api/auth/apple` body `{ identityToken }` (애플) | 없음 | provider별 엔드포인트로 분리 구현 (범용 `/api/auth/login/{provider}` 안은 폐기). 네이버는 검수 대기라 보류 | 200 `{ isNewMember, memberId }`. 토큰은 응답 본문에 없고 `access_token`/`refresh_token` HttpOnly 쿠키로 전달 | `INVALID_KAKAO_TOKEN`(401) / `INVALID_APPLE_TOKEN`(401) | F-03 | 확정 (구현 기준으로 Plan 반영, FE 확인 완료) |
| C-2 | GET | /api/members/handle-suggestion | 없음 | - | 200 `{ handle }` | - | F-03 | 확정 |
| C-3 | POST | /api/members/me/signup-profile | 필요 | `{ nickname, handle, profileImageUrl? }` | 201 없음 | `HANDLE_DUPLICATED`(409), `INVALID_NICKNAME`(400), `INVALID_HANDLE`(400), `ALREADY_SIGNED_UP`(409) | F-03 | 보류: 닉네임 길이/허용 문자, 가입 실패·취소 흐름. 아이디(handle) 규칙은 확정(3~30자, 영문/숫자/./_, 마침표 연속·시작·끝 금지) |
| C-4 | GET | /api/share-links/{token} | 없음 | - | 200 `{ receiverId, receiverNickname }` | `SHARE_LINK_NOT_FOUND`(404), `SHARE_LINK_INVALID`(410) | F-04 | 보류: 공유 링크 형식·무효 처리 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 새 필드와 경로는 모두 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 필드가 예상 형태이며 승인 대상이 아니다.
- 앱 내 로그아웃은 `mypage-settings` C-7이다.

## 웹뷰 브리지 메시지 계약
| 방향 | type | payload | 용도 | 상태 |
|---|---|---|---|---|
| 웹 → 네이티브 | `AUTH_LOGIN_SUCCESS` | 없음 (`{ type }`만) | 로그인 성공 알림. 네이티브가 "로그인했음" 플래그를 저장한다. 토큰은 HttpOnly 쿠키라 payload에 없음 | 확정 |
| 네이티브 → 웹 | `AUTH_STATE` | `{ loggedIn }` | 시작 시 네이티브 플래그 기준 로그인 상태 전달 | 확정. 쿠키가 만료됐는데 플래그가 남는 경우(웹이 401을 받으면 플래그를 지우는 보정)는 별도 확인 필요 |

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-2)
2. 공통 준비 `T-F01-00`, MSW 구성 `T-F01-98`(MEO-38/PR #25로 대체)
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F01-99` (BE 완료 후)
5. 보류 Task(`T-F01-01`, `T-F03-02`, `T-F03-04`~`T-F03-07`, `T-F04-01`~`T-F04-03`)는 질문 해소 후 `/plan-feature auth-onboarding`(갱신)으로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: `MemberService`(아이디 제안·중복), `AuthService`(소셜 토큰 검증은 외부 호출을 목킹) 서비스 단위 테스트
- FE: 컴포넌트 테스트와 E2E 도구가 미설치라 **자동 검증은 미검증**으로 보고한다. 설치 후 F-02 AC(마지막 장에서만 `멋토 시작하기`), F-03 AC(로그인 성공 시 홈 이동)를 스토리 play 함수와 E2E로 덮는다
- 사람이 확인할 AC: 실제 소셜 제공자 연동, 앱 설치 여부 분기, 딥링크(실기기)

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F01-00 | 웹 공통 준비: API 클라이언트, `{name,message}` 에러 파서, 인증 쿼리 키·엔드포인트 상수, auth Zod 스키마 | FE-web | F-01~F-04 | frontend/apps/web/src/lib/**, frontend/apps/web/src/components/features/auth/constants/**, frontend/apps/web/src/components/features/auth/schemas/** | 계약 C-2 확정 | cd frontend && pnpm lint && pnpm check-types | MEO-44 |
| T-F01-01 | 네이티브 스플래시와 시작 분기(온보딩 또는 홈) | FE-mobile | F-01 | frontend/apps/mobile/src/** | 보류: 스플래시 분기 조건 | 수동 확인: 시뮬레이터. cd frontend && pnpm lint && pnpm check-types | MEO-45 |
| T-F01-98 | MSW 구성: 별도 구현 없음. `msw` 설치와 `NEXT_PUBLIC_API_MOCKING` 구성은 MEO-38(PR #25)에서 한다 | FE-web | - | - | T-F01-00 | MEO-38 머지로 대체. 인증 API 핸들러(`handlers/auth.ts`)는 각 FE Task가 계약 표 기준으로 만든다 | MEO-38 (연결) |
| T-F02-01 | 온보딩 3장 슬라이드(인디케이터, 카피, 마지막 장 `멋토 시작하기`) | FE-web | F-02 AC1 | frontend/apps/web/src/app/onboarding/**, frontend/apps/web/src/components/features/onboarding/** | T-F01-00 | cd frontend && pnpm lint && pnpm check-types. AC는 수동 확인(스토리 도구 미설치) | MEO-50 |
| T-F03-01 | `Member` Entity·Repository·마이그레이션 (스키마 승인 필요) | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | 데이터 모델 승인 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-46 |
| T-F03-02 | 소셜 로그인 API(카카오·Apple)와 토큰 발급 | BE | F-03 AC2 | backend/src/main/java/com/meotto/api/domain/auth/**, backend/src/main/java/com/meotto/api/global/security/** | T-F03-01 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-26 (연결, 완료) |
| T-F03-03 | 아이디 랜덤 제안 API(C-2) | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | T-F03-01, 계약 C-2 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-51 |
| T-F03-04 | 가입 프로필 완료 API(C-3) 아이디 유일성 검증 | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | T-F03-01, 보류: 닉네임 길이/허용 문자 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-52 |
| T-F03-05 | 로그인 화면(3개 소셜 버튼)과 로그인 성공 후 홈 이동 | FE-web | F-03 AC2 | frontend/apps/web/src/app/login/**, frontend/apps/web/src/components/features/auth/**, frontend/apps/web/src/lib/bridge/** | T-F01-98 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-54 |
| T-F03-06 | 신규 가입 프로필 입력 화면(닉네임, 아이디 placeholder, 사진 선택) | FE-web | F-03 | frontend/apps/web/src/app/signup/**, frontend/apps/web/src/components/features/auth/** | T-F01-98, T-F03-05, 보류: 닉네임 제한, 가입 실패 흐름 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-57 |
| T-F03-07 | 소셜 SDK 연동과 토큰 보관 브리지 | FE-mobile | F-03 | frontend/apps/mobile/src/** | 보류: 소셜 토큰 요청 브리지 계약 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | MEO-47 |
| T-F04-01 | 공유 링크 해석 API(C-4)와 `ShareLink` Entity | BE | F-04 AC3 | backend/src/main/java/com/meotto/api/domain/sharelink/** | T-F03-01, 보류: 공유 링크 형식·무효 처리 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-53 |
| T-F04-02 | 공유 링크 진입 라우트에서 토마토 보내기(F-24)로 이동 | FE-web | F-04 AC3 | frontend/apps/web/src/app/(public)/** | T-F01-98, 보류: 공유 링크 형식 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-55 |
| T-F04-03 | 딥링크 수신과 앱 설치 여부 분기(앱 로그인 또는 앱스토어) | FE-mobile | F-04, home F-16 | frontend/apps/mobile/src/** | 보류: 공유 링크 형식, 앱 설치 감지 방식 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | MEO-48 |
| T-F01-99 | 실서버 연동 확인(목 끄고 C-2 및 확정된 계약 확인) | FE-web | F-02~F-04 | - | T-F03-02, T-F03-03, T-F04-01 | 수동 확인: `NEXT_PUBLIC_API_MOCKING` 끄고 로그인·프로필 흐름. 목으로만 본 AC는 "실서버 연동 미검증" | MEO-56 |

AC 연결: F-02 AC1 → T-F02-01. F-03 AC2 → T-F03-02, T-F03-05. F-04 AC3 → T-F04-01, T-F04-02. 연결되지 않은 AC 없음. F-01에는 AC가 없다(분기 조건이 보류라 AC 작성 불가).

## 보류 질문
- 스플래시 이후 분기 조건(로그인·온보딩 본 여부)
- 닉네임 길이와 허용 문자, 사진 업로드 방식 (`mypage-settings`와 공유). 아이디(handle) 규칙은 확정됨: 3~30자, 영문(대소문자)/숫자/마침표(`.`)/언더스코어(`_`), 마침표 연속·시작·끝 금지 (인스타그램 아이디 형식 참고, DB는 `utf8mb4_unicode_ci`로 대소문자 구분 없이 유일성 검사)
- 로그인 취소·실패·소셜 계정 통합 여부
- 공유 링크 형식, 무효·만료 처리, 앱 설치 감지 방식
- 비회원 보내는 사람 이름 설정 여부 (Spec Open Questions 2)
