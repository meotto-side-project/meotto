import { useRouter } from "next/navigation";

import { postToNative } from "@/lib/bridge/postToNative";

import { AUTH_ROUTES } from "../constants/routes";
import {
  type SocialLoginProvider,
  useSocialLoginMutation,
} from "../queries/useSocialLoginMutation";
import { requestSocialToken } from "../utils/requestSocialToken";

export const useSocialLogin = () => {
  const router = useRouter();
  const { mutate, isPending, isError } = useSocialLoginMutation();

  const login = async (provider: SocialLoginProvider) => {
    const token = await requestSocialToken(provider);
    mutate(
      { provider, token },
      {
        onSuccess: ({ needsProfileSetup }) => {
          postToNative({ type: "AUTH_LOGIN_SUCCESS" });
          router.replace(
            needsProfileSetup ? AUTH_ROUTES.signup : AUTH_ROUTES.home,
          );
        },
      },
    );
  };

  return { login, isPending, isError };
};
