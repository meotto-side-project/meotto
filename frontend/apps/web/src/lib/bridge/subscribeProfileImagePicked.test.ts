import { expect, test, vi } from "vitest";

import { subscribeProfileImagePicked } from "./subscribeProfileImagePicked";

const dispatchOnWindow = (data: unknown) =>
  window.dispatchEvent(new MessageEvent("message", { data }));

test("객체 메시지의 payload를 전달한다", () => {
  const listener = vi.fn();
  const unsubscribe = subscribeProfileImagePicked(listener);

  dispatchOnWindow({
    type: "PROFILE_IMAGE_PICKED",
    payload: { status: "picked", mimeType: "image/jpeg", base64: "abc" },
  });

  expect(listener).toHaveBeenCalledWith({
    status: "picked",
    mimeType: "image/jpeg",
    base64: "abc",
  });
  unsubscribe();
});

test("JSON 문자열 메시지도 처리한다", () => {
  const listener = vi.fn();
  const unsubscribe = subscribeProfileImagePicked(listener);

  dispatchOnWindow(
    JSON.stringify({
      type: "PROFILE_IMAGE_PICKED",
      payload: { status: "cancelled" },
    }),
  );

  expect(listener).toHaveBeenCalledWith({ status: "cancelled" });
  unsubscribe();
});

test("document로 온 메시지도 처리하고, 버블링돼도 한 번만 전달한다", () => {
  const listener = vi.fn();
  const unsubscribe = subscribeProfileImagePicked(listener);

  document.dispatchEvent(
    new MessageEvent("message", {
      bubbles: true,
      data: { type: "PROFILE_IMAGE_PICKED", payload: { status: "denied" } },
    }),
  );

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({ status: "denied" });
  unsubscribe();
});

test.each([
  "not json",
  null,
  { type: "OTHER", payload: { status: "cancelled" } },
  { type: "PROFILE_IMAGE_PICKED", payload: { status: "unknown" } },
  {
    type: "PROFILE_IMAGE_PICKED",
    payload: { status: "picked", mimeType: "image/jpeg" },
  },
])("형식이 맞지 않으면 무시한다: %j", (data) => {
  const listener = vi.fn();
  const unsubscribe = subscribeProfileImagePicked(listener);

  dispatchOnWindow(data);

  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});

test("구독을 해제하면 더 이상 전달하지 않는다", () => {
  const listener = vi.fn();
  const unsubscribe = subscribeProfileImagePicked(listener);
  unsubscribe();

  dispatchOnWindow({
    type: "PROFILE_IMAGE_PICKED",
    payload: { status: "error" },
  });

  expect(listener).not.toHaveBeenCalled();
});
