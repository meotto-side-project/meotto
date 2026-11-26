import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import OnboardingCarousel from "./OnboardingCarousel";

const meta = {
  title: "features/onboarding/OnboardingCarousel",
  component: OnboardingCarousel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
