# Plan: 친구

- Spec: docs/specs/friends.md
- F-ID: F-50 ~ F-54
- 상태: draft
- 선행 Plan: `auth-onboarding`(F-03) 하드, `mypage-settings`(F-40, F-42) 하드, `send-stamp`(F-21) 소프트, `my-board` 소프트
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| auth-onboarding (F-03) | 하드 | draft | `Member` Entity(닉네임, 아이디, 사진)와 로그인 사용자 식별, 웹 공통 준비 `T-F01-00`, MSW `T-F01-98` |
| mypage-settings (F-40, F-42) | 하드 | draft | `member.board_public`(내 칭찬판 공개) 컬럼과 `mypage-settings` C-1 응답. 제한 화면 분기에 쓴다 |
| send-stamp (F-21) | 소프트 | 미작성(순서상 이후) | 친구 칭찬판의 `토마토 보내기`가 이동할 메시지 작성 라우트가 있다. 받는 사람을 미리 지정해 진입하는 방식은 `send-stamp` Plan이 정한다 |
| my-board | 소프트 | 미작성(순서상 이후) | 칭찬판 격자·많이 받은 칭찬 컴포넌트를 F-53이 재사용한다. 이 Plan에서는 `C-6` 응답 형태만 정하고 컴포넌트는 `my-board` Plan이 만든다 |
| stamp 도메인 | 하드(F-52 토마토 수, F-53 기록) | 미작성(순서상 이후) | 주고받은 토마토 수는 `stamp` 테이블에서 집계한다. `send-stamp` Plan이 `stamp` Entity를 만든다. 그 전까지 BE 집계 Task는 선행이 없는 상태로 둔다 |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.

## 기술 설계
- 친구 추가는 수락 없이 즉시 성립한다(Spec). 관계 저장 방식은 **양방향(한 번 추가하면 양쪽 모두 친구)**을 제안한다. 단방향/양방향과 친구 해제 여부는 Spec에 없으므로 승인 항목이다.
- 친구 목록(F-52)의 "나와 주고받은 토마토 수"는 나↔친구 사이 `stamp` 건수(보낸 + 받은 합)로 집계한다. 합산 기준은 Spec에 숫자 예시만 있어 가정이다.
- 친구 칭찬판은 두 응답으로 나눈다. `C-5`(프로필·관계·주고받은 수)는 확정이고, `C-6`(격자·많이 받은 칭찬·기록·배지)은 `보낸 칭찬 공개`와 제한 화면 노출 범위가 보류다.
- F-54(친구 도장찍기)는 새 API가 없다. 친구 칭찬판의 `토마토 보내기`가 `send-stamp`의 메시지 작성 화면으로 이동하는 라우팅이다.
- 검색은 닉네임 부분 일치를 가정한다(Spec은 "이름 검색"). 아이디 검색 포함 여부는 비차단 질문이다.

## 프론트엔드 범위
- web: 친구 탭(검색창, 친구 추가하기, 친구 목록), 검색 화면(추천 친구, 결과, 친구 추가 버튼), 친구 칭찬판(일반·제한·비친구 3상태)
- mobile: 없음

## 백엔드 범위
- 도메인/패키지: `domain/friend`(친구 관계, 검색·추천, 목록), 칭찬판 조회는 `domain/friend`에서 프로필·관계를 맡고 도장 집계는 `domain/stamp`를 호출

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `friendship` 테이블 | 신규: id, member_id, friend_id + BaseEntity 컬럼. `(member_id, friend_id)` 유니크 | 제안. 양방향이면 추가 시 2행을 한 트랜잭션에 저장 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | GET | /api/members/search?q={이름} | 필요 | query `q` | 200 `[{ memberId, nickname, handle, profileImageUrl, isFriend }]` | - | F-50, F-51 | 확정 |
| C-2 | GET | /api/friends/recommendations | 필요 | - | 200 `[{ memberId, nickname, handle, profileImageUrl, isFriend }]` | - | F-50, F-51 | 보류: 추천 친구 기준 |
| C-3 | POST | /api/friends | 필요 | `{ memberId }` | 201 없음 | `MEMBER_NOT_FOUND`(404), `ALREADY_FRIEND`(409), `CANNOT_ADD_SELF`(400) | F-51 | 확정 |
| C-4 | GET | /api/friends | 필요 | - | 200 `[{ memberId, nickname, handle, profileImageUrl, exchangedStampCount }]` | - | F-52 | 확정 |
| C-5 | GET | /api/members/{memberId}/profile | 필요 | - | 200 `{ memberId, nickname, handle, profileImageUrl, relation: SELF \| FRIEND \| NONE, exchangedStampCount, boardRestricted }` | `MEMBER_NOT_FOUND`(404) | F-53 | 확정 |
| C-6 | GET | /api/members/{memberId}/board | 필요 | - | 200 `{ totalStampCount, stamps[], topKeywords[], exchangeHistory?, badges? }` (제한 화면이면 `exchangeHistory`, `badges` 생략) | `MEMBER_NOT_FOUND`(404) | F-53 | 보류: 제한 화면 노출 범위, `보낸 칭찬 공개` 적용 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.
- `C-4`는 `send-stamp` F-20의 친구 목록에도 쓴다(이름 필터는 FE에서 한다).

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-3, C-4, C-5)
2. 공통 준비 `T-F50-00`
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F50-99`
5. 보류 Task(`C-2`, `C-6` 관련)는 질문 해소 후 `/plan-feature friends`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: `FriendService`(중복 추가, 자기 자신 추가, 양방향 저장), 검색 서비스, 주고받은 수 집계 단위 테스트
- FE: 컴포넌트·E2E 도구 미설치로 자동 검증은 미검증. F-51 AC(추가 후 버튼이 `친구`로 변경), 친구 목록 탭 이동 AC는 도구 설치 후 스토리 play 함수·E2E로 덮는다
- 사람이 확인할 AC: `친구` 표시의 빨간색 등 시각 요소

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F50-00 | 웹 공통 준비: friend 쿼리 키·엔드포인트 상수, Zod 스키마, 하단 탭바(Home/My/Friend, `+` 버튼 자리) 공유 컴포넌트와 친구 탭 레이아웃(Friend 선택 상태) | FE-web | F-50~F-54 | frontend/apps/web/src/components/features/friend/** | T-F01-00, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types | |
| T-F50-01 | 친구 이름 검색 API(C-1) | BE | F-50 | backend/src/main/java/com/meotto/api/domain/friend/** | T-F03-01(auth-onboarding), 계약 C-1 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F50-02 | 친구 검색 화면(검색창, 취소, 지우기, 결과 목록) | FE-web | F-50 | frontend/apps/web/src/app/friends/search/**, frontend/apps/web/src/components/features/friend/search/** | T-F50-00, T-F01-98 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F50-03 | 추천 친구 API(C-2)와 검색 화면 추천 목록 | BE | F-50, F-51 | backend/src/main/java/com/meotto/api/domain/friend/** | T-F51-01, 보류: 추천 친구 기준 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F50-04 | 추천 친구 목록 표시 | FE-web | F-50, F-51 | frontend/apps/web/src/components/features/friend/search/** | T-F50-02, 보류: 추천 친구 기준 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F51-01 | `Friendship` Entity와 친구 추가 API(C-3) (스키마 승인 필요) | BE | F-51 AC2 | backend/src/main/java/com/meotto/api/domain/friend/** | T-F03-01(auth-onboarding), 계약 C-3 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F51-02 | `+ 친구 추가하기`와 행별 `친구 추가` → `친구` 전환 | FE-web | F-51 AC2 | frontend/apps/web/src/components/features/friend/** | T-F50-02, 계약 C-3 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F52-01 | 친구 목록 API(C-4)와 주고받은 토마토 수 집계 | BE | F-52 | backend/src/main/java/com/meotto/api/domain/friend/** | T-F51-01, `stamp` 도메인(send-stamp) | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F52-02 | 친구 탭 친구 목록(프로필, 이름, 토마토 수)과 칭찬판 이동 | FE-web | F-52, F-53 AC1 | frontend/apps/web/src/app/friends/**, frontend/apps/web/src/components/features/friend/list/** | T-F50-00, T-F01-98, 계약 C-4 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F53-01 | 친구 프로필·관계 조회 API(C-5) | BE | F-53 | backend/src/main/java/com/meotto/api/domain/friend/** | T-F51-01, T-F40-01(mypage-settings), 계약 C-5 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F53-02 | 친구 칭찬판 조회 API(C-6) | BE | F-53 | backend/src/main/java/com/meotto/api/domain/friend/**, backend/src/main/java/com/meotto/api/domain/stamp/** | T-F53-01, T-F43-02(mypage-settings), 보류: 제한 화면 노출 범위, `보낸 칭찬 공개` 적용 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F53-03 | 친구 칭찬판 상단(프로필, 관계별 버튼, 주고받은 수, `토마토 보내기`/`친구 추가하기`) | FE-web | F-53 | frontend/apps/web/src/app/friends/[memberId]/**, frontend/apps/web/src/components/features/friend/board/** | T-F50-00, T-F01-98, 계약 C-5 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F53-04 | 친구 칭찬판 본문(격자, 많이 받은 칭찬, 기록, 배지)과 제한 화면 | FE-web | F-53 | frontend/apps/web/src/components/features/friend/board/** | T-F53-03, T-F30-02(my-board), 보류: 제한 화면 노출 범위, `보낸 칭찬 공개` 적용 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F54-01 | 친구 칭찬판 `토마토 보내기` → 메시지 작성 이동(받는 사람 지정) | FE-web | F-54, AC3 | frontend/apps/web/src/components/features/friend/board/** | T-F53-03, T-F21-02(send-stamp) | cd frontend && pnpm lint && pnpm check-types. 수동 확인: 이동 후 받는 사람 `To` 표시 | |
| T-F50-99 | 실서버 연동 확인 | FE-web | F-50~F-54 | - | T-F50-01, T-F51-01, T-F52-01, T-F53-01 | 수동 확인: 목을 끄고 검색·추가·목록·칭찬판 상단. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 목록 탭 이동 AC → T-F52-02. 친구 추가 후 버튼 전환 AC → T-F51-01, T-F51-02. `토마토 보내기` 이동 AC → T-F54-01. 연결되지 않은 AC 없음. F-50~F-53에는 AC가 없다(제안: 검색 화면 전환, 수락 없이 즉시 친구, 토마토 수 표시, 관계별 화면 분기).

## 보류 질문
- 추천 친구의 추천 기준 (Spec Open Questions 1)
- 제한된 칭찬판(`내 칭찬판 공개` Off)에서 나와의 토마토 기록·배지 컬렉션 노출 여부, `보낸 칭찬 공개`가 칭찬판 도장 상세·기록에 적용되는 방식 (Spec Open Questions 2)
- 친구 해제 가능 여부, 단방향/양방향 (이 Plan은 양방향·해제 없음으로 가정)
- 검색이 아이디 포함인지, 친구 칭찬판 `상자 속 전체 토마토`의 기간(전체 누적 가정)

참고: 이 Spec의 Open Questions 2건은 `[논의 필요]` 태그가 없다. `docs/specs/README.md` 규칙대로 태그를 붙이는 Spec 수정은 별도로 보고한다.
