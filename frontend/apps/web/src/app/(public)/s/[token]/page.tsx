import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SHARE_LINK_ROUTES } from "@/components/features/share-link/constants/routes";
import { resolveShareLink } from "@/components/features/share-link/utils/resolveShareLink";

export const metadata: Metadata = {
  title: "멋토",
  robots: { index: false, follow: false },
};

export const instant = false;

type Props = { params: Promise<{ token: string }> };

export default async function ShareLinkPage({ params }: Props) {
  const { token } = await params;
  const receiver = await resolveShareLink(token);
  if (!receiver) {
    notFound();
  }
  redirect(SHARE_LINK_ROUTES.sendStamp(token));
}
