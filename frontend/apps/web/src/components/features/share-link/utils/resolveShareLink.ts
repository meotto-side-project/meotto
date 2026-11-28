import { ApiError } from "@/lib/api/ApiError";
import { get } from "@/lib/api/client";

import { SHARE_LINK_ENDPOINTS } from "../constants/url";
import { shareLinkResolveResponseSchema } from "../schemas/shareLink";

export async function resolveShareLink(token: string) {
  try {
    const data = await get<unknown>(SHARE_LINK_ENDPOINTS.resolve(token));
    return shareLinkResolveResponseSchema.parse(data);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 410)
    ) {
      return null;
    }
    throw error;
  }
}
