export const SHARE_LINK_SITE_ORIGIN = "https://meotto.io.kr";

export const SHARE_LINK_SEO = {
  title: "멋토",
  description: "토마토 도장으로 전하는 마음",
} as const;

export const shareLinkCanonicalPath = (token: string) =>
  `/s/${encodeURIComponent(token)}`;
