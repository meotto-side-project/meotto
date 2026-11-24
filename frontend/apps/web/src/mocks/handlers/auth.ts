import { http, HttpResponse } from "msw";

import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";

import { apiUrl } from "../apiUrl";

export const authHandlers = [
  http.post(apiUrl(AUTH_ENDPOINTS.kakaoLogin), () =>
    HttpResponse.json({ isNewMember: false, memberId: 1 }),
  ),
  http.post(apiUrl(AUTH_ENDPOINTS.appleLogin), () =>
    HttpResponse.json({ isNewMember: false, memberId: 1 }),
  ),
];
