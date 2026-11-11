import type { AnyHandler } from "msw";

// 기능별 핸들러는 src/mocks/handlers/[feature].ts에 두고 이 목록에만 추가한다.
// browser.ts(개발)와 server.ts(서버 컴포넌트·테스트)가 이 목록을 함께 쓴다.
export const handlers: AnyHandler[] = [];
