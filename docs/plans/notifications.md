# Plan: 알림

- Spec: docs/specs/notifications.md
- F-ID: F-60 ~ F-64 (F-61 제외)
- 상태: draft
- 선행 Plan: `send-stamp`(F-22) 하드, `mypage-settings`(F-42) 하드, `auth-onboarding`(F-03) 하드, `home`(F-13) 하드, `my-board`(F-30) 하드(F-64)
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| send-stamp (F-22) | 하드 | draft | `StampSentEvent`가 발행되고 `stamp` 테이블이 있다. F-63의 "오늘 보낸 사용자 제외" 판정도 `stamp.sender_id`·`created_at`을 쓴다 |
| mypage-settings (F-42) | 하드 | draft | `member.notification_enabled` 컬럼과 설정 변경 API(`mypage-settings` C-4). 발송 조건이 이 값을 읽는다 |
| auth-onboarding (F-03) | 하드 | draft | `Member`, 로그인 사용자 식별, `member.last_active_at`. 비회원은 푸시 토큰이 없다 |
| home (F-13) | 하드 | draft | 새 편지 확인 화면(`/home/letters`)과 읽음 처리 API `home` C-3. 알림 탭 이동 목적지 |
| my-board (F-30) | 하드(F-64) | draft | 배너가 놓일 칭찬판 상단 자리 |
| 푸시 인프라 | 범위 밖 | 있음 | `global/infrastructure/fcm`(`FcmSender`)을 발송 어댑터로 쓴다. 인프라 자체는 이 Plan의 범위 밖(Spec) |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.
- F-61(찌르기)은 Spec이 다음 MVP로 미뤘으므로 이 Plan에서 제외한다(Task 없음).

## 기술 설계
- 푸시 대상 식별: 앱이 로그인 후 FCM 토큰을 등록한다(`C-1`). 로그아웃·탈퇴 시 해제한다(`C-2`). **FCM 토큰은 응답에 노출하지 않는다**(`backend.md` 불변 조건).
- F-60: `StampSentEvent`를 구독해 수신자의 `notification_enabled`가 On이고 수신자가 회원일 때만 발송한다. 제목은 `{보낸 사람}`, 본문은 "띵동! `{보낸 사람}`님이 보낸 새 토마토가 도착했어요."다. 비회원 발신자의 표기는 보류다.
- F-62: 스케줄러가 `last_active_at` 기준 7일 이상 접속하지 않은 알림 On 회원에게 발송하고, 이후 7일마다 한 번 더 보낸다. "앱 접속"은 인증된 요청이 올 때 `last_active_at`을 갱신하는 것으로 가정한다(가정, 비차단 질문).
- F-63: 매일 20시 스케줄러. 발송 시각 고정/선택, 광고성 여부, 시간대가 모두 보류이므로 Task 전체가 보류다.
- 탭 시 이동: F-62, F-63은 홈, F-60은 "해당 메시지(F-13)"인데 열리는 방식이 보류다. 푸시 payload에 `type`과 `stampId`를 싣는 안은 제안이며, 이동 방식이 정해질 때 확정한다.
- F-64: 칭찬판 상단 배너는 `안 읽은 토마토가 있고, 마지막 닫음 이후 새 토마토가 도착했을 때` 노출한다. "안 읽음"의 기준과 닫음 상태 저장 위치가 보류이므로 API와 화면 모두 보류다.

## 프론트엔드 범위
- web: 칭찬판 상단 인앱 배너(F-64)
- mobile: 푸시 권한 요청과 FCM 토큰 등록, 알림 탭 라우팅(웹뷰에 딥링크 전달)

## 백엔드 범위
- 도메인/패키지: `domain/notification`(디바이스 토큰, 발송, 스케줄러, 배너 상태)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `device_token` 테이블 | 신규: id, member_id, fcm_token(유니크), platform + BaseEntity 컬럼 | 제안 |
| 배너 닫음 상태 | 저장 위치(서버 컬럼 vs 기기) | **보류**. 서버 저장이면 `member`에 `banner_dismissed_at` 같은 컬럼이 필요하다 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | POST | /api/devices/push-token | 필요 | `{ fcmToken, platform: IOS \| ANDROID }` | 204 | `INVALID_PUSH_TOKEN`(400) | F-60, F-62, F-63 | 확정 |
| C-2 | DELETE | /api/devices/push-token | 필요 | `{ fcmToken }` | 204 | - | F-60, F-62, F-63 | 확정 |
| C-3 | GET | /api/notifications/banner | 필요 | - | 200 `{ visible, unreadCount }` | - | F-64 | 보류: 안 읽음 기준, 닫음 상태 저장 위치 |
| C-4 | POST | /api/notifications/banner/dismiss | 필요 | - | 204 | - | F-64 | 보류: 닫음 상태 저장 위치 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 푸시 payload는 API가 아니라 FCM 메시지 계약이다. 형태는 `T-F60-03` 확정 시 이 Plan에 표로 추가한다(보류).
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.

## 웹뷰 브리지 메시지 계약
| 방향 | type | payload | 용도 | 상태 |
|---|---|---|---|---|
| 네이티브 → 웹 | `PUSH_OPEN` | `{ type, stampId? }` | 알림 탭 시 해당 화면으로 이동 요청 | 보류: 탭 시 이동 방식 |

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-2)
2. 공통 준비 `T-F60-00`
3. BE Task들 ∥ FE Task들
4. 실서버 연동 확인 `T-F60-99`
5. 보류 Task(F-63 전체, F-64 전체, 탭 이동)는 질문 해소 후 `/plan-feature notifications`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: 발송 조건(알림 Off·비회원 미발송), F-62 7일 판정(시간 주입), 푸시 어댑터 목킹 단위 테스트. 실제 단말 수신은 자동화할 수 없다
- FE: 컴포넌트·E2E 도구 미설치로 배너 노출·닫기 자동 검증은 미검증
- 사람이 확인할 AC: 푸시 수신과 탭 이동(실기기), 아이콘 3종(파랑/썩음/빨강 토마토)

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F60-00 | `DeviceToken` Entity와 푸시 토큰 등록·해제 API(C-1, C-2) (스키마 승인 필요) | BE | F-60~F-63 | backend/src/main/java/com/meotto/api/domain/notification/** | T-F03-01(auth-onboarding), 계약 C-1, C-2 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F60-01 | 새 토마토 도착 푸시 발송(`StampSentEvent` 구독, 알림 Off·비회원 제외) | BE | F-60 AC1~AC2, AC5, AC7 | backend/src/main/java/com/meotto/api/domain/notification/**, backend/src/main/java/com/meotto/api/global/infrastructure/fcm/** | T-F60-00, T-F22-01(send-stamp), T-F42-01(mypage-settings) | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F60-02 | 푸시 권한 요청과 FCM 토큰 등록·해제 | FE-mobile | F-60 | frontend/apps/mobile/src/** | T-F60-00, 보류: 권한 요청 시점, `칭찬 알림` 기본값 | 수동 확인: 실기기 토큰 등록. cd frontend && pnpm lint && pnpm check-types | |
| T-F60-03 | 알림 탭 라우팅(F-60 → 해당 편지, F-62·F-63 → 홈)과 웹 수신 처리 | FE-mobile | F-60 AC6 | frontend/apps/mobile/src/** | T-F13-02(home), T-F60-02, 보류: F-60 탭 시 이동 방식 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | |
| T-F62-01 | 7일 미접속 푸시 스케줄러와 `last_active_at` 갱신 | BE | F-62 AC3 | backend/src/main/java/com/meotto/api/domain/notification/**, backend/src/main/java/com/meotto/api/global/security/** | T-F60-01, T-F42-01(mypage-settings) | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F63-01 | 매일 20시 보내기 리마인드 스케줄러(오늘 보낸 사용자 제외) | BE | F-63 AC4 | backend/src/main/java/com/meotto/api/domain/notification/** | T-F60-01, 보류: 발송 시각 고정/선택(`[논의 필요]`), 광고성 여부(`[논의 필요]`), 시간대 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F64-01 | 인앱 배너 상태 조회·닫기 API(C-3, C-4) | BE | F-64 AC8~AC9 | backend/src/main/java/com/meotto/api/domain/notification/** | T-F21-01(send-stamp), 보류: 안 읽음 기준, 닫음 상태 저장 위치 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F64-02 | 칭찬판 상단 인앱 배너(검정 바, 🔔 문구, X 닫기) | FE-web | F-64 AC8~AC9 | frontend/apps/web/src/components/features/board/banner/** | T-F30-02(my-board), T-F01-98, 보류: 안 읽음 기준, 닫음 상태 저장 위치 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F60-99 | 실서버 연동 확인(푸시 수신·배너) | FE-mobile | F-60, F-62, F-64 | - | T-F60-01, T-F62-01 | 수동 확인: 실기기에서 전송 → 수신 → 탭 이동. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 도장 수신 시 F-60 AC → T-F60-01. 표시명 포함 AC → T-F60-01. F-62 7일 AC → T-F62-01. F-63 저녁 8시 AC → T-F63-01. `칭찬 알림` Off 미발송 AC → T-F60-01, T-F62-01, T-F63-01. 탭 시 이동 AC → T-F60-03. 비회원 미발송 AC → T-F60-01. F-64 노출·자동 사라짐 AC → T-F64-01, T-F64-02. F-64 닫기 AC → T-F64-01, T-F64-02. F-61 관련 AC(찌르기)는 범위 밖이라 연결하지 않는다.

## 보류 질문
- **[논의 필요]** F-63 발송 시각을 사용자가 선택하게 할지 (Spec Open Questions 1)
- **[논의 필요]** F-63이 광고성 정보인지, 수신·야간 발송 동의가 필요한지 (Spec Open Questions 2)
- F-60 탭 시 "해당 메시지를 바로 연다"의 구체적 동작(캐러셀 위치, 단건, 이미 읽은 경우)
- F-64 "안 읽은 토마토"의 기준(`확인` 버튼만인지, 푸시 탭으로 열어도 읽음인지)과 닫음 상태 저장 위치(서버/기기)
- `칭찬 알림` 기본값과 푸시 권한 요청 시점
- F-62 "앱 접속" 정의와 반복 상한, 비회원 발신자 표기, 알림 묶음 정책
