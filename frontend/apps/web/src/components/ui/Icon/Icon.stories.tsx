import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BellIcon from "./BellIcon";
import ChevronLeftIcon from "./ChevronLeftIcon";
import CloseIcon from "./CloseIcon";
import DownloadIcon from "./DownloadIcon";
import EmojiIcon from "./EmojiIcon";
import HomeIcon from "./HomeIcon";
import StarIcon from "./StarIcon";

const meta = {
  title: "ui/Icon",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const outline = [
  ["Home", HomeIcon],
  ["Star", StarIcon],
  ["Emoji", EmojiIcon],
  ["Bell", BellIcon],
  ["Download", DownloadIcon],
  ["Close", CloseIcon],
  ["ChevronLeft", ChevronLeftIcon],
] as const;

const filled = [
  ["Home", HomeIcon],
  ["Star", StarIcon],
  ["Emoji", EmojiIcon],
] as const;

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-black">
      <ul className="flex flex-wrap gap-6">
        {outline.map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-2">
            <Icon />
            <span className="text-caption">{name}</span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-6">
        {filled.map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-2">
            <Icon filled />
            <span className="text-caption">{name} filled</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};
