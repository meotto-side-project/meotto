import { http, HttpResponse } from "msw";

import { AUTH_ERROR_NAMES } from "@/components/features/auth/constants/errorNames";
import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";
import {
  handleSchema,
  nicknameSchema,
} from "@/components/features/auth/schemas/auth";

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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DUPLICATED_HANDLE = "meotto";

const errorResponse = (name: string, message: string, status: number) =>
  HttpResponse.json({ name, message }, { status });

const stringField = (body: unknown, key: string) =>
  typeof body === "object" &&
  body !== null &&
  key in body &&
  typeof body[key as keyof typeof body] === "string"
    ? (body[key as keyof typeof body] as string)
    : undefined;

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
  http.get(apiUrl(AUTH_ENDPOINTS.handleSuggestion), () =>
    HttpResponse.json({ handle: "tomato_1234" }),
  ),
  http.get(apiUrl(AUTH_ENDPOINTS.me), () =>
    HttpResponse.json({
      id: 1,
      nickname: "토마토",
      handle: null,
      profileImageUrl: null,
      notificationEnabled: true,
      boardPublic: true,
      sentPraiseVisibility: "ALL",
      profileCompleted: false,
    }),
  ),
  http.post(apiUrl(AUTH_ENDPOINTS.signupProfile), async ({ request }) => {
    const body: unknown = await request.json();
    if (!nicknameSchema.safeParse(stringField(body, "nickname")).success) {
      return errorResponse(
        AUTH_ERROR_NAMES.invalidNickname,
        "이름 형식이 올바르지 않습니다.",
        400,
      );
    }
    const handle = stringField(body, "handle");
    if (!handleSchema.safeParse(handle).success) {
      return errorResponse(
        AUTH_ERROR_NAMES.invalidHandle,
        "아이디 형식이 올바르지 않습니다.",
        400,
      );
    }
    if (handle === DUPLICATED_HANDLE) {
      return errorResponse(
        AUTH_ERROR_NAMES.handleDuplicated,
        "이미 사용 중인 아이디입니다.",
        409,
      );
    }
    return new HttpResponse(null, { status: 201 });
  }),
  http.post(apiUrl(AUTH_ENDPOINTS.profileImage), async ({ request }) => {
    const file = (await request.formData()).get("file");
    // 테스트 환경(jsdom)의 Blob과 Node의 File은 생성자가 달라 instanceof를 쓰지 않는다.
    if (
      file === null ||
      typeof file === "string" ||
      file.size === 0 ||
      file.size > MAX_IMAGE_BYTES
    ) {
      return errorResponse(
        AUTH_ERROR_NAMES.invalidImage,
        "이미지를 올릴 수 없습니다.",
        400,
      );
    }
    return HttpResponse.json(
      { imageUrl: "https://images.meotto.test/profile/mock.jpg" },
      { status: 201 },
    );
  }),
];
