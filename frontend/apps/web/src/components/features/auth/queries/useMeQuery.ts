import { useQuery } from "@tanstack/react-query";

import { get } from "@/lib/api/client";

import { authQueryKeys } from "../constants/queryKeys";
import { AUTH_ENDPOINTS } from "../constants/url";
import { memberMeResponseSchema } from "../schemas/auth";

export const useMeQuery = () =>
  useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async ({ signal }) =>
      memberMeResponseSchema.parse(
        await get<unknown>(AUTH_ENDPOINTS.me, { signal }),
      ),
    retry: false,
  });
