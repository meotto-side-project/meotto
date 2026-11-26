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
| mypage-settings (`T-F40-04`, C-1, C-3) | 소프트 | approved, BE 일부 구현됨 | 가입 프로필 설정 화면이 `GET /api/members/me`(C-1), `POST /api/members/me/profile-image`(C-3)와 사진 선택 브리지(`T-F40-04`)를 같이 쓴다. `mypage-settings`가 이 Plan을 하드 선행으로 두므로 이 Plan 쪽은 소프트로만 걸고, `T-F40-04`의 선행에는 이 Plan의 Task를 두지 않는다(순환 방지) |
| design-system | 하드(문서) | 구현 대상 아님 | 색상·타이포·버튼 토큰은 `docs/specs/design-system.md` 기준으로 쓴다 |

## 결정 사항
- 닉네임의 길이·허용 문자 제한을 확정한다: 2~10자, 한글/영문/숫자/공백만 허용(이모지·특수문자 금지). `mypage-settings` Plan에서 먼저 확정한 규칙과 동일하다(`MemberErrorCode.INVALID_NICKNAME`). 사진 선택은 네이티브 앨범으로 확정한다(아래 항목).
- 공유 링크 경로 형식을 확정한다: `https://meotto.io.kr/s/{token}`. 토큰 기반 경로라 아이디(handle)를 노출하지 않는다.
- 공유 링크 토큰의 무효·만료 처리를 확정한다: **만료 없음**(TTL 없이 영구 유효), **재발급 기능 없음**(MVP 범위에 토큰 재설정 액션을 두지 않음). 회원이 탈퇴(소프트 삭제)하면 그 토큰만 자연히 무효가 된다. 토큰은 회원당 하나(get-or-create 방식으로 발급, `mypage-settings` C-6이 재사용)이며, 생성·보관 비용은 기존 MySQL 컨테이너에 문자열 한 줄을 더하는 수준이라 추가 금전적 비용이 들지 않는다.
- 가입 프로필 설정 화면(Figma 11/16, Spec 반영): 화면 라벨은 `이름`(서버 필드 `nickname`), 멋토 아이디는 C-2 제안값을 입력창에 미리 채워 보여준다(placeholder 아님, `@` 없음), 사진은 네이티브 사진 선택(앨범)이며 비율 제한은 없다, 가입 `완료` 후 홈으로 이동, 이미 가입을 마친 회원은 접근하면 홈으로 이동, 입력값 오류는 해당 입력창 아래 문구 + 빨간 계열 테두리, 서버 오류(5xx, 네트워크 실패)는 토스트.

## 기술 설계
- 인증의 중심은 `Member`다. 소셜 로그인(카카오·Apple, 네이버는 검수 대기로 보류)으로 가입과 로그인을 처리하고, 응답의 `needsProfileSetup`으로 프로필 입력 화면 진입 여부를 가른다. 신규 회원은 `C-3`으로 프로필을 완료해야 가입이 끝난다.
- **가입 이탈·재로그인 처리 확정**: `needsProfileSetup`은 "이번에 회원이 새로 생성됐는지"가 아니라 "`handle`이 아직 없는지"로 계산한다. `handle`은 가입 완료 API(`C-3`)를 통과해야만 채워지므로, 프로필 입력 중 이탈했다가 나중에 다시 로그인해도 `handle`이 null이면 그대로 `needsProfileSetup: true`가 와서 다시 프로필 화면으로 보낼 수 있다. 프로필 설정 화면의 뒤로가기는 별도 "가입 취소" API 없이 로그인 화면으로만 이동하면 된다(서버의 부분 가입 상태는 그대로 두고, 다음 로그인 때 이 필드가 다시 안내한다).
- 같은 이유로 `mypage-settings` `GET /api/members/me`(C-1) 응답에도 `profileCompleted`(`handle != null`) 필드를 추가해, 로그인 API를 다시 타지 않고 쿠키로만 앱이 재시작되는 경우에도 프로필 완료 여부를 판단할 수 있게 한다.
- 아이디(`@아이디`) 랜덤 제안은 가입 전에 호출되는 `C-2`가 담당한다. 아이디 유일성은 `C-3`에서 DB 유니크 제약과 서비스 검증으로 보장한다.
- 가입 프로필 입력 화면의 사진 선택은 `mypage-settings` `POST /api/members/me/profile-image`를 그대로 재사용한다. FE가 사진을 먼저 그 API로 업로드해 `imageUrl`을 받고, 그 값을 `C-3`의 `profileImageUrl`에 담아 보낸다. 이 엔드포인트는 로그인(인증)이 필요한데, 소셜 로그인(`C-1`) 시점에 신규 회원도 이미 토큰이 발급되므로(아래 "토큰 전달 방식 확정") 프로필 입력 화면에서도 인증된 상태로 호출할 수 있다.
- **토큰 전달 방식 확정**: `access_token`/`refresh_token` 둘 다 HttpOnly·Secure·SameSite=None 쿠키로 전달한다. 응답 본문에는 토큰 값이 들어가지 않는다 (`global/security/jwt`, `cookie` 기존 구현 그대로). `httpOnly` 쿠키는 클라이언트 JS/네이티브가 값을 직접 읽을 수 없으므로, 네이티브 보안 저장소로 토큰 "값"을 옮기는 방식은 애초에 불가능하다 — 네이티브 쪽은 웹뷰의 쿠키 저장소가 요청마다 자동으로 쿠키를 붙이는 것에 의존하게 된다. 로그인 상태를 어디에 "보관"할지(웹뷰 쿠키 vs 네이티브 보안 저장소)는 이 제약을 반영해 FE가 다시 검토해야 하는 Spec의 미해결 질문으로 남긴다.
- **가입 완료 판단(FE 사용 규칙)**: 로그인 직후에는 `C-1`의 `needsProfileSetup`, 앱이 로그인 API를 거치지 않고 쿠키로만 켜질 때는 `GET /api/members/me`(`mypage-settings` C-1)의 `profileCompleted`로 프로필 설정 화면과 홈을 가른다(`needsProfileSetup=true` 또는 `profileCompleted=false`이면 프로필 설정 화면). 프로필 설정 화면의 이름(카카오 닉네임 또는 애플 기본값)과 사진 초기값은 `/me`로 채운다. BE 구현은 완료(#103)했고 Swagger 반영 시점에 `isNewMember`를 쓰던 FE(MEO-54)를 `needsProfileSetup`으로 바꾼다.
- **프로필 설정 화면 접근 가드**: 라우트 진입 시 `GET /api/members/me`의 `profileCompleted`가 `true`이면 홈으로 이동한다.
- **오류 처리(FE)**: `INVALID_NICKNAME`(400)은 이름 입력창, `HANDLE_DUPLICATED`(409)·`INVALID_HANDLE`(400)은 아이디 입력창 아래에 문구와 빨간 테두리로 보여준다. 5xx와 네트워크 실패는 토스트로 안내하고 입력값은 유지한다. `ALREADY_SIGNED_UP`(409)은 동시 가입이나 연타로만 생기므로 가입이 이미 끝난 것으로 보고 홈으로 이동한다.
- 스플래시는 웹뷰가 뜨기 전에 보여야 하므로 네이티브(`FE-mobile`)다. 온보딩·로그인 화면은 웹(`FE-web`)이다. 공유 링크 진입(F-04)은 일반 브라우저에서도 열려야 하므로 웹이다.
- 앱 설치 여부 분기, 딥링크 처리는 네이티브 몫이다(`T-F04-03`).

## 프론트엔드 범위
- web: 온보딩 3장, 로그인 화면, 가입 프로필 입력 화면, 공유 링크 진입 라우트, 공통 API 클라이언트·인증 상태, MSW 구성(저장소 전체에서 한 번)
- mobile: 네이티브 스플래시와 시작 분기, 소셜 로그인 SDK 연동(필요 시)과 토큰 보관 브리지, 딥링크·앱스토어 분기, 프로필 사진 네이티브 선택 브리지(`mypage-settings`의 `T-F40-04`가 담당, 가입 화면도 같은 브리지를 쓴다)

## 백엔드 범위
- 도메인/패키지: `domain/member`(회원 Entity, 아이디 제안·중복 검증), `domain/auth`(소셜 로그인, 토큰 발급), `domain/sharelink`(공유 링크 해석)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `member` 테이블 | 신규: id, provider, provider_id, nickname, handle(유니크), profile_image_url, notification_enabled, board_public, sent_praise_visibility, last_active_at + BaseEntity 컬럼 | 제안. `(provider, provider_id)` 유니크. 설정 컬럼은 `mypage-settings`, `notifications`가 쓰며 기본값은 해당 Plan의 보류 질문에 걸린다. 이 Plan에서는 컬럼만 만든다 |
| `share_link` 테이블 | 신규: id, member_id, token(유니크) | 제안. 링크 경로 형식 확정(`https://meotto.io.kr/s/{token}`). 회원당 토큰 하나, TTL 없음, 재발급 없음 — 회원 탈퇴 시에만 자연히 무효 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | POST | `/api/auth/kakao` body `{ accessToken }` (카카오) / `/api/auth/apple` body `{ identityToken }` (애플) / `/api/auth/naver`(미구현, 검수 대기) | 없음 | provider별 엔드포인트로 분리 구현 (범용 `/api/auth/login/{provider}` 안은 폐기) | 200 `{ needsProfileSetup, memberId }`(`isNewMember`에서 이름·의미 변경: "`handle`이 아직 없는지" 기준). 토큰은 응답 본문에 없고 `access_token`/`refresh_token` HttpOnly 쿠키로 전달 | `INVALID_KAKAO_TOKEN`(401) / `INVALID_APPLE_TOKEN`(401) | F-03 | 확정 (구현 기준으로 Plan 반영, FE 확인 완료) |
| C-2 | GET | /api/members/handle-suggestion | 없음 | - | 200 `{ handle }` | - | F-03 | 확정 |
| C-3 | POST | /api/members/me/signup-profile | 필요 | `{ nickname, handle, profileImageUrl? }`. 닉네임은 2~10자 한글/영문/숫자/공백만 허용, 아이디는 3~30자 영문/숫자/./_(마침표 연속·시작·끝 금지) | 201 없음 | `HANDLE_DUPLICATED`(409): 아이디 중복 / `INVALID_NICKNAME`(400) / `INVALID_HANDLE`(400) / `ALREADY_SIGNED_UP`(409): 이미 `handle`이 있는 회원이 다시 호출 | F-03 | 확정 |
| C-4 | GET | /api/share-links/{token} | 없음 | - (경로의 `{token}`은 `https://meotto.io.kr/s/{token}` 링크에서 추출) | 200 `{ receiverId, receiverNickname }` | `SHARE_LINK_NOT_FOUND`(404): 토큰이 DB에 없음(존재 자체 안 함). `SHARE_LINK_INVALID`(410): 토큰은 있으나 소유 회원이 탈퇴(소프트 삭제)됨 | F-04 | 확정 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 새 필드와 경로는 모두 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 필드가 예상 형태이며 승인 대상이 아니다.
- 앱 내 로그아웃은 `mypage-settings` C-7이다.

## 웹뷰 브리지 메시지 계약
| 방향 | type | payload | 용도 | 상태 |
|---|---|---|---|---|
| 웹 → 네이티브 | `AUTH_LOGIN_SUCCESS` | `{ ... }` | 로그인 성공 알림. **주의**: 토큰이 HttpOnly 쿠키라 웹뷰 JS가 토큰 값 자체를 읽어 payload에 넣을 수 없음 — "토큰 보관 요청"이 아니라 "로그인 성공 사실"만 알리는 용도로 재검토 필요 | 보류: 로그인 상태 유지 방식 |
| 네이티브 → 웹 | `AUTH_STATE` | `{ loggedIn }` | 시작 시 로그인 상태 전달 | 보류: 로그인 상태 유지 방식 |
| 웹 → 네이티브 | `PICK_PROFILE_IMAGE` | `{ ... }` | 프로필 사진 네이티브 선택(앨범) 요청. 가입 프로필 설정 화면과 프로필 변경 시트가 같이 쓴다 | 보류: 계약 미정 |
| 네이티브 → 웹 | `PROFILE_IMAGE_PICKED` | `{ ... }` | 선택 결과 전달. 선택한 파일을 웹이 어떻게 받아 `profile-image`로 올릴지(파일 전달 방식, 네이티브 직접 업로드 여부)가 정해지지 않았다. 취소 결과도 필요 | 보류: 파일 전달 방식 |

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-2, C-3, C-4)
2. 공통 준비 `T-F01-00`, MSW 구성 `T-F01-98`(MEO-38/PR #25로 대체)
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F01-99` (BE 완료 후)
5. 보류 Task(`T-F01-01`, `T-F03-05`, `T-F03-07`, `T-F04-03`)는 질문 해소 후 `/plan-feature auth-onboarding`(갱신)으로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: `MemberService`(아이디 제안·중복), `AuthService`(소셜 토큰 검증은 외부 호출을 목킹) 서비스 단위 테스트
- FE: 컴포넌트 테스트와 E2E 도구가 미설치라 **자동 검증은 미검증**으로 보고한다. 설치 후 F-02 AC(마지막 장에서만 `멋토 시작하기`), F-03 AC(로그인 성공 시 홈 이동)를 스토리 play 함수와 E2E로 덮는다
- 사람이 확인할 AC: 실제 소셜 제공자 연동, 앱 설치 여부 분기, 딥링크(실기기)

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F01-00 | 웹 공통 준비: API 클라이언트, `{name,message}` 에러 파서, 인증 쿼리 키·엔드포인트 상수, auth Zod 스키마 | FE-web | F-01~F-04 | frontend/apps/web/src/lib/**, frontend/apps/web/src/components/features/auth/constants/**, frontend/apps/web/src/components/features/auth/schemas/** | 계약 C-2 확정 | cd frontend && pnpm lint && pnpm check-types | MEO-44 |
| T-F01-01 | 네이티브 스플래시와 시작 분기(온보딩 또는 홈) | FE-mobile | F-01 | frontend/apps/mobile/src/** | 보류: 로그인 상태 유지 방식, 스플래시 분기 조건 | 수동 확인: 시뮬레이터. cd frontend && pnpm lint && pnpm check-types | MEO-45 |
| T-F01-98 | MSW 구성: 별도 구현 없음. `msw` 설치와 `NEXT_PUBLIC_API_MOCKING` 구성은 MEO-38(PR #25)에서 한다 | FE-web | - | - | T-F01-00 | MEO-38 머지로 대체. 인증 API 핸들러(`handlers/auth.ts`)는 각 FE Task가 계약 표 기준으로 만든다 | MEO-38 (연결) |
| T-F02-01 | 온보딩 3장 슬라이드(인디케이터, 카피, 마지막 장 `멋토 시작하기`) | FE-web | F-02 AC1 | frontend/apps/web/src/app/onboarding/**, frontend/apps/web/src/components/features/onboarding/** | T-F01-00 | cd frontend && pnpm lint && pnpm check-types. AC는 수동 확인(스토리 도구 미설치) | MEO-50 |
| T-F03-01 | `Member` Entity·Repository·마이그레이션 (스키마 승인 필요) | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | 데이터 모델 승인 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-46 |
| T-F03-02 | 소셜 로그인 API(카카오·Apple)와 토큰 발급 | BE | F-03 AC2 | backend/src/main/java/com/meotto/api/domain/auth/**, backend/src/main/java/com/meotto/api/global/security/** | T-F03-01 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-26 (연결, 완료) |
| T-F03-03 | 아이디 랜덤 제안 API(C-2) | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | T-F03-01, 계약 C-2 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-51 |
| T-F03-04 | 가입 프로필 완료 API(C-3) 아이디 유일성 검증 | BE | F-03 | backend/src/main/java/com/meotto/api/domain/member/** | T-F03-01, 계약 C-3 확정 — 구현 완료 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-52 |
| T-F03-05 | 로그인 화면(3개 소셜 버튼)과 로그인 성공 후 홈 이동 | FE-web | F-03 AC2 | frontend/apps/web/src/app/login/**, frontend/apps/web/src/components/features/auth/** | T-F01-98, 보류: 로그인 상태 유지 방식 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-54 |
| T-F03-06 | 신규 가입 프로필 설정 화면(이름, 미리 채운 멋토 아이디, 사진 선택), 입력창 오류 표시, 서버 오류 토스트, 가입 완료 회원 접근 가드. 뒤로가기는 로그인 화면으로만 이동(별도 취소 API 없음) | FE-web | F-03 | frontend/apps/web/src/app/signup/**, frontend/apps/web/src/components/features/auth/** | T-F01-98, T-F03-05, 계약 C-3 확정. 사진 선택 부분은 `mypage-settings`의 `T-F40-04`(소프트, 브리지 계약 보류)에 걸리며 그 전에는 사진 UI를 목으로 둔다 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-57 |
| T-F03-07 | 소셜 SDK 연동과 토큰 보관 브리지 | FE-mobile | F-03 | frontend/apps/mobile/src/** | 보류: 로그인 상태 유지 방식 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | MEO-47 |
| T-F04-01 | 공유 링크 해석 API(C-4)와 `ShareLink` Entity | BE | F-04 AC3 | backend/src/main/java/com/meotto/api/domain/sharelink/** | T-F03-01, 계약 C-4 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | MEO-53 |
| T-F04-02 | 공유 링크 진입 라우트에서 토마토 보내기(F-24)로 이동 | FE-web | F-04 AC3 | frontend/apps/web/src/app/(public)/** | T-F01-98, 링크 경로 형식 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | MEO-55 |
| T-F04-03 | 딥링크 수신과 앱 설치 여부 분기(앱 로그인 또는 앱스토어) | FE-mobile | F-04, home F-16 | frontend/apps/mobile/src/** | 링크 경로 형식 확정 / 보류: 앱 설치 감지 방식 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | MEO-48 |
| T-F01-99 | 실서버 연동 확인(목 끄고 C-2 및 확정된 계약 확인) | FE-web | F-02~F-04 | - | T-F03-02, T-F03-03, T-F04-01 | 수동 확인: `NEXT_PUBLIC_API_MOCKING` 끄고 로그인·프로필 흐름. 목으로만 본 AC는 "실서버 연동 미검증" | MEO-56 |

AC 연결: F-02 AC1 → T-F02-01. F-03 AC2 → T-F03-02, T-F03-05. F-04 AC3 → T-F04-01, T-F04-02. 연결되지 않은 AC 없음. F-01에는 AC가 없다(분기 조건이 보류라 AC 작성 불가).

## 보류 질문
- 로그인 상태 유지 방식과 토큰 보관 위치 (Spec Open Questions 1)
- 스플래시 이후 분기 조건(로그인·온보딩 본 여부)
- 프로필을 마치지 않은 회원이 프로필 설정 관련 API(`me`, `handle-suggestion`, `profile-image`, `signup-profile`, `logout`) 외의 API를 부를 때의 처리(BE가 아직 언급하지 않음, 막지 않으면 FE 가드만으로는 우회 가능)
- 사진 파일 전달 방식: 네이티브가 고른 사진을 웹이 받아 올릴지 네이티브가 직접 올릴지(위 브리지 표 `PICK_PROFILE_IMAGE` 계약)
- 오류 문구 원문과 토스트 문구·노출 시간(Figma에 없음, 디자이너 확인)
- 닉네임 길이/허용 문자, 아이디(handle) 규칙(3~30자, 영문(대소문자)/숫자/마침표(`.`)/언더스코어(`_`), 마침표 연속·시작·끝 금지, DB는 `utf8mb4_unicode_ci`로 대소문자 구분 없이 유일성 검사)은 모두 확정됨
- 소셜 로그인 팝업 자체의 취소 처리, 소셜 계정 통합(카카오·Apple 등으로 가입한 계정을 하나로 합칠지) 여부. 가입 프로필 입력 중 이탈 후 재로그인했을 때의 처리와 뒤로가기 정책은 확정됨 — "결정 사항" 참고
- 앱 설치 감지 방식. 공유 링크 경로 형식과 토큰 무효·만료 처리(만료 없음, 재발급 없음, 탈퇴 시에만 무효)는 확정됨 — "결정 사항" 참고
- 비회원 보내는 사람 이름 설정 여부 (Spec Open Questions 2)
