---
name: create-e2e
description: 프론트엔드(apps/web) E2E 테스트 작성. @playwright/test로 핵심 유저 여정을 실제 브라우저에서 검증한다. "e2e 작성", "플로우 테스트", "playwright" 요청 시 사용.
argument-hint: "<검증할 사용자 여정 또는 F-ID>"
---

# E2E 테스트 (@playwright/test)

대상: $ARGUMENTS

TIMO와 같은 도구를 쓴다. 테스트는 `frontend/apps/web/e2e/*.spec.ts`에 둔다. **핵심 여정만** 쓴다. 컴포넌트 단위 검증은 `create-test`.

## 시작 전 확인 (중요)

`playwright.config.ts`, `@playwright/test` 설치 여부를 확인한다. **없으면 작성하지 말고 멈춘다.** 설치, 설정, 브라우저 다운로드는 별도 승인 작업이다. "Playwright 미설치로 E2E 실행 불가"를 알리고 설치 진행 여부를 묻는다. 실행하지 못한 테스트를 통과로 보고하지 않는다.

설치되어 있어도 앱 실행에 백엔드가 필요하다. 백엔드가 준비되지 않았으면 `page.route()`로 API를 모킹하는 시나리오로 한정한다.

## 설정 (TIMO 기준, 설치 후 확인)

- `testDir: './e2e'`, `baseURL: http://localhost:3000`, `webServer`가 `pnpm dev`를 기동.
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
