import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // 핸들러와 요청이 같은 API 주소를 쓰도록 테스트 전용 값을 고정한다.
    // .test는 예약 도메인이라 실제 네트워크로 나갈 수 없다.
    env: { NEXT_PUBLIC_API_URL: "https://api.test" },
  },
});
