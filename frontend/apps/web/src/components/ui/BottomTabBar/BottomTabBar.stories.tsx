import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BottomTabBar from "./BottomTabBar";

const meta = {
  title: "ui/BottomTabBar",
  component: BottomTabBar,
  args: { onSelect: () => {} },
} satisfies Meta<typeof BottomTabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Home: Story = { args: { activeTab: "home" } };

export const My: Story = { args: { activeTab: "my" } };

export const Friend: Story = { args: { activeTab: "friend" } };
