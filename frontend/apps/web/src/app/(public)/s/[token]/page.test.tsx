import { expect, test, vi } from "vitest";

import { SHARE_LINK_MOCK_TOKENS } from "@/mocks/handlers/shareLink";

import ShareLinkPage, { generateMetadata } from "./page";

const { redirect, notFound } = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ redirect, notFound }));

const render = (token: string) =>
  ShareLinkPage({ params: Promise.resolve({ token }) });

test("유효한 토큰이면 토마토 보내기 화면으로 이동한다", async () => {
  await expect(render(SHARE_LINK_MOCK_TOKENS.valid)).rejects.toThrow(
    `REDIRECT:/send/${SHARE_LINK_MOCK_TOKENS.valid}`,
  );
});

test("존재하지 않는 토큰이면 404 처리한다", async () => {
  await expect(render("unknown")).rejects.toThrow("NOT_FOUND");
});

test("탈퇴한 회원의 토큰이면 404 처리한다", async () => {
  await expect(render(SHARE_LINK_MOCK_TOKENS.withdrawn)).rejects.toThrow(
    "NOT_FOUND",
  );
});

test("메타에 OG, twitter, canonical이 있고 토큰별 canonical을 쓴다", async () => {
  const metadata = await generateMetadata({
    params: Promise.resolve({ token: "abc" }),
  });

  expect(metadata.alternates?.canonical).toBe("/s/abc");
  expect(metadata.openGraph).toMatchObject({ title: "멋토", url: "/s/abc" });
  expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  expect(metadata.robots).toEqual({ index: false, follow: false });
});

test("메타에 받는 사람 정보를 넣지 않는다", async () => {
  const metadata = await generateMetadata({
    params: Promise.resolve({ token: SHARE_LINK_MOCK_TOKENS.valid }),
  });

  expect(JSON.stringify(metadata)).not.toContain("receiver");
});
