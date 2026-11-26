import { expect, test } from "vitest";

import { AUTH_ERROR_NAMES } from "@/components/features/auth/constants/errorNames";
import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";

import { apiUrl } from "../apiUrl";

const postJson = (path: string, body: unknown) =>
  fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("카카오 토큰이 있으면 로그인에 성공한다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.kakaoLogin, {
    accessToken: "token",
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    needsProfileSetup: false,
    memberId: 1,
  });
});

test("카카오 토큰이 비어 있으면 INVALID_KAKAO_TOKEN 401을 돌려준다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.kakaoLogin, {
    accessToken: "",
  });

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidKakaoToken,
  });
});

test("Apple 토큰이 있으면 로그인에 성공한다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.appleLogin, {
    identityToken: "token",
  });

  expect(response.status).toBe(200);
});

test("Apple 토큰이 없으면 INVALID_APPLE_TOKEN 401을 돌려준다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.appleLogin, {});

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidAppleToken,
  });
});
