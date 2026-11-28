import { useMutation } from "@tanstack/react-query";

import { post } from "@/lib/api/client";

import { authQueryKeys } from "../constants/queryKeys";
import { AUTH_ENDPOINTS } from "../constants/url";
import type { SignupProfileRequest } from "../schemas/auth";

export const useSignupProfileMutation = () =>
  useMutation({
    mutationKey: authQueryKeys.signupProfile(),
    mutationFn: (request: SignupProfileRequest) =>
      post<void>(AUTH_ENDPOINTS.signupProfile, request),
  });
