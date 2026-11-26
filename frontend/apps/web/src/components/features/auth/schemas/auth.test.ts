import { describe, expect, it } from "vitest";

import {
  handleSchema,
  handleSuggestionResponseSchema,
  memberMeResponseSchema,
  nicknameSchema,
  profileImageResponseSchema,
  signupProfileRequestSchema,
} from "./auth";

describe("nicknameSchema", () => {
  it.each([
    "토마토",
    "ab",
    "가나",
    "a".repeat(10),
    "한글 abc 12",
    "가".repeat(10),
  ])("허용: %s", (v) => {
    expect(nicknameSchema.safeParse(v).success).toBe(true);
  });

  it.each([
    "",
    "a",
    "a".repeat(11),
    "가".repeat(11),
    "토마토!",
    "tom_ato",
    "토마토🍅",
    "ㅏㅏ",
    "a\nb",
  ])("거부: %s", (v) => {
    expect(nicknameSchema.safeParse(v).success).toBe(false);
  });
});

describe("handleSchema", () => {
  it.each(["abc", "a.b", "a_b.c9", "a.b.c", "_._", "a".repeat(30)])(
    "허용: %s",
    (v) => {
      expect(handleSchema.safeParse(v).success).toBe(true);
    },
  );

  it.each([
    "",
    "ab",
    "a.",
    "a".repeat(31),
    ".abc",
    "abc.",
    "a..b",
    "...",
    "abc\n",
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

  it.each(["", "a", "토마토!"])("이름 규칙 위반은 거부한다: %s", (nickname) => {
    expect(
      signupProfileRequestSchema.safeParse({ nickname, handle: "abc" }).success,
    ).toBe(false);
  });

  it("아이디 규칙 위반은 거부한다", () => {
    expect(
      signupProfileRequestSchema.safeParse({
        nickname: "토마토",
        handle: "a..b",
      }).success,
    ).toBe(false);
  });
});

describe("memberMeResponseSchema", () => {
  const me = {
    id: 1,
    nickname: "토마토",
    handle: null,
    profileImageUrl: null,
    notificationEnabled: true,
    boardPublic: true,
    sentPraiseVisibility: "ALL",
    profileCompleted: false,
  };

  it("handle과 profileImageUrl은 null일 수 있다", () => {
    expect(memberMeResponseSchema.parse(me)).toEqual(me);
  });

  it("sentPraiseVisibility가 계약 밖이면 실패한다", () => {
    expect(
      memberMeResponseSchema.safeParse({ ...me, sentPraiseVisibility: "X" })
        .success,
    ).toBe(false);
  });
});

describe("profileImageResponseSchema", () => {
  it("imageUrl이 없으면 실패한다", () => {
    expect(profileImageResponseSchema.safeParse({}).success).toBe(false);
  });
});
