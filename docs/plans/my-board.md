# Plan: 내 칭찬판 (My)

- Spec: docs/specs/my-board.md
- F-ID: F-30 ~ F-35
- 상태: draft
- 선행 Plan: `send-stamp`(F-22) 하드, `home`(F-13) 하드(읽음 처리), `friends`(F-52) 소프트, `mypage-settings` 소프트
- Linear 상위 이슈: (미연동)

## 선행 Plan과 가정
| 선행 | 종류(하드/소프트) | 상태 | 이 Plan이 가정하는 것 |
|---|---|---|---|
| send-stamp (F-22) | 하드 | draft | `stamp`·`stamp_keyword` 테이블과 Entity, 키워드 enum 10종 |
| home (F-13) | 하드 | draft | 일괄 읽음 처리 API `home` C-3, 하단 탭바 공유 컴포넌트(`T-F50-00`) |
| friends (F-52) | 소프트 | draft | F-33 `주고 받은 토마토` 리스트는 `friends` C-4(친구 목록 + 주고받은 수)를 그대로 쓴다 |
| mypage-settings (F-40~F-45) | 소프트 | draft | 우측 상단 `⋯` 버튼이 여는 계정관리 바텀시트(`T-F40-00`) |
| notifications (F-64) | 소프트 | 미작성(순서상 이후) | 칭찬판 상단 인앱 배너는 `notifications` Plan의 `T-F64-02`가 만든다. 이 Plan은 배너 자리만 둔다 |

## 결정 사항
- 없음. 사용자가 답한 질문은 없고 모두 보류로 둔다.

## 기술 설계
- 칭찬판 메인(`C-1`)은 받은 도장 전체 개수와 도장 목록(읽음 여부, 받은 시각)을 준다. 15칸(5×3) 격자 분할과 판 전환은 FE가 한다. 개수는 AC대로 **받은 도장 전체**(파랑 + 빨강)다.
- 칭찬판에 내가 보낸 도장도 보이는지는 Spec의 미해결 질문이다. 이 Plan은 **받은 도장만 격자에 둔다**(AC 문구 기준)고 가정하고, 도장 상세(F-34)의 To/From 표기와 함께 보류로 둔다.
- 많이 받은 칭찬(`C-3`)은 키워드별 받은 횟수 내림차순이다. 상위 N개의 N은 요청 파라미터 `limit`으로 받고 값은 FE가 정한다(Spec에 없음).
- 주고 받은 토마토(F-33)는 새 API 없이 `friends` C-4를 쓴다. 정렬 기준은 Spec에 없어 서버 응답 순서를 그대로 쓴다.
- 배지는 종류·획득 조건이 모두 보류이므로 배지 API와 화면은 전부 보류 Task다. 마스터 데이터(서버) 방식을 전제로 하되 계약은 확정하지 않는다.
- 배지 공유(F-35)는 카카오톡·네이버·저장하기·더보기 동작이 Spec에 없어 보류다. 네이티브 공유 시트가 필요하면 `FE-mobile` 브리지로 나눈다.

## 프론트엔드 범위
- web: 칭찬판 메인(격자, 판 스와이프, 파랑/빨강/빈 도장), 많이 받은 칭찬, 주고 받은 토마토, 도장 상세 카드, 배지 컬렉션·전체 화면·상세 모달·공유 시트
- mobile: 배지 이미지 저장·공유 시트 브리지(보류)

## 백엔드 범위
- 도메인/패키지: `domain/stamp`(받은 도장 조회, 키워드 집계, 도장 상세), `domain/badge`(배지 마스터·획득, 보류)

## 데이터 모델 변경 (승인 필요)
| 대상 | 변경 | 비고 |
|---|---|---|
| `badge`, `member_badge` 테이블 | 신규(예상) | **보류**: 배지 종류와 획득 조건이 정해지기 전에는 스키마를 확정하지 않는다 |

## API 계약
| ID | Method | Path | 인증 | Request | Response | 에러(name) | F-ID | 상태 |
|---|---|---|---|---|---|---|---|---|
| C-1 | GET | /api/board/me | 필요 | - | 200 `{ totalStampCount, stamps: [{ stampId, isRead, receivedAt }] }` | - | F-30 | 확정 |
| C-2 | GET | /api/stamps/{stampId} | 필요 | - | 200 `{ stampId, sentAt, counterpart: { memberId, nickname } \| null, direction: SENT \| RECEIVED, keywords[], message }` | `STAMP_NOT_FOUND`(404), `STAMP_FORBIDDEN`(403) | F-34 | 보류: 도장 상세 To/From 표기, 닫기 방식 |
| C-3 | GET | /api/board/me/top-keywords?limit={n} | 필요 | query `limit` | 200 `[{ keyword, count }]` | - | F-32 | 확정 |
| C-4 | GET | /api/badges | 필요 | - | 200 `[{ badgeId, name, imageUrl, acquired }]` | - | F-31 | 보류: 배지 종류·획득 조건 |
| C-5 | GET | /api/badges/{badgeId} | 필요 | - | 200 `{ badgeId, name, imageUrl, acquired, acquiredReason? }` | `BADGE_NOT_FOUND`(404) | F-31, F-35 | 보류: 배지 종류·획득 조건 |

- 공통: 응답 상태코드와 오류 형식은 backend/CLAUDE.md의 "API 응답 표준"을 따른다 (`{ name, message }`).
- F-33은 `friends` C-4, 읽음 처리는 `home` C-3을 쓴다.
- 새 필드와 경로는 Spec에 없는 설계(제안)이므로 승인 대상이다. 보류 행은 승인 대상이 아니다.

## 구현 순서와 의존성
1. API 계약 표 승인 (`확정` 행: C-1, C-3)
2. 공통 준비 `T-F30-00`
3. BE Task들 ∥ FE Task들(MSW 목)
4. 실서버 연동 확인 `T-F30-99`
5. 보류 Task(배지, 도장 상세, 공유)는 질문 해소 후 `/plan-feature my-board`(갱신)로 계약을 확정한 뒤 시작

## 테스트 전략
- BE: 받은 도장 조회·개수 일치, 키워드 집계(내림차순, `limit`) 단위 테스트
- FE: 컴포넌트·E2E 도구 미설치로 자동 검증은 미검증. 도구 설치 후 격자 경계값(15, 16, 30개), 파랑/빨강 매핑, `확인` 후 색 변화를 스토리 play 함수·E2E로 덮는다
- 사람이 확인할 AC: 흰 테두리·흐림 등 시각 요소, 카카오톡·네이버 공유(실기기, 보류)

## Tasks
| ID | 제목 | 영역 | F-ID / AC | 수정 경로 | 선행 | 검증 방법 | Linear |
|---|---|---|---|---|---|---|---|
| T-F30-00 | 웹 공통 준비: board 쿼리 키·엔드포인트 상수, Zod 스키마, 도장 격자 공유 컴포넌트 | FE-web | F-30~F-35 | frontend/apps/web/src/components/features/board/** | T-F01-00, T-F50-00(friends), 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types | |
| T-F30-01 | 칭찬판 메인 조회 API(C-1) | BE | F-30 AC1~AC2 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 계약 C-1 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F30-02 | 칭찬판 메인 화면(전체 토마토 N, 5×3 격자, 파랑/빨강/빈 도장, 판 스와이프, 읽음 반영) | FE-web | F-30 AC1~AC4 | frontend/apps/web/src/app/(tabs)/board/**, frontend/apps/web/src/components/features/board/main/** | T-F30-00, T-F01-98, 계약 C-1 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F30-03 | 우측 상단 `⋯` → 계정관리 바텀시트 진입 | FE-web | F-30 | frontend/apps/web/src/components/features/board/main/** | T-F30-02, T-F40-00(mypage-settings) | cd frontend && pnpm lint && pnpm check-types. 수동 확인: 시트 열림 | |
| T-F31-01 | 배지 마스터·획득 이력과 목록·상세 API(C-4, C-5) | BE | F-31 | backend/src/main/java/com/meotto/api/domain/badge/** | T-F21-01(send-stamp), 보류: 배지 종류·획득 조건 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F31-02 | 배지 컬렉션(메인 6개 격자, 전체 화면 3열·잠금 타일, 상세 모달) | FE-web | F-31 | frontend/apps/web/src/components/features/board/badge/** | T-F30-00, T-F01-98, 보류: 배지 종류·획득 조건 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F32-01 | 키워드 집계 API(C-3) | BE | F-32 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 계약 C-3 확정 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F32-02 | 많이 받은 칭찬(키워드 칩 상위 N) | FE-web | F-32 | frontend/apps/web/src/components/features/board/keywords/** | T-F30-00, T-F01-98, 계약 C-3 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F33-01 | 주고 받은 토마토 리스트(`friends` C-4 사용) | FE-web | F-33 | frontend/apps/web/src/components/features/board/exchange/** | T-F30-00, T-F01-98, 계약 friends C-4 확정 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F34-01 | 도장 상세 조회 API(C-2) | BE | F-34 | backend/src/main/java/com/meotto/api/domain/stamp/** | T-F21-01(send-stamp), 보류: 도장 상세 To/From 표기, 보낸 칭찬 공개 적용 | cd backend && ./gradlew spotlessCheck checkstyleMain test | |
| T-F34-02 | 도장 탭 시 강조·흐림과 상세 카드 | FE-web | F-34 AC5 | frontend/apps/web/src/components/features/board/detail/** | T-F30-02, 보류: 도장 상세 To/From 표기, 카드 닫는 방법 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F35-01 | 배지 공유 바텀시트(배지 이미지·이름, 공유 대상, `공유하기`) | FE-web | F-35 | frontend/apps/web/src/components/features/board/badge/** | T-F31-02, 보류: 공유 대상별 동작 | cd frontend && pnpm lint && pnpm check-types. 수동 확인: MSW 목 | |
| T-F35-02 | 배지 이미지 저장·공유 시트 브리지 | FE-mobile | F-35 | frontend/apps/mobile/src/** | T-F35-01, 보류: 공유 대상별 동작 | 수동 확인: 실기기. cd frontend && pnpm lint && pnpm check-types | |
| T-F30-99 | 실서버 연동 확인 | FE-web | F-30~F-33 | - | T-F30-01, T-F32-01 | 수동 확인: 목을 끄고 격자·키워드 확인. 목으로만 본 AC는 "실서버 연동 미검증" | |

AC 연결: 전체 토마토 N 일치 AC → T-F30-01, T-F30-02. 파랑/빨강 AC → T-F30-02. `확인` 후 색 변화 AC → `home` T-F13-01, T-F30-02. 15칸 격자 AC → T-F30-02. 도장 탭 상세 AC → T-F34-01, T-F34-02. 연결되지 않은 AC 없음. F-31, F-32, F-33, F-35에는 AC가 없다.

## 보류 질문
- 배지 종류·이름, 획득 조건 (Spec Open Questions 1)
- 도장 상세 카드 `To`/`From` 표기, 내가 보낸 도장도 칭찬판에 보이는지 (Spec Open Questions 2)
- 상세 카드를 닫는 방법 (Spec Open Questions 3)
- 배지 공유 대상별(카카오톡·네이버·저장하기·더보기) 동작, 잠금 배지 공유 가능 여부
- 많이 받은 칭찬 N, 정렬 기준, 빈 상태, 로딩·오류 처리
- `보낸 칭찬 공개`가 도장 상세에 적용되는 방식 (`mypage-settings`, `friends`와 공유)
