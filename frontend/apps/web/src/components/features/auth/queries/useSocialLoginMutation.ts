import { useMutation } from "@tanstack/react-query";

import { post } from "@/lib/api/client";

import { authQueryKeys } from "../constants/queryKeys";
import { AUTH_ENDPOINTS } from "../constants/url";
import {
  type SocialLoginResponse,
  socialLoginResponseSchema,
} from "../schemas/auth";

export type SocialLoginProvider = "kakao" | "apple";

interface SocialLoginVariables {
  provider: SocialLoginProvider;
  token: string;
}

const loginRequestByProvider = {
  kakao: (token: string) =>
    post<unknown>(AUTH_ENDPOINTS.kakaoLogin, { accessToken: token }),
  apple: (token: string) =>
    post<unknown>(AUTH_ENDPOINTS.appleLogin, { identityToken: token }),
} satisfies Record<SocialLoginProvider, (token: string) => Promise<unknown>>;

const loginRequest = async ({
  provider,
  token,
}: SocialLoginVariables): Promise<SocialLoginResponse> => {
  const response = await loginRequestByProvider[provider](token);

  return socialLoginResponseSchema.parse(response);
};

export const useSocialLoginMutation = () =>
  useMutation({
    mutationKey: authQueryKeys.login(),
    mutationFn: loginRequest,
  });
