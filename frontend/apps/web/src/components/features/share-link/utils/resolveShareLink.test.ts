import { expect, test } from "vitest";

import { SHARE_LINK_MOCK_TOKENS } from "@/mocks/handlers/shareLink";

import { resolveShareLink } from "./resolveShareLink";

test("유효한 토큰이면 받는 사람 정보를 돌려준다", async () => {
  expect(await resolveShareLink(SHARE_LINK_MOCK_TOKENS.valid)).toEqual({
    receiverId: 1,
    receiverNickname: "멋토",
  });
});

test("존재하지 않는 토큰(404)이면 null이다", async () => {
  expect(await resolveShareLink("unknown")).toBeNull();
});

test("탈퇴한 회원의 토큰(410)이면 null이다", async () => {
  expect(await resolveShareLink(SHARE_LINK_MOCK_TOKENS.withdrawn)).toBeNull();
});
