---
name: create-e2e
description: 프론트엔드 E2E 테스트 작성. 웹은 @playwright/test, 모바일은 Maestro로 핵심 유저 여정을 검증한다. "e2e 작성", "플로우 테스트", "playwright", "maestro" 요청 시 사용.
argument-hint: "<web|mobile> <검증할 사용자 여정 또는 F-ID>"
---

# E2E 테스트

대상: $ARGUMENTS

첫 인자(`web` 또는 `mobile`)로 정한다. 없으면 묻는다. 아래 본문은 **웹**(Playwright) 기준이고 모바일은 맨 아래 "모바일" 절을 따른다.

테스트는 `frontend/apps/web/e2e/*.spec.ts`에 둔다. **핵심 여정만** 쓴다. 컴포넌트 단위 검증은 `create-test`.

## 시작 전 확인 (중요)

Playwright는 웹 앱에 설치되어 있다. 브라우저가 없다는 에러가 나면 `cd frontend/apps/web && pnpm exec playwright install chromium`을 안내한다 (다운로드라 사용자 승인 후 실행). 실행하지 못한 테스트를 통과로 보고하지 않는다.

## 설정 (`frontend/apps/web/playwright.config.ts`)

- `testDir: './e2e'`, `baseURL: http://localhost:3000`, 브라우저는 chromium.
- `webServer`가 서버를 띄운다. 로컬은 `pnpm dev`, `CI` 환경은 프로덕션 빌드(`pnpm build && pnpm start`).
- `webServer`는 `NEXT_PUBLIC_API_MOCKING=enabled`로 뜬다. 백엔드 없이 MSW 핸들러(`src/mocks/handlers/[feature].ts`)가 서버 컴포넌트와 브라우저 요청 모두에 응답한다. 시나리오에 필요한 응답이 핸들러에 없으면 `create-api-hook`의 목 핸들러 단계로 먼저 추가한다.
- 로컬에서 3000 포트에 서버가 이미 떠 있으면 Playwright가 그 서버를 재사용한다. 그 서버가 목 없이 떠 있으면 MSW가 꺼진 상태로 테스트된다. 결과가 이상하면 기존 dev 서버를 끄고 다시 실행한다.
- MSW 워커가 켜져 있으면 브라우저 요청을 워커가 먼저 가로채므로 `page.route()`로 응답을 바꿀 수 없다(Playwright 문서의 Service Worker 제약).
- 특정 테스트에서만 브라우저 요청 응답을 바꾸려면 그 테스트에서 워커를 끄고 `page.route()`를 쓴다: `test.use({ serviceWorkers: "block" })`. 이때 그 테스트의 브라우저 요청은 MSW를 거치지 않으므로 필요한 응답을 모두 `page.route()`로 준다. 워커 등록이 막혀 서버 로그에 `[MSW] Failed to register the Service Worker`가 찍히는데, 테스트 결과에는 영향이 없다.
- 서버 컴포넌트의 요청은 `page.route()`로 가로챌 수 없다. 에러·빈 응답 같은 케이스는 계약에 있는 에러 응답을 MSW 핸들러에 만들어 두고(예: 특정 ID 요청이면 404) 그 경로로 진입해 검증한다.
- `playwright`와 `@playwright/test` 버전은 반드시 일치시킨다 (다르면 `test.describe did not expect...` 에러).

## 패턴

```ts
import { expect, test } from "@playwright/test";

test.describe("인증 리다이렉트", () => {
  test("비로그인으로 홈 접근 시 온보딩으로 이동", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding/);
  });
});
```

### 규칙

- 요소는 역할과 접근 이름으로 찾는다: `page.getByRole("button", { name })`.
- 단언은 web-first (`await expect(locator).toBeVisible()`), 자동 재시도에 맡긴다. 임의 `waitForTimeout` 금지.
- 이동은 `page.goto("/경로")` (baseURL 상대).
- 시나리오는 Spec의 AC에서 가져온다. 기대 결과를 Spec에서 확인할 수 없으면 만들지 않고 질문한다.
- 데이터를 바꾸는 요청은 모킹한다. 공용 계정이나 실제 데이터를 변경하지 않는다.
- 인증은 쿠키 주입이나 `storageState` 재사용. 인증 방식이 아직 구현 전이면 비로그인 시나리오만 쓴다.

## 실행과 검증

```bash
cd frontend/apps/web
pnpm exec playwright test            # 헤드리스
pnpm exec playwright test e2e/xxx.spec.ts
```

작성 후 **실제 통과를 확인**한다. 실행하지 못했으면 미검증으로 보고한다.

## 모바일 (`frontend/apps/mobile/`)

Maestro로 시뮬레이터/에뮬레이터의 앱을 조작해 검증한다. 흐름 파일은 `frontend/apps/mobile/.maestro/*.yaml`.

**시작 전 확인**: `maestro --version`이 동작하고 실행 가능한 시뮬레이터가 있는지 본다. **없으면 작성하지 말고 멈춘다.** Maestro CLI 설치와 시뮬레이터 설정은 별도 승인 작업이다. 실행하지 못한 흐름을 통과로 보고하지 않는다.

```yaml
appId: com.meotto.app
---
- launchApp
- assertVisible: "멋토 시작하기"
- tapOn: "멋토 시작하기"
```

- 요소는 화면에 보이는 텍스트나 접근성 라벨(`accessibilityLabel`)로 찾는다. 좌표 탭 금지.
- 시나리오는 Spec의 AC에서 가져온다. 기대 결과를 Spec에서 확인할 수 없으면 만들지 않고 질문한다.
- `appId`는 `app.json`의 실제 bundle identifier로 맞춘다.
- 실행: `maestro test frontend/apps/mobile/.maestro/xxx.yaml`. 소셜 로그인, 푸시 알림 수신 등은 자동화 대상이 아니라 사람이 확인한다.
