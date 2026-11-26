# Plan 인덱스

Spec(`docs/specs/`)마다 하나의 Plan이 있다. 설계, API 계약, Tasks는 각 Plan 파일이 기준이다. 규칙은 `.claude/rules/specs.md`.

| Plan | 상태 | 선행 Plan (하드 / 소프트) | Linear 상위 이슈 |
|---|---|---|---|
| [auth-onboarding](auth-onboarding.md) F-01~F-04 | approved | 없음 / send-stamp(F-24), home | FE MEO-43, BE MEO-26 |
| [mypage-settings](mypage-settings.md) F-40~F-45 | approved | auth-onboarding(F-03) / auth-onboarding(F-04), my-board, stamp·friend 도메인 | FE MEO-64, BE MEO-65 |

`design-system`은 구현 대상이 아닌 참조 문서라 Plan이 없다. `friends`, `send-stamp`, `home`, `my-board`, `notifications`는 아직 Plan을 쓰지 않았다(`/plan-feature`로 하나씩 새로 작성한다).

## 권장 구현 순서

auth-onboarding → mypage-settings → (이후 Plan은 `/plan-feature` 실행 시점에 정한다)

- 서로 얽힌 부분은 선행 Plan의 가정으로 적었고, 선행 Plan이 구현되면 가정 재검증은 `/implement-feature` 시점에 확인한다.
- MSW 구성은 저장소에서 한 번만 두며 `auth-onboarding`의 `T-F01-98`이다. 다른 Plan의 FE-web Task는 이 Task를 선행으로 둔다.

## 보류 항목 요약

Plan 승인 전에 정하면 보류 Task가 풀린다. 상세는 각 Plan의 "보류 질문".

| 영역 | 질문 | 막는 Plan / Task |
|---|---|---|
| 인증 | 스플래시 분기, 소셜 토큰 요청 브리지 계약. 로그인 상태 유지는 확정: 토큰은 HttpOnly 쿠키, 네이티브는 로그인 플래그만 저장. 백엔드 토큰 전달 방식은 확정: `access_token`/`refresh_token` HttpOnly 쿠키, 응답 본문에는 토큰 값이 없고 `needsProfileSetup`·`memberId`만 있음. 로그아웃 API(C-7)는 구현됨 | auth-onboarding T-F01-01, T-F03-05~07 |
| 인증 | 미완료 회원의 다른 API 접근 제한(BE 확인), 사진 선택 브리지 계약(파일 전달 방식), 오류·토스트 문구, 소셜 계정 통합 (닉네임 2~10자, 아이디(handle) 3~30자·변경 불가, 사진 10MB·`jpg/png/webp/heic`은 확정) | auth-onboarding T-F03-04, T-F03-06, mypage-settings T-F40-03~04 |
| 공유 링크 | 형식, 무효·만료, 앱 설치 감지, 비회원 남용 방지·이름 | auth-onboarding T-F04-01~03, mypage-settings T-F41-01~02 |
| 공개 정책 | `보낸 칭찬 공개` 보는 사람별 적용·숨기는 범위, 제한 화면 노출, 본인 열람 | mypage-settings T-F43-02 |
| 탈퇴 | 탈퇴 시 도장 처리 | mypage-settings T-F45-01 |
