import type { Metadata } from "next";

import SignupProfileScreen from "@/components/features/auth/components/SignupProfileScreen";

export const metadata: Metadata = {
  title: "프로필 설정 | 멋토",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <SignupProfileScreen />;
}
