import type { Metadata } from "next";

import LoginScreen from "@/components/features/auth/components/LoginScreen";

export const metadata: Metadata = {
  title: "로그인 | 멋토",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginScreen />;
}
