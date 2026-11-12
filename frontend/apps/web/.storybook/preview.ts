import "../src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
  },
};

export default preview;
