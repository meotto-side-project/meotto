import type { Metadata } from "next";

import OnboardingCarousel from "@/components/features/onboarding/OnboardingCarousel/OnboardingCarousel";

export const metadata: Metadata = {
  title: "멋토 시작하기",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingCarousel />;
}
