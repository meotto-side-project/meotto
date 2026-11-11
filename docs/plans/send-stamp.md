# Plan: 토마토(도장) 보내기

- Spec: docs/specs/send-stamp.md
- F-ID: F-20 ~ F-24
- 상태: draft
- 선행 Plan: `auth-onboarding`(F-03, F-04) 하드, `friends`(F-51, F-52) 하드, `home` 소프트, `notifications`(F-60) 소프트
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| auth-onboarding (F-03) | 하드 | draft | `Member`, 로그인 사용자 식별, 웹 공통 준비 `T-F01-00`, MSW `T-F01-98` |
| auth-onboarding (F-04) | 하드(F-24) | draft | 공유 링크 해석 `auth-onboarding` C-4로 받는 사람을 식별한다. F-04의 `T-F04-02`가 이 Plan의 `T-F24-02`로 이동시킨다 |
| friends (F-51, F-52) | 하드(F-20) | draft | 친구 목록 계약 `friends` C-4를 F-20의 친구 격자가 그대로 쓴다. 이름 필터는 FE에서 한다 |
| home | 소프트 | 미작성(순서상 이후) | 전송 후 `확인`으로 이동할 회원 홈·비회원 홈 라우트가 있다. 홈 `+` 버튼의 진입은 `home` Plan이 이 Plan의 `T-F20-01`을 호출한다 |
| notifications (F-60) | 소프트 | 미작성(순서상 이후) | 전송 성공 시 도장 생성 이벤트를 발행한다. 수신 푸시 발송은 `notifications` Plan이 구독한다 |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.

## 기술 설계
- 도장 전송은 한 번의 `POST`다. 롱프레스 완료는 FE 상태이고 **API는 `편지 보내기`를 누른 시점에 한 번만 호출**한다(Spec AC).
- 키워드는 Spec의 10종을 서버 enum으로 고정한다(다정해요, 재미있어요, 믿음직해요, 따뜻해요, 공감을 잘해요, 센스있어요, 멋있어요, 꾸준해요, 생각이 깊어요, 귀여워요). 키워드와 메시지 중 하나 이상이 필요하다는 검증은 서버와 FE에 모두 둔다.
- 메시지 최대 글자 수는 보류다. 서버 상수 `MESSAGE_MAX_LENGTH`와 FE 상수를 분리해 두고 값은 질문이 해소될 때 채운다(임시로 Figma의 200을 쓰지 않는다).
- 비회원 전송은 로그인 없이 공유 링크 토큰으로 받는 사람을 식별하는 별도 엔드포인트(`C-2`)다. 보낸 사람은 `null`이며 나중에 가입해도 연결하지 않는다(Spec AC).
- 도장 생성 후 `StampSentEvent`를 발행해 푸시(`notifications`)와 분리한다.
- 받는 사람 지정 진입: 친구 칭찬판의 `토마토 보내기`(F-54)와 공유 링크(F-24)는 받는 사람이 정해진 상태로 메시지 작성(F-21)에 진입한다. 홈 `+`는 F-20에서 고른다.

## 프론트엔드 범위
- web: 친구 선택 바텀시트, 메시지 작성(키워드 칩, 직접 메시지, 글자 수 카운터), 롱프레스 토마토찍기와 `편지 보내기`, 전달 완료 화면, 비회원 토마토 보내기 진입
- mobile: 없음 (롱프레스 햅틱이 필요하면 별도 질문)

## 백엔드 범위
- 도메인/패키지: `domain/stamp`(도장 Entity, 전송, 키워드)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `stamp` 테이블 | 신규: id, sender_id(nullable), receiver_id, message(nullable), read_at(nullable), created_at 등 BaseEntity 컬럼 | 제안. 비회원 전송은 `sender_id`가 null. `home`, `my-board`, `friends`, `notifications`가 조회한다 |
| `stamp_keyword` 테이블 | 신규: stamp_id, keyword(enum) | 제안. 도장 1건에 키워드 0개 이상(메시지가 있으면 0개 허용) |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | POST | /api/stamps | 필요 | `{ receiverId, keywords[], message? }` | 201 `{ stampId, sentAt }` | `STAMP_CONTENT_REQUIRED`(400), `INVALID_KEYWORD`(400), `MESSAGE_TOO_LONG`(400), `MEMBER_NOT_FOUND`(404), `CANNOT_SEND_TO_SELF`(400) | F-21, F-22, F-23 | 확정 |
| C-2 | POST | /api/public/share-links/{token}/stamps | 없음 | `{ keywords[], message? }` | 201 `{ stampId, sentAt, receiverNickname }` | `SHARE_LINK_NOT_FOUND`(404), `SHARE_LINK_INVALID`(410), `STAMP_CONTENT_REQUIRED`(400), `INVALID_KEYWORD`(400), `MESSAGE_TOO_LONG`(400) | F-24 | 보류: 공유 링크 무효 처리, 비회원 남용 방지, 비회원 이름 설정 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 친구 목록은 `friends` C-4를 쓴다.
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.
- `MESSAGE_TOO_LONG`의 기준 길이는 보류다. `C-1`의 `확정`은 경로·필드 구조에 한한다.

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1)
2. 공통 준비 `T-F20-00`
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F20-99`
5. 보류 Task(`T-F21-02`의 글자 수, `T-F24-01`, `T-F24-02`)는 질문 해소 후 `/plan-feature send-stamp`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: `StampService` 전송 검증(키워드·메시지 조건, 키워드 enum, 자기 자신 전송), 이벤트 발행 단위 테스트. 비회원 전송은 보낸 사람 null과 가입 후 연결 없음을 검증
- FE: 컴포넌트·E2E 도구 미설치로 자동 검증은 미검증. 도구 설치 후 칩 다중 선택, 버튼 활성화 조건, 롱프레스 완료 후 `편지 보내기` 노출, `<` 취소 시 입력 유지를 스토리 play 함수로 덮는다
- 사람이 확인할 AC: 롱프레스 느낌, 푸시 수신(실기기), 비회원 화면의 최신 Figma 일치

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F20-00 | 웹 공통 준비: stamp 쿼리 키·엔드포인트 상수, Zod 스키마, 키워드 10종 상수 | FE-web | F-20~F-24 | frontend/apps/web/src/components/features/stamp/constants/**, frontend/apps/web/src/components/features/stamp/schemas/** | T-F01-00, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types | |
| T-F20-01 | 친구 선택 바텀시트(검색, 격자, 체크, `메시지 작성`) | FE-web | F-20 AC1 | frontend/apps/web/src/components/features/stamp/select-friend/** | T-F20-00, T-F01-98, 계약 friends C-4 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F21-01 | `Stamp`·`StampKeyword` Entity·Repository (스키마 승인 필요) | BE | F-21 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F03-01(auth-onboarding), 데이터 모델 승인 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F21-02 | 메시지 작성 화면(To, 칩 10개 다중 선택, 직접 메시지, 글자 수 카운터, 받는 사람 지정 진입) | FE-web | F-21 AC3~AC7 | frontend/apps/web/src/app/stamps/new/**, frontend/apps/web/src/components/features/stamp/compose/** | T-F20-00, T-F01-98, 보류: 메시지 최대 글자 수 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F22-01 | 도장 전송 API(C-1)와 `StampSentEvent` 발행 | BE | F-22 AC9~AC10 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01, 계약 C-1 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F22-02 | 롱프레스 토마토찍기, `편지 보내기`, `<` 취소(입력 유지), 전송 호출 | FE-web | F-22 AC8~AC10 | frontend/apps/web/src/components/features/stamp/compose/** | T-F21-02, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 (롱프레스 시간은 상수로 분리) | |
| T-F23-01 | 전달 완료 화면(날짜, To, 키워드, 메시지)과 `확인` 이동 | FE-web | F-23 AC11~AC12 | frontend/apps/web/src/components/features/stamp/complete/** | T-F22-02 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F24-01 | 비회원 도장 전송 API(C-2) (보낸 사람 null) | BE | F-24 AC13, AC16 | backend/src/main/java/com/meotto/api/domain/stamp/**, backend/src/main/java/com/meotto/api/domain/sharelink/** | T-F22-01, T-F04-01(auth-onboarding), 보류: 공유 링크 무효 처리, 비회원 남용 방지 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F24-02 | 비회원 토마토 보내기 진입(친구 선택 생략, 링크로 받는 사람 지정)과 전송 후 비회원 홈 이동 | FE-web | F-24 AC2, AC13 | frontend/apps/web/src/app/(public)/**, frontend/apps/web/src/components/features/stamp/guest/** | T-F22-02, T-F04-02(auth-onboarding), 보류: 공유 링크 형식·무효 처리, 비회원 이름 설정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F20-99 | 실서버 연동 확인 | FE-web | F-20~F-24 | - | T-F22-01 | 수동 확인: 목을 끄고 전송까지 확인. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 친구 선택 AC → T-F20-01. 비회원 시작 AC → T-F24-02. `To` 표시 AC → T-F21-02. 칩 다중 선택 AC → T-F21-02. 최대 글자 수 AC → T-F21-02(보류). 하나 이상 필요, 버튼 비활성 AC → T-F21-02, T-F22-02. 롱프레스 AC → T-F22-02. 취소 후 입력 유지 AC → T-F22-02. 전송 시점 AC → T-F22-01, T-F22-02. 전달 완료 표시 AC → T-F23-01. `확인` 이동 AC → T-F23-01, T-F24-02. 푸시 AC → `notifications` T-F60-01. `내 칭찬판 만들기` 분기 AC → `home` T-F16-01, `auth-onboarding` T-F04-03. 비회원 보낸 기록 연결 없음 AC → T-F24-01. 연결되지 않은 AC 없음.

## 보류 질문
- 메시지 최대 글자 수 (Figma의 200은 임시 값)
- 공유 링크 무효·만료·탈퇴 회원 처리, 비회원 전송 남용 방지 기준
- 비회원 보내는 사람 이름 설정 여부
- 전송 실패·로딩·중복 전송 방지, 롱프레스 시간·중도 취소 동작
- 최신 Figma의 비회원 화면 (Spec: 이전 디자인이라 업데이트 필요)
