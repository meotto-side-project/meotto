import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "멋토",
  description: "토마토 도장으로 전하는 마음",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
