import { http, HttpResponse } from "msw";

import { SHARE_LINK_ERROR_NAMES } from "@/components/features/share-link/constants/errorNames";

import { apiUrl } from "../apiUrl";

const RESOLVE_PATH = "/api/share-links/:token";

export const SHARE_LINK_MOCK_TOKENS = {
  valid: "mock-token",
  withdrawn: "withdrawn-token",
} as const;

export const shareLinkHandlers = [
  http.get(apiUrl(RESOLVE_PATH), ({ params }) => {
    if (params.token === SHARE_LINK_MOCK_TOKENS.valid) {
      return HttpResponse.json({ receiverId: 1, receiverNickname: "멋토" });
    }
    if (params.token === SHARE_LINK_MOCK_TOKENS.withdrawn) {
      return HttpResponse.json(
        {
          name: SHARE_LINK_ERROR_NAMES.invalid,
          message: "탈퇴한 회원의 링크입니다.",
        },
        { status: 410 },
      );
    }
    return HttpResponse.json(
      {
        name: SHARE_LINK_ERROR_NAMES.notFound,
        message: "존재하지 않는 링크입니다.",
      },
      { status: 404 },
    );
  }),
];
