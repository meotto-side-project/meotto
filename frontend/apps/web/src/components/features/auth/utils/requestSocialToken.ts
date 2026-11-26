import type { SocialLoginProvider } from "../queries/useSocialLoginMutation";

// 소셜 SDK 토큰은 네이티브(T-F03-07)가 브리지로 전달한다. 브리지 계약이 확정되기 전까지 자리표시 값을 돌려준다.
export async function requestSocialToken(
  provider: SocialLoginProvider,
): Promise<string> {
  return `pending-bridge-${provider}-token`;
}
