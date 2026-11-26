import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Toast from "./Toast";

const meta = {
  title: "ui/Toast",
  component: Toast,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: { message: "잠시 후 다시 시도해 주세요." },
};
