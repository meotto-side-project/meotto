---
name: create-component
description: 프론트엔드(apps/web) UI 컴포넌트 스캐폴딩. components/ui 또는 features 규칙에 맞는 컴포넌트 파일과 Storybook 스토리를 만든다. "컴포넌트 만들어", "UI 컴포넌트" 요청 시 사용.
argument-hint: "<컴포넌트 이름과 용도>"
---

# 컴포넌트 스캐폴딩 (apps/web)

대상: $ARGUMENTS

TIMO 관례를 따른다. 모든 경로는 `frontend/apps/web/` 기준이고 import 별칭은 `@/src/...`다. `apps/mobile`(Expo)에는 이 절차를 쓰지 않는다.

## 시작 전 확인

1. `src/components/ui`, `src/lib/helpers/cn` 등 전제 파일이 실제로 있는지 확인한다. 없으면(현재 Meotto에는 아직 없을 수 있다) 사용자에게 알리고, 필요한 최소 구조(`cn` 헬퍼 등)를 함께 만들지 묻는다.
2. 색상, 간격은 `docs/specs/design-system.md`와 기존 토큰을 확인한다. 임의 값을 쓰지 않는다.
3. Storybook 설치 여부를 확인한다. 미설치면 스토리 파일은 작성하되 실행 검증을 하지 못함을 보고한다.

## 배치 결정

- **범용** (특정 기능에 안 묶임) → `src/components/ui/[Name]/[Name].tsx`. `ui`는 `features`를 참조하지 않는다.
- **기능 전용** → `src/components/features/[feature]/[Name]/[Name].tsx`. 다른 feature에서 직접 import하지 않는다.
- 애매하면 feature 안에 두고, 재사용이 필요해지면 `ui/`로 옮긴다.

## 규칙

- `ComponentProps<'element'>`를 확장해 네이티브 props를 상속한다.
- **default export**.
- 조건부 클래스는 `cn()` (`@/src/lib/helpers/cn`).
- 디자인 토큰만 사용. 배럴(`index.ts`) import 금지, 직접 경로 사용.
- 무거운 컴포넌트는 `next/dynamic`으로 동적 import.
- 인터랙티브 요소에는 접근 가능한 이름(텍스트 또는 `aria-label`)과 시맨틱 태그를 쓴다.

## 컴포넌트 (`[Name].tsx`)

```tsx
import { type ComponentProps } from "react";

import { cn } from "@/src/lib/helpers/cn";

interface ButtonProps extends ComponentProps<"button"> {
  label: string;
  variant?: "primary" | "secondary";
}

const Button = ({
  label,
  variant = "primary",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn("rounded-lg font-medium", className)}
      data-variant={variant}
      {...props}
    >
      {label}
    </button>
  );
};

export default Button;
```

## 스토리 (`[Name].stories.tsx`, 같은 위치)

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "./Button";

const meta = {
  title: "ui/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: "확인", variant: "primary" },
};
```

Storybook 버전에 맞는 import 경로는 설치된 패키지를 보고 맞춘다.

## 검증

`cd frontend && pnpm lint && pnpm check-types`. 인터랙션 테스트가 필요하면 `create-test`로 이어간다.
