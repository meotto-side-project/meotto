import { useQuery } from "@tanstack/react-query";

import { get } from "@/lib/api/client";

import { authQueryKeys } from "../constants/queryKeys";
import { AUTH_ENDPOINTS } from "../constants/url";
import { handleSuggestionResponseSchema } from "../schemas/auth";

export const useHandleSuggestionQuery = (enabled: boolean) =>
  useQuery({
    queryKey: authQueryKeys.handleSuggestion(),
    queryFn: async ({ signal }) =>
      handleSuggestionResponseSchema.parse(
        await get<unknown>(AUTH_ENDPOINTS.handleSuggestion, { signal }),
      ),
    enabled,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
