import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ChevronLeftIcon from "@/components/ui/Icon/ChevronLeftIcon";
import CloseIcon from "@/components/ui/Icon/CloseIcon";
import PencilIcon from "@/components/ui/Icon/PencilIcon";

import IconButton from "./IconButton";

const meta = {
  title: "ui/IconButton",
  component: IconButton,
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Back: Story = {
  args: {
    label: "뒤로가기",
    variant: "back",
    children: <ChevronLeftIcon />,
  },
};

export const Dark: Story = {
  args: {
    label: "프로필 사진 변경",
    variant: "dark",
    children: <PencilIcon className="size-6" />,
  },
};

export const Clear: Story = {
  args: {
    label: "지우기",
    variant: "clear",
    children: <CloseIcon className="size-6" />,
  },
};
