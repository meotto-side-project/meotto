import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "./Button";

const meta = {
  title: "ui/Button",
  component: Button,
  args: { children: "Button" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary", size: "m" } };

export const Destructive: Story = {
  args: { variant: "destructive", size: "m", children: "탈퇴하기" },
};

export const Disabled: Story = { args: { disabled: true } };
