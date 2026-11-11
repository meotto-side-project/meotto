# Plan: 마이페이지 · 서비스 설정

- Spec: docs/specs/mypage-settings.md
- F-ID: F-40 ~ F-45
- 상태: draft
- 선행 Plan: `auth-onboarding`(F-03) 하드
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| auth-onboarding (F-03) | 하드 | draft | `Member` Entity와 `member` 테이블(닉네임, 아이디, 사진, 설정 컬럼)이 있고, 로그인된 사용자를 `SecurityUtil.getCurrentUserId()`로 얻는다. 웹 공통 준비 `T-F01-00`, MSW `T-F01-98`이 있다 |
| auth-onboarding (F-04) | 소프트 | draft | 공유 링크 해석 계약 `auth-onboarding` C-4와 `share_link` 테이블을 F-41이 재사용한다 |
| my-board (F-30) | 소프트 | 미작성(순서상 이후) | 계정관리 바텀시트는 My 메인 우측 상단 `⋯`에서 열린다. 이 Plan은 시트와 내용만 만든다 |
| stamp·friend 도메인 | 소프트 | 미작성(순서상 이후) | F-43 노출 판정과 F-45 탈퇴 데이터 처리는 도장·친구 데이터에 걸리므로 해당 Task는 보류다 |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.

## 기술 설계
- 프로필·설정은 `Member` 한 Entity의 컬럼이다. 설정 변경은 `PATCH`로 일부 필드만 보낸다.
- 아이디 변경은 Spec이 정하지 않았으므로 **가입 후 변경 불가**를 전제로 프로필 변경 시트에서 아이디 항목을 두지 않는다(Spec의 시트 구성과 같다).
- `보낸 칭찬 공개`(F-43) 설정 저장은 확정이지만, **누구에게 어떻게 적용되는지**(이름표·내용 마스킹)는 보류다. 마스킹 판정은 홈·칭찬판 API가 공통으로 쓰는 BE 서비스 하나(`T-F43-02`)로 둔다.
- 프로필 사진 업로드는 기존 `FileStorageService`(S3)를 쓰는 방식이 자연스러우나 방식·제한이 보류다.
- 로그아웃·회원탈퇴 시 푸시 토큰 해제는 `notifications`의 C-2를 호출한다.

## 프론트엔드 범위
- web: 계정관리 바텀시트, 프로필 변경 시트, 칭찬판 공유(QR·링크 복사·SNS), 서비스 설정(토글 2, 세그먼트 1), 로그아웃, 회원탈퇴 팝업 2종
- mobile: 사진 선택(앨범·카메라) 권한과 공유 시트 브리지(필요 시, 보류)

## 백엔드 범위
- 도메인/패키지: `domain/member`(프로필·설정), `domain/sharelink`(링크 발급), `domain/auth`(로그아웃)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `member` | `auth-onboarding`에서 만든 컬럼을 사용 (추가 컬럼 없음) | 설정 기본값: `board_public` 기본 On, `sent_praise_visibility` 기본 ALL(Spec F-43), `notification_enabled` 기본값은 `notifications` 보류 |
| 탈퇴 시 도장·친구 처리 | 삭제 vs 익명화 vs 소프트 삭제 | **보류**. 삭제성 쿼리는 확정 후 별도 승인 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | GET | /api/members/me | 필요 | - | 200 `{ id, nickname, handle, profileImageUrl, notificationEnabled, boardPublic, sentPraiseVisibility }` | - | F-40, F-42, F-43 | 확정 |
| C-2 | PATCH | /api/members/me/profile | 필요 | `{ nickname?, profileImageUrl? }` | 204 | `INVALID_NICKNAME`(400) | F-40 | 보류: 닉네임 길이/허용 문자, 프로필 사진 제한 |
| C-3 | POST | /api/members/me/profile-image | 필요 | 이미지 업로드 요청(방식 미정) | 200 `{ imageUrl }` | `INVALID_IMAGE`(400) | F-40 | 보류: 사진 업로드 방식·제한 |
| C-4 | PATCH | /api/members/me/settings | 필요 | `{ notificationEnabled?, boardPublic? }` | 204 | - | F-42 | 확정 |
| C-5 | PATCH | /api/members/me/settings/sent-praise-visibility | 필요 | `{ visibility: ALL \| NAME_ONLY \| PRIVATE }` | 204 | `INVALID_VISIBILITY`(400) | F-43 | 확정 |
| C-6 | GET | /api/members/me/share-link | 필요 | - | 200 `{ url }` (QR은 FE가 `url`로 생성) | - | F-41 | 보류: 공유 링크 형식·도메인 (`auth-onboarding` C-4와 같은 토큰 사용) |
| C-7 | POST | /api/auth/logout | 필요 | - | 204 | - | F-44 | 보류: 로그인 상태 유지 방식(토큰 무효화 방식) |
| C-8 | DELETE | /api/members/me | 필요 | - | 204 | - | F-45 | 보류: 탈퇴 시 도장 데이터 처리 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-4, C-5)
2. 공통 준비 `T-F40-00`
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F40-99`
5. 보류 Task는 질문 해소 후 `/plan-feature mypage-settings`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: `MemberProfileService`, `MemberSettingsService` 단위 테스트. F-42·F-43 우선순위 조합(F-42 Off가 F-43보다 우선)은 마스킹 서비스(`T-F43-02`)에서 조합 테스트로 덮는다
- FE: 컴포넌트·E2E 도구 미설치로 자동 검증은 미검증. 탈퇴 팝업 흐름, 세그먼트 단일 선택은 도구 설치 후 스토리 play 함수로 덮는다
- 사람이 확인할 AC: 프로필 사진 업로드, 공유 시트·클립보드

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F40-00 | 웹 공통 준비: member·settings 쿼리 키·엔드포인트 상수, Zod 스키마, 계정관리 바텀시트 틀 | FE-web | F-40~F-45 | frontend/apps/web/src/components/features/account/** | T-F01-00, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types | |
| T-F40-01 | 내 정보 조회 API(C-1) | BE | F-40 | backend/src/main/java/com/meotto/api/domain/member/** | T-F03-01(auth-onboarding), 계약 C-1 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F40-02 | 프로필 변경 API(C-2)와 사진 업로드(C-3) | BE | F-40 AC4 | backend/src/main/java/com/meotto/api/domain/member/**, backend/src/main/java/com/meotto/api/global/infrastructure/file/** | T-F40-01, 보류: 닉네임 제한, 사진 방식·제한 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F40-03 | 내 프로필 영역과 프로필 변경 시트 | FE-web | F-40 AC4 | frontend/apps/web/src/components/features/account/** | T-F40-00, T-F01-98, 보류: 닉네임 제한, 사진 방식·제한 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F40-04 | 사진 선택 권한·브리지 | FE-mobile | F-40 | frontend/apps/mobile/src/** | 보류: 사진 업로드 방식(웹 입력으로 충분한지 포함) | 수동 확인: 실기기 | |
| T-F41-01 | 공유 링크 발급 API(C-6) | BE | F-41 | backend/src/main/java/com/meotto/api/domain/sharelink/** | T-F04-01(auth-onboarding), 보류: 공유 링크 형식 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F41-02 | 칭찬판 공유 영역(QR, 링크 복사, SNS 아이콘) | FE-web | F-41 | frontend/apps/web/src/components/features/account/share/** | T-F40-00, T-F01-98, 보류: 공유 링크 형식, SNS 아이콘 구성 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F42-01 | 설정 저장 API(C-4) | BE | F-42 AC1 | backend/src/main/java/com/meotto/api/domain/member/** | T-F40-01, 계약 C-4 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F42-02 | 서비스 설정 화면: `칭찬 알림`, `내 칭찬판 공개` 토글 | FE-web | F-42 | frontend/apps/web/src/components/features/account/settings/** | T-F40-00, T-F01-98, 계약 C-4 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F43-01 | `보낸 칭찬 공개` 저장 API(C-5) | BE | F-43 AC3 | backend/src/main/java/com/meotto/api/domain/member/** | T-F40-01, 계약 C-5 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F43-02 | 이름표·내용 마스킹 서비스(F-42·F-43 우선순위, 조회자별 규칙) | BE | F-42 AC2, F-43 AC4~5 | backend/src/main/java/com/meotto/api/domain/member/** | 선행 Plan의 stamp·friend 도메인, 보류: `보낸 칭찬 공개` 보는 사람별 적용 정책, 노출 범위 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F43-03 | `보낸 칭찬 공개` 세그먼트(전체/이름만/비공개) | FE-web | F-43 AC3 | frontend/apps/web/src/components/features/account/settings/** | T-F42-02, 계약 C-5 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F44-01 | 로그아웃 API(C-7) | BE | F-44 | backend/src/main/java/com/meotto/api/domain/auth/** | T-F03-02(auth-onboarding), 보류: 로그인 상태 유지 방식 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F44-02 | 로그아웃 동작과 보호 경로 접근 차단 | FE-web | F-44 AC | frontend/apps/web/src/components/features/account/**, frontend/apps/web/src/lib/** | T-F40-00, 보류: 로그인 상태 유지 방식 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F45-01 | 회원탈퇴 API(C-8)와 데이터 처리 | BE | F-45 | backend/src/main/java/com/meotto/api/domain/member/** | 보류: 탈퇴 시 도장 데이터 처리 (삭제성 쿼리라 별도 승인 필요) | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F45-02 | 회원탈퇴 확인·완료 팝업 흐름 | FE-web | F-45 AC | frontend/apps/web/src/components/features/account/withdraw/** | T-F40-00, T-F01-98 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: 팝업 흐름. 탈퇴 API 연결은 T-F45-01 이후 | |
| T-F40-99 | 실서버 연동 확인 | FE-web | F-40~F-45 | - | T-F40-01, T-F42-01, T-F43-01 | 수동 확인: 목을 끄고 프로필 조회·설정 변경. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 알림 토글 AC → T-F42-01, T-F42-02. `내 칭찬판 공개` 적용 AC → T-F43-02(보류). `보낸 칭찬 공개` 세그먼트 AC → T-F43-01, T-F43-03. F-42·F-43 우선순위 AC → T-F43-02. 프로필 저장 AC → T-F40-02, T-F40-03. 아이디 중복 AC → `auth-onboarding` T-F03-04. 닉네임 변경 AC → T-F40-02. 탈퇴 AC → T-F45-01, T-F45-02. 로그아웃 AC → T-F44-01, T-F44-02. 연결되지 않은 AC 없음. F-41에는 AC가 없다(제안: 링크 복사 값 = 공유 링크, QR 값 = 같은 링크).

## 보류 질문
- 탈퇴 시 도장 데이터 처리 (삭제 / 익명화 / 소프트 삭제)
- `보낸 칭찬 공개`의 보는 사람별 적용 정책, 이름만일 때 숨기는 범위, 본인 열람 시 적용 여부
- `내 칭찬판 공개` Off일 때 제한 화면의 노출 범위 (`friends`와 공유)
- 닉네임·아이디 길이/허용 문자, 프로필 사진 업로드 방식과 제한
- 공유 링크 형식·도메인, SNS 공유 아이콘 구성(Spec에 "구글"이 있으나 로그인 3종과 다름)
- 가입 후 아이디 변경 가능 여부 (이 Plan은 변경 불가로 가정)
