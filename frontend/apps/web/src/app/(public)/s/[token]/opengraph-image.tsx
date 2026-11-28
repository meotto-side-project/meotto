import { ImageResponse } from "next/og";

export const alt = "멋토";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 기본 폰트에는 한글이 없어 영문 로고 문구만 그린다. 색은 globals.css의 tomato 토큰과 같다.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ee2615",
        color: "#ffffff",
        fontSize: 160,
        fontWeight: 700,
        letterSpacing: 8,
      }}
    >
      MEOTTO
    </div>,
    size,
  );
}
