import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextField from "./TextField";

const meta = {
  title: "ui/TextField",
  component: TextField,
  args: {
    label: "이름",
    required: true,
    placeholder: "이름을 입력해주세요.",
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { label: "멋토 아이디", defaultValue: "Meotto", onClear: () => {} },
};

export const WithError: Story = {
  args: {
    defaultValue: "a",
    error: "이름은 2~10자의 한글, 영문, 숫자, 공백만 쓸 수 있어요.",
  },
};
