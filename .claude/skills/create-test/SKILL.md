---
name: create-test
description: 프론트엔드 컴포넌트 테스트 작성. 웹은 Storybook play 함수(+Vitest), 모바일은 jest-expo + React Native Testing Library. "테스트 작성", "인터랙션 테스트" 요청 시 사용.
argument-hint: "<web|mobile> <컴포넌트 경로>"
---

# 컴포넌트 테스트

대상: $ARGUMENTS

첫 인자(`web` 또는 `mobile`)로 정한다. 없으면 대상 경로로 판단하고, 애매하면 묻는다. 아래 본문은 **웹**(Storybook + Vitest) 기준이고 모바일은 맨 아래 "모바일" 절을 따른다.

웹은 별도 `*.test.tsx` 대신 **스토리에 테스트를 얹는다.**

## 시작 전 확인 (중요)

`frontend/apps/web/package.json`에 `storybook`, `@storybook/addon-vitest`, `vitest`가 있는지 확인한다.

**없으면 테스트를 작성하지 말고 멈춘다.** 도구 설치와 설정은 별도 작업이며 의존성 추가는 승인이 필요하다. 사용자에게 "Storybook+Vitest 미설치로 컴포넌트 테스트 실행 불가"를 알리고, 설치를 진행할지 묻는다. 실행하지 못한 테스트를 작성만 하고 통과로 보고하지 않는다.

## 두 종류

1. **렌더 스모크**: 스토리(`*.stories.tsx`)가 있으면 애드온이 자동으로 렌더 테스트로 실행한다.
2. **인터랙션**: 스토리에 `play` 함수를 추가해 클릭, 입력 등을 검증한다.

## 인터랙션 패턴

`storybook/test`에서 `fn`, `userEvent`, `within`, `expect`를 가져온다 (`@storybook/test` 아님, Storybook 10 기준. 설치된 버전에 맞춘다).

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import Button from "./Button";

const meta = {
  title: "ui/Button",
  component: Button,
  args: { label: "확인" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "확인" }));

    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

### 규칙

- 콜백은 `fn()` 스파이를 `args`로 주입하고 `play`에서 호출 여부를 단언한다.
- 요소는 역할과 접근 이름으로 찾는다 (`getByRole("button", { name })`). 접근성도 함께 검증된다.
- `userEvent`, `expect`는 `await` 한다.
- 폼: `userEvent.type` 후 제출 버튼 클릭 → 결과 단언.
- 테스트 대상은 Spec의 AC에 해당하는 동작이다. AC에 없는 구현 세부를 단언하지 않는다.

## 실행과 검증

```bash
cd frontend/apps/web
pnpm exec vitest run --project storybook [ComponentName]
pnpm exec vitest run --project storybook
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
