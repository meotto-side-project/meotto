import { describe, expect, it } from "vitest";

import {
  handleSchema,
  handleSuggestionResponseSchema,
  signupProfileRequestSchema,
} from "./auth";

describe("handleSchema", () => {
  it.each(["abc", "a.b", "a_b.c9", "a".repeat(30)])("허용: %s", (v) => {
    expect(handleSchema.safeParse(v).success).toBe(true);
  });

  it.each([
    "ab",
    "a".repeat(31),
    ".abc",
    "abc.",
    "a..b",
    "한글아이디",
    "a-b",
    "a b",
  ])("거부: %s", (v) => {
    expect(handleSchema.safeParse(v).success).toBe(false);
  });
});

describe("handleSuggestionResponseSchema", () => {
  it("handle을 파싱한다", () => {
    expect(
      handleSuggestionResponseSchema.parse({ handle: "tomato_1" }),
    ).toEqual({ handle: "tomato_1" });
  });

  it("handle이 없으면 실패한다", () => {
    expect(handleSuggestionResponseSchema.safeParse({}).success).toBe(false);
  });
});

describe("signupProfileRequestSchema", () => {
  it("profileImageUrl은 선택이다", () => {
    expect(
      signupProfileRequestSchema.safeParse({
        nickname: "토마토",
        handle: "abc",
      }).success,
    ).toBe(true);
  });

  it("빈 닉네임은 거부한다", () => {
    expect(
      signupProfileRequestSchema.safeParse({ nickname: "", handle: "abc" })
        .success,
    ).toBe(false);
  });
});
