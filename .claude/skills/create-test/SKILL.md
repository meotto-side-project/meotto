---
name: create-test
description: 프론트엔드 단위·컴포넌트 테스트 작성. 웹은 Vitest + React Testing Library, 모바일은 jest-expo + React Native Testing Library. "테스트 작성", "인터랙션 테스트", "훅 테스트" 요청 시 사용.
argument-hint: "<web|mobile> <대상 경로>"
---

# 단위·컴포넌트 테스트

대상: $ARGUMENTS

첫 인자(`web` 또는 `mobile`)로 정한다. 없으면 대상 경로로 판단하고, 애매하면 묻는다. 아래 본문은 **웹**(Vitest + React Testing Library) 기준이고 모바일은 맨 아래 "모바일" 절을 따른다.

웹은 컴포넌트, 훅, Zod 스키마, 유틸을 모두 Vitest로 테스트한다. Storybook은 문서용이며 스토리에 `play` 테스트를 쓰지 않는다.

## 구성 (설치됨)

- 설정: `frontend/apps/web/vitest.config.mts` (jsdom, `src/**/*.test.{ts,tsx}`)
- 셋업: `src/test/setup.ts`. jest-dom 매처를 등록하고, MSW node 서버(`src/mocks/server.ts`)를 `onUnhandledFrame: "error"`로 띄운다. 핸들러가 없는 요청은 테스트 실패가 된다.
- 파일 위치: 대상 옆 `[Name].test.ts(x)`
- `vitest`는 `globals`를 쓰지 않는다. `describe`, `it`, `expect`, `vi`는 `vitest`에서 import한다.

## 컴포넌트 패턴

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import Button from "@/components/ui/Button";

it("누르면 onClick이 호출된다", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(<Button label="확인" onClick={onClick} />);
  await user.click(screen.getByRole("button", { name: "확인" }));

  expect(onClick).toHaveBeenCalledOnce();
});
```

## API를 쓰는 훅·컴포넌트

응답은 MSW 핸들러(`src/mocks/handlers/[feature].ts`)가 준다. 테스트별로 다른 응답(에러, 빈 목록)이 필요하면 `server.use()`로 덮어쓴다. `setup.ts`가 테스트마다 `resetHandlers()`를 하므로 덮어쓴 핸들러는 다음 테스트에 남지 않는다.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { expect, it } from "vitest";

import { server } from "@/mocks/server";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

it("서버 에러면 error 상태가 된다", async () => {
  server.use(
    http.get(`${process.env.NEXT_PUBLIC_API_URL}/stamps`, () =>
      HttpResponse.json({ name: "INTERNAL", message: "x" }, { status: 500 }),
    ),
  );

  const { result } = renderHook(() => useStampList(), { wrapper });

  await waitFor(() => expect(result.current.isError).toBe(true));
});
```

- `QueryClient`는 테스트마다 새로 만들고 `retry: false`로 둔다 (재시도 때문에 테스트가 느려지거나 결과가 바뀌지 않게).
- MSW 3 API다. 기억으로 쓰지 말고 `node_modules/msw`의 타입을 확인한다 (예: `onUnhandledRequest`가 아니라 `onUnhandledFrame`).

### 규칙

- 요소는 역할과 접근 이름으로 찾는다 (`getByRole("button", { name })`). 접근성도 함께 검증된다. `getByTestId`는 다른 방법이 없을 때만 쓴다.
- 사용자 입력은 `fireEvent` 대신 `userEvent.setup()`을 쓰고 `await` 한다.
- 비동기 결과는 `findBy*` 또는 `waitFor`로 기다린다. 임의 지연(`setTimeout`) 금지.
- 테스트 대상은 Spec의 AC에 해당하는 동작이다. AC에 없는 구현 세부(내부 state, 클래스명)를 단언하지 않는다.
- `async` 서버 컴포넌트는 Vitest가 지원하지 않는다(Next 문서). E2E(`create-e2e`)로 검증한다.

## 실행과 검증

```bash
cd frontend/apps/web
pnpm exec vitest run src/path/Name.test.tsx   # 파일 하나
pnpm test                                      # 전체 (frontend/에서 실행하면 turbo로 전체 앱)
```

작성 후 위 명령으로 **실제 통과를 확인**하고, `cd frontend && pnpm check-types`도 통과해야 한다. 접근성 전수 감사는 `a11y-audit` 에이전트를 쓴다.

## 모바일 (`frontend/apps/mobile/`)

`jest-expo`와 `@testing-library/react-native`로 컴포넌트·훅을 테스트한다. 테스트 파일은 대상 옆의 `[Name].test.tsx`.

**시작 전 확인**: `apps/mobile/package.json`에 `jest`, `jest-expo`, `@testing-library/react-native`가 있는지 본다. **없으면 작성하지 말고 멈춘다.** 설치는 `npx expo install jest-expo jest @types/jest`와 `@testing-library/react-native` 추가를 포함한 별도 승인 작업이다. 실행하지 못한 테스트를 통과로 보고하지 않는다.

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";

import Button from "./Button";

describe("Button", () => {
  it("누르면 onPress가 호출된다", () => {
    const onPress = jest.fn();

    render(<Button label="확인" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "확인" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- 요소는 역할과 접근 이름(`getByRole`)으로 찾는다. 접근성도 함께 검증된다.
- 네이티브 모듈은 목킹한다. 제스처·애니메이션의 실제 느낌은 자동 테스트 대상이 아니고 사람이 확인한다.
- 실행: `cd frontend/apps/mobile && pnpm exec jest [파일]`. 작성 후 **실제 통과를 확인**한다.
