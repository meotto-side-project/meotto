export const authQueryKeys = {
  all: ["auth"] as const,
  handleSuggestion: () => [...authQueryKeys.all, "handle-suggestion"] as const,
};
