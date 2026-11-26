import { http, HttpResponse } from "msw";

import { AUTH_ERROR_NAMES } from "@/components/features/auth/constants/errorNames";
import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";

import { apiUrl } from "../apiUrl";

const loginSuccess = () =>
  HttpResponse.json({ needsProfileSetup: false, memberId: 1 });

const invalidToken = (name: string) =>
  HttpResponse.json(
    { name, message: "유효하지 않은 소셜 토큰입니다." },
    { status: 401 },
  );

const hasToken = (body: unknown, key: string) =>
  typeof body === "object" &&
  body !== null &&
  key in body &&
  typeof body[key as keyof typeof body] === "string" &&
  body[key as keyof typeof body] !== "";

export const authHandlers = [
  http.post(apiUrl(AUTH_ENDPOINTS.kakaoLogin), async ({ request }) =>
    hasToken(await request.json(), "accessToken")
      ? loginSuccess()
      : invalidToken(AUTH_ERROR_NAMES.invalidKakaoToken),
  ),
  http.post(apiUrl(AUTH_ENDPOINTS.appleLogin), async ({ request }) =>
    hasToken(await request.json(), "identityToken")
      ? loginSuccess()
      : invalidToken(AUTH_ERROR_NAMES.invalidAppleToken),
  ),
];
