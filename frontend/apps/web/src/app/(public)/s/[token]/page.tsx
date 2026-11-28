import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SHARE_LINK_ROUTES } from "@/components/features/share-link/constants/routes";
import {
  SHARE_LINK_SEO,
  SHARE_LINK_SITE_ORIGIN,
  shareLinkCanonicalPath,
} from "@/components/features/share-link/constants/seo";
import { resolveShareLink } from "@/components/features/share-link/utils/resolveShareLink";

export const instant = false;

type Props = { params: Promise<{ token: string }> };

// 공유 링크의 주인 정보(이름 등)는 메타에 넣지 않는다. 모든 토큰에 같은 문구를 쓴다.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const { title, description } = SHARE_LINK_SEO;

  return {
    metadataBase: new URL(SHARE_LINK_SITE_ORIGIN),
    title,
    description,
    alternates: { canonical: shareLinkCanonicalPath(token) },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: shareLinkCanonicalPath(token),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function ShareLinkPage({ params }: Props) {
  const { token } = await params;
  const receiver = await resolveShareLink(token);
  if (!receiver) {
    notFound();
  }
  redirect(SHARE_LINK_ROUTES.sendStamp(token));
}
