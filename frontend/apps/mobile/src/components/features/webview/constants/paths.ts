export const WEB_PATH = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
} as const;

export type WebPath = (typeof WEB_PATH)[keyof typeof WEB_PATH];
