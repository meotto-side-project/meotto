import { useMutation } from "@tanstack/react-query";

import { networkError, parseError } from "@/lib/api/parseError";

import { authQueryKeys } from "../constants/queryKeys";
import { AUTH_ENDPOINTS } from "../constants/url";
import {
  type ProfileImageResponse,
  profileImageResponseSchema,
} from "../schemas/auth";

// lib/api/client는 JSON 본문만 보내므로 multipart 업로드는 여기서 fetch를 직접 쓴다.
// Content-Type은 브라우저가 boundary와 함께 채우도록 지정하지 않는다.
const uploadProfileImage = async (
  file: File,
): Promise<ProfileImageResponse> => {
  const body = new FormData();
  body.append("file", file);

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}${AUTH_ENDPOINTS.profileImage}`,
      { method: "POST", body, credentials: "include" },
    );
  } catch {
    throw networkError();
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return profileImageResponseSchema.parse(await response.json());
};

export const useUploadProfileImageMutation = () =>
  useMutation({
    mutationKey: authQueryKeys.profileImage(),
    mutationFn: uploadProfileImage,
  });
