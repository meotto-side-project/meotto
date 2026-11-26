import { expect, test } from "vitest";

import { base64ToFile } from "./base64ToFile";

test("base64를 지정한 이름과 MIME 타입의 파일로 바꾼다", async () => {
  const file = base64ToFile(btoa("hello"), "image/jpeg", "profile.jpg");

  expect(file.name).toBe("profile.jpg");
  expect(file.type).toBe("image/jpeg");
  expect(file.size).toBe(5);
  expect(await file.text()).toBe("hello");
});

test("base64가 아니면 예외를 던진다", () => {
  expect(() => base64ToFile("***", "image/jpeg", "profile.jpg")).toThrow();
});
