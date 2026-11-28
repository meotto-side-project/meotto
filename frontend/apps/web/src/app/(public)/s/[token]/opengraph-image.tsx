import { ImageResponse } from "next/og";

import { LOGO_SOLID_PATH } from "@/components/ui/Logo/Logo";
import {
  TOMATO_BODY_PATH,
  TOMATO_LEAF_PATH,
  TOMATO_LEAF_TRANSFORM,
} from "@/components/ui/TomatoSymbol/TomatoSymbol";

export const alt = "멋토";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og는 Tailwind 클래스를 쓸 수 없어 globals.css 토큰(gray-50, logo-red, green)의 값을 직접 쓴다.
const COLORS = {
  background: "#f3f3fa",
  logoRed: "#e8392a",
  green: "#3b8301",
} as const;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background: COLORS.background,
      }}
    >
      <svg width={300} height={249} viewBox="0 0 95.6325 79.3236">
        <path d={TOMATO_BODY_PATH} fill={COLORS.logoRed} />
        <path
          d={TOMATO_LEAF_PATH}
          transform={TOMATO_LEAF_TRANSFORM}
          fill={COLORS.green}
        />
      </svg>
      <svg width={590} height={164} viewBox="0 0 359 99.5908">
        <path d={LOGO_SOLID_PATH} fill={COLORS.logoRed} />
      </svg>
    </div>,
    size,
  );
}
