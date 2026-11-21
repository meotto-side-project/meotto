import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Logo from "./Logo";

const meta = {
  title: "ui/Logo",
  component: Logo,
  args: { className: "w-64" },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Black: Story = { args: { className: "w-64 text-black" } };

export const White: Story = {
  args: { className: "w-64 text-white" },
  decorators: [
    (Story) => (
      <div className="bg-black p-6">
        <Story />
      </div>
    ),
  ],
};

export const Outline: Story = {
  args: { variant: "outline", className: "w-64" },
  decorators: [
    (Story) => (
      <div className="bg-sky p-6">
        <Story />
      </div>
    ),
  ],
};
