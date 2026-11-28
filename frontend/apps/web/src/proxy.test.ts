import { NextRequest } from "next/server";
import { expect, test } from "vitest";

import { SHARE_LINK_MOCK_TOKENS } from "@/mocks/handlers/shareLink";

import { proxy } from "./proxy";

const run = (token: string) =>
  proxy(new NextRequest(`http://localhost/s/${token}`));

test("유효한 토큰은 그대로 통과시킨다", async () => {
  const response = await run(SHARE_LINK_MOCK_TOKENS.valid);

  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-next")).toBe("1");
});

test("존재하지 않는 토큰은 404로 응답한다", async () => {
  expect((await run("unknown")).status).toBe(404);
});

test("탈퇴한 회원의 토큰은 404로 응답한다", async () => {
  expect((await run(SHARE_LINK_MOCK_TOKENS.withdrawn)).status).toBe(404);
});

test("잘못된 퍼센트 인코딩 토큰은 404로 응답한다", async () => {
  expect((await run("%E0%A4%A")).status).toBe(404);
});
