import "../src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";

import { poppins } from "../src/lib/fonts";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className={poppins.variable}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
