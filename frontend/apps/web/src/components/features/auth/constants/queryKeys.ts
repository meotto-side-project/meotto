export const authQueryKeys = {
  all: ["auth"] as const,
  login: () => [...authQueryKeys.all, "login"] as const,
  signupProfile: () => [...authQueryKeys.all, "signup-profile"] as const,
  profileImage: () => [...authQueryKeys.all, "profile-image"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
  handleSuggestion: () => [...authQueryKeys.all, "handle-suggestion"] as const,
};
