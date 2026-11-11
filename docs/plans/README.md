# Plan 인덱스

Spec(`docs/specs/`)마다 하나의 Plan이 있다. 설계, API 계약, Tasks는 각 Plan 파일이 기준이다. 규칙은 `.claude/rules/specs.md`.

| Plan | 상태 | 선행 Plan (하드 / 소프트) | Linear 상위 이슈 |
|---|---|---|---|
| [auth-onboarding](auth-onboarding.md) F-01~F-04 | approved | 없음 / send-stamp(F-24), home | FE MEO-43, BE MEO-26 |
| [mypage-settings](mypage-settings.md) F-40~F-45 | draft | auth-onboarding(F-03) / auth-onboarding(F-04), my-board, stamp·friend 도메인 | (미연동) |
| [friends](friends.md) F-50~F-54 | draft | auth-onboarding(F-03), mypage-settings(F-40, F-42), stamp 도메인(집계) / send-stamp(F-21), my-board | (미연동) |
| [send-stamp](send-stamp.md) F-20~F-24 | draft | auth-onboarding(F-03, F-04), friends(F-51, F-52) / home, notifications(F-60) | (미연동) |
| [home](home.md) F-10~F-14, F-16 | draft | send-stamp(F-22, F-24), auth-onboarding(F-03), friends(F-53) / mypage-settings(F-42, F-43), my-board | (미연동) |
| [my-board](my-board.md) F-30~F-35 | draft | send-stamp(F-22), home(F-13) / friends(F-52), mypage-settings, notifications(F-64) | (미연동) |
| [notifications](notifications.md) F-60, F-62~F-64 | draft | send-stamp(F-22), mypage-settings(F-42), auth-onboarding(F-03), home(F-13), my-board(F-30) | (미연동) |

`design-system`은 구현 대상이 아닌 참조 문서라 Plan이 없다. `notifications`의 F-61(찌르기)은 다음 MVP라 Plan에서 제외했다.

## 권장 구현 순서

auth-onboarding → mypage-settings → friends → send-stamp → home → my-board → notifications

- 서로 얽힌 부분은 선행 Plan의 가정으로 적었고, 선행 Plan이 구현되면 가정 재검증은 `/implement-feature` 시점에 확인한다.
  - `auth-onboarding` F-04 ↔ `send-stamp` F-24 ↔ `mypage-settings` F-41 (공유 링크)
  - `friends` F-53 ↔ `my-board` (칭찬판 컴포넌트)
  - `friends` F-52, `mypage-settings` F-43 ↔ `send-stamp` (`stamp` 테이블)
- MSW 구성은 저장소에서 한 번만 두며 `auth-onboarding`의 `T-F01-98`이다. 다른 Plan의 FE-web Task는 이 Task를 선행으로 둔다.
- 하단 탭바 공유 컴포넌트는 `friends`의 `T-F50-00`에서 만들고 `home`, `my-board`가 쓴다.

## 보류 항목 요약

Plan 승인 전에 정하면 보류 Task가 풀린다. 상세는 각 Plan의 "보류 질문".

| 영역 | 질문 | 막는 Plan / Task |
|---|---|---|
| 인증 | 로그인 상태 유지 방식, 스플래시 분기 | auth-onboarding T-F01-01, T-F03-02, T-F03-05~07, mypage-settings T-F44-01~02 |
| 인증 | 닉네임·아이디 제한, 가입 실패·계정 통합 | auth-onboarding T-F03-04, T-F03-06, mypage-settings T-F40-02~03 |
| 공유 링크 | 형식, 무효·만료, 앱 설치 감지, 비회원 남용 방지·이름 | auth-onboarding T-F04-01~03, mypage-settings T-F41-01~02, send-stamp T-F24-01~02, home T-F16-01~02 |
| 공개 정책 | `보낸 칭찬 공개` 보는 사람별 적용·숨기는 범위, 제한 화면 노출, 본인 열람 | mypage-settings T-F43-02, friends T-F53-02, T-F53-04, my-board T-F34-01~02 |
| 탈퇴 | 탈퇴 시 도장 처리 | mypage-settings T-F45-01 |
| 친구 | 추천 친구 기준 | friends T-F50-03~04 |
| 도장 | 메시지 최대 글자 수 | send-stamp T-F21-02 |
| 칭찬판 | 배지 종류·획득 조건, To/From 표기, 상세 카드 닫기, 공유 대상 | my-board T-F31-01~02, T-F34-01~02, T-F35-01~02 |
| 알림 | F-63 발송 시각·광고성(`[논의 필요]` 2건), F-60 탭 이동, 배너 읽음 기준·닫음 저장, 알림 기본값 | notifications T-F60-02~03, T-F63-01, T-F64-01~02 |
