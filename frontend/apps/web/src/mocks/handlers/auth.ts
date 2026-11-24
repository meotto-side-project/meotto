import { http, HttpResponse } from "msw";

import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";

const apiUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_API_URL ?? ""}${path}`;

export const authHandlers = [
  http.post(apiUrl(AUTH_ENDPOINTS.kakaoLogin), () =>
    HttpResponse.json({ isNewMember: false, memberId: 1 }),
  ),
  http.post(apiUrl(AUTH_ENDPOINTS.appleLogin), () =>
    HttpResponse.json({ isNewMember: false, memberId: 1 }),
  ),
];
