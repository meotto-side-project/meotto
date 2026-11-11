# Plan: 홈 (회원 / 비회원)

- Spec: docs/specs/home.md
- F-ID: F-10 ~ F-14, F-16
- 상태: draft
- 선행 Plan: `send-stamp`(F-22, F-24) 하드, `auth-onboarding`(F-03) 하드, `friends`(F-53) 하드, `mypage-settings`(F-42, F-43) 소프트
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| send-stamp (F-22, F-24) | 하드 | draft | `stamp`·`stamp_keyword` 테이블과 Entity(`read_at` 포함), 전송 후 비회원 홈으로 이동하는 흐름, `T-F20-01`(친구 선택) |
| auth-onboarding (F-03, F-04) | 하드 | draft | `Member`, 로그인 사용자 식별, 공유 링크 해석 `auth-onboarding` C-4, `share_link` 테이블 |
| friends (F-53) | 하드 | draft | 편지 카드의 보낸 사람 이름 탭이 이동할 친구 칭찬판 라우트 `/friends/{memberId}`(`T-F53-03`) |
| friends (탭바) | 하드 | draft | 하단 탭바(Home/My/Friend)와 `+` 버튼 자리는 `T-F50-00`에서 만든 공유 컴포넌트를 쓴다 |
| mypage-settings (F-42, F-43) | 소프트 | draft | 이름표 마스킹 서비스 `T-F43-02`. 이 Plan은 Spec의 이름표 표시 규칙(기본, 내 칭찬판 공개 Off, 보낸 칭찬 공개 비공개/이름만)을 그대로 따르고, 설정 컬럼은 `member`에 있다 |
| my-board (F-30) | 소프트 | 미작성(순서상 이후) | 읽음 처리 후 파란 도장이 빨강으로 바뀌는 표시는 `my-board`가 담당하고, 이 Plan은 읽음 처리 API만 제공한다 |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.

## 기술 설계
- 회원 홈은 한 번의 조회(`C-1`)로 `state`(NEW_LETTER / BOX / EMPTY)를 받는다. 판정은 서버가 한다: 확인하지 않은 도장이 있으면(받은 달 무관) NEW_LETTER, 없고 이번 달 받은 도장이 있으면 BOX, 없으면 EMPTY(Spec 표 그대로).
- "이번 달" 기준 시간대는 Spec에 없다. 서버 기준 KST로 가정한다(가정, 비차단 질문).
- 새 편지 캐러셀은 `C-2`로 읽지 않은 편지를 받는다. `확인`은 `C-3` 한 번 호출로 **전체 읽음 처리**하고, 뒤로가기는 API를 호출하지 않는다(Spec AC).
- 선반 이름표는 `nameTag` 문자열(보낸 친구 이름, `------`, 또는 null)을 서버가 계산해 내려준다. 규칙은 Spec의 이름표 표시 규칙 표다. **본인이 자기 홈을 볼 때의 적용은 Spec의 미해결 질문**이라 Spec의 임시 규칙(회원·비회원 같은 규칙)을 따르고, 질문이 해소되면 계약을 갱신한다.
- 비회원 홈은 공유 링크 토큰으로 받는 사람의 이번 달 박스를 보여 주는 공개 조회(`C-4`)다. 전송 완료 후에만 나타난다는 규칙은 FE 흐름이다.
- `내 칭찬판 만들기`(F-16) 분기(앱 로그인 / 앱스토어 / 내 칭찬판)는 앱 설치 감지가 필요한 네이티브 기능이라 `auth-onboarding` `T-F04-03`을 쓰고, 이 Plan은 웹 쪽 버튼과 회원 여부 분기를 만든다.

## 프론트엔드 범위
- web: 회원 홈 3상태(토마토 박스, 빈 상태, 봉투), 내 토마토 확인 캐러셀, `+` 버튼, 비회원 홈과 `내 칭찬판 만들기`
- mobile: 앱 설치 분기는 `auth-onboarding` `T-F04-03`

## 백엔드 범위
- 도메인/패키지: `domain/stamp`(홈 조회, 읽지 않은 편지, 일괄 읽음), `domain/sharelink`(비회원 박스 조회)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `stamp` | `read_at`을 사용 (컬럼은 `send-stamp`에서 생성) | 이 Plan에서 추가 컬럼 없음 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | GET | /api/home | 필요 | - | 200 `{ state: NEW_LETTER \| BOX \| EMPTY, month, boxCount, newCount, shelf: [{ stampId, nameTag }] }` | - | F-10, F-11, F-12 | 확정 |
| C-2 | GET | /api/stamps/unread | 필요 | - | 200 `[{ stampId, sentAt, sender: { memberId, nickname } \| null, keywords[], message }]` | - | F-13 | 확정 |
| C-3 | POST | /api/stamps/unread/read-all | 필요 | - | 204 | - | F-13 | 확정 |
| C-4 | GET | /api/public/share-links/{token}/box | 없음 | - | 200 `{ ownerNickname, month, boxCount, shelf: [{ stampId, nameTag }] }` | `SHARE_LINK_NOT_FOUND`(404), `SHARE_LINK_INVALID`(410) | F-16 | 보류: 공유 링크 형식·무효 처리 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- `sender`가 null이면 비회원이 보낸 편지다(From 표기는 비회원 이름 설정 여부가 보류).
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-2, C-3)
2. 공통 준비 `T-F10-00`
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F10-99`
5. 보류 Task(`C-4` 관련)는 질문 해소 후 `/plan-feature home`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: 홈 상태 판정(지난달 미확인 편지 포함, 월 경계는 시간 주입), 일괄 읽음 처리, 이름표 규칙 조합 단위 테스트
- FE: 컴포넌트·E2E 도구 미설치로 자동 검증은 미검증. 도구 설치 후 3상태 렌더, 캐러셀 `확인`/뒤로가기 동작, 탭바·`+` 노출(회원만)을 스토리 play 함수와 E2E로 덮는다
- 사람이 확인할 AC: 선반 줄 레이아웃·스크롤·탭바 겹침의 시각 확인, 앱 설치 분기(실기기)

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F10-00 | 웹 공통 준비: home 쿼리 키·엔드포인트 상수, Zod 스키마, 선반·이름표 공유 컴포넌트 | FE-web | F-10~F-16 | frontend/apps/web/src/components/features/home/** | T-F01-00, T-F50-00(friends), 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types | |
| T-F10-01 | 홈 조회 API(C-1): 상태 판정, 이번 달 박스, 이름표 계산 | BE | F-10, F-11, F-12 AC1~AC2, AC5~AC6 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 계약 C-1 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F10-02 | 토마토 박스 화면(월 배지, 선반 3개/줄, 세로 스크롤, 이름표) | FE-web | F-10 AC5~AC7 | frontend/apps/web/src/app/(tabs)/home/**, frontend/apps/web/src/components/features/home/box/** | T-F10-00, T-F01-98, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F11-01 | 빈 상태 화면(`나의 ○월 토마토 0`, 문구, 빈 선반) | FE-web | F-11 AC2 | frontend/apps/web/src/components/features/home/empty/** | T-F10-00, T-F01-98, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F12-01 | 읽지 않은 편지 조회 API(C-2) | BE | F-12 AC1, F-13 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 계약 C-2 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F12-02 | 봉투 화면(`New N` 배지, 안내 문구)과 탭 시 편지 확인 이동 | FE-web | F-12 | frontend/apps/web/src/components/features/home/envelope/** | T-F10-00, T-F01-98, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F13-01 | 일괄 읽음 처리 API(C-3) | BE | F-13 AC3 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 계약 C-3 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F13-02 | 내 토마토 확인 캐러셀(스와이프, 페이지 도트, `확인`, 뒤로가기 시 읽음 처리 안 함, 이름 탭 → 친구 칭찬판) | FE-web | F-13 AC3~AC4 | frontend/apps/web/src/app/(tabs)/home/letters/**, frontend/apps/web/src/components/features/home/letters/** | T-F12-02, T-F53-03(friends), 계약 C-2, C-3 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F14-01 | `+` 버튼 → 친구 선택 바텀시트 | FE-web | F-14 | frontend/apps/web/src/components/features/home/** | T-F10-00, T-F20-01(send-stamp) | cd frontend && pnpm lint && pnpm check-types. 수동 확인: 바텀시트 열림 | |
| T-F16-01 | 비회원 박스 조회 API(C-4) | BE | F-16 | backend/src/main/java/com/meotto/api/domain/sharelink/**, backend/src/main/java/com/meotto/api/domain/stamp/** | T-F04-01(auth-onboarding), 보류: 공유 링크 형식·무효 처리 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F16-02 | 비회원 홈 화면(`○○의 ○월 토마토 N`, 탭바·`+` 없음)과 `내 칭찬판 만들기`(회원이면 내 칭찬판 이동) | FE-web | F-16 AC8~AC9, AC11 | frontend/apps/web/src/app/(public)/box/**, frontend/apps/web/src/components/features/home/guest/** | T-F10-00, T-F24-02(send-stamp), T-F04-03(auth-onboarding), 보류: 공유 링크 형식·무효 처리 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F10-99 | 실서버 연동 확인 | FE-web | F-10~F-16 | - | T-F10-01, T-F12-01, T-F13-01 | 수동 확인: 목을 끄고 3상태·확인 흐름. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 지난달 미확인 편지 AC → T-F10-01, T-F12-01. 상태 우선순위 AC → T-F10-01. 스와이프·`확인`·뒤로가기 AC → T-F13-01, T-F13-02. 친구 이름 탭 AC → T-F13-02. 선반 3개/줄 AC → T-F10-02. 월 배지 AC → T-F10-01, T-F10-02. 이름표 AC → T-F10-01, T-F10-02, T-F16-02. 탭바·`+` 노출 AC → T-F10-00, T-F16-02. 비회원 홈 AC → T-F16-01, T-F16-02. 링크 시작 AC → T-F24-02(send-stamp). `내 칭찬판 만들기` AC → T-F16-02, T-F04-03. 연결되지 않은 AC 없음.

## 보류 질문
- 본인이 자기 홈의 이름표를 볼 때 `보낸 칭찬 공개` 적용 여부 (Spec Open Questions)
- 공유 링크 형식·무효 처리, 앱 설치 감지 방식, 회원 판별 신호(웹에서 로그인 세션이 없을 때)
- "이번 달" 시간대 기준 (이 Plan은 서버 KST로 가정), 새 편지 정렬 순서, `New N`의 N이 클 때 표기
- 이름표 가림이 편지 카드(F-13)의 From·메시지에도 적용되는지
- 탈퇴·비회원 발신자의 From 표기와 탭 동작
