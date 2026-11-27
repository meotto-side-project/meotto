import {
  WEB_PATH,
  type WebPath,
} from "@/components/features/webview/constants/paths";
import type { StartFlags } from "@/lib/storage/flags";

export function resolveStartPath({
  loggedIn,
  onboardingSeen,
}: StartFlags): WebPath {
  if (loggedIn) {
    return WEB_PATH.home;
  }
  if (onboardingSeen) {
    return WEB_PATH.login;
  }
  return WEB_PATH.onboarding;
}
