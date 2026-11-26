export const authQueryKeys = {
  all: ["auth"] as const,
  login: () => [...authQueryKeys.all, "login"] as const,
  handleSuggestion: () => [...authQueryKeys.all, "handle-suggestion"] as const,
};
