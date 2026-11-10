---
name: create-component
description: 프론트엔드 UI 컴포넌트 스캐폴딩(웹 또는 모바일). ui 또는 features 규칙에 맞는 컴포넌트 파일을 만든다. 웹은 Storybook 스토리도 만든다. "컴포넌트 만들어", "UI 컴포넌트" 요청 시 사용.
argument-hint: "<web|mobile> <컴포넌트 이름과 용도>"
---

# 컴포넌트 스캐폴딩

대상: $ARGUMENTS

## 플랫폼

첫 인자(`web` 또는 `mobile`)로 정한다. 없으면 Plan Task의 영역(`FE-web`/`FE-mobile`)에서 확인하고, 그래도 모르면 묻는다. 아래 본문은 **웹**(`frontend/apps/web/`, import 별칭 `@/src/...`) 기준이고, 모바일은 맨 아래 "모바일" 절을 따른다. 규칙은 `.claude/rules/frontend.md`와 플랫폼별 `frontend-web.md`/`frontend-mobile.md`.

## 시작 전 확인

1. `src/components/ui`, `src/lib/helpers/cn` 등 전제 파일이 실제로 있는지 확인한다. 없으면(현재 Meotto에는 아직 없을 수 있다) 사용자에게 알리고, 필요한 최소 구조(`cn` 헬퍼 등)를 함께 만들지 묻는다.
2. 색상, 간격은 `docs/specs/design-system.md`와 기존 토큰을 확인한다. 임의 값을 쓰지 않는다.
3. Storybook 설치 여부를 확인한다. 미설치면 스토리 파일을 만들지 않는다 (`@storybook/*` import가 타입 검사를 깨뜨린다). 스토리를 만들지 못했음을 보고하고 설치는 별도 승인으로 안내한다.

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

## 모바일 (`frontend/apps/mobile/`)

네이티브 화면이 꼭 필요할 때만 쓴다. 웹뷰로 해결되는 화면은 웹에 만든다 (`.claude/rules/frontend.md`의 플랫폼 역할).

`.claude/rules/frontend-mobile.md`를 먼저 읽는다. 스타일 토큰(`src/theme/`)이 아직 없으면 `docs/specs/design-system.md`를 보고 필요한 최소 토큰을 만들지 사용자에게 묻는다. Storybook은 쓰지 않는다.

- 위치: 범용은 `src/components/ui/[Name]/[Name].tsx`, 기능 전용은 `src/components/features/[feature]/[Name]/[Name].tsx`. 라우트(`src/app/`) 안에는 컴포넌트를 두지 않는다.
- 함수형, props 타입 명시, default export. `StyleSheet.create`와 토큰만 사용한다.
- 눌리는 요소에는 `accessibilityRole`, `accessibilityLabel`, 터치 영역 44pt 이상.

```tsx
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const Button = ({ label, onPress, disabled = false }: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.onPrimary },
});

export default Button;
```

import 별칭(`@/theme/tokens`)은 `apps/mobile/tsconfig.json`의 `paths`를 확인해서 맞춘다. 없으면 상대 경로를 쓰고 별칭 추가는 묻는다. 검증은 `cd frontend && pnpm lint && pnpm check-types`이고, 화면에서의 모양은 사람이 시뮬레이터에서 확인한다.
