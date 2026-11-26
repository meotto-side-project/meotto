import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Avatar from "./Avatar";

const meta = {
  title: "ui/Avatar",
  component: Avatar,
  args: { alt: "프로필 사진" },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='%23ee2615'/></svg>",
  },
};
