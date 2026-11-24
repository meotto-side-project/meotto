import { afterEach, expect, test, vi } from "vitest";

import { postToNative } from "./postToNative";

afterEach(() => {
  delete window.ReactNativeWebView;
});

test("웹뷰 안이면 메시지를 JSON 문자열로 네이티브에 보낸다", () => {
  const postMessage = vi.fn();
  window.ReactNativeWebView = { postMessage };

  postToNative({ type: "AUTH_LOGIN_SUCCESS" });

  expect(postMessage).toHaveBeenCalledWith(
    JSON.stringify({ type: "AUTH_LOGIN_SUCCESS" }),
  );
});

test("일반 브라우저면 아무 일도 하지 않는다", () => {
  expect(() => postToNative({ type: "AUTH_LOGIN_SUCCESS" })).not.toThrow();
});
