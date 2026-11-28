import { type NextRequest, NextResponse } from "next/server";

import { resolveShareLink } from "@/components/features/share-link/utils/resolveShareLink";

const SHARE_LINK_PATH = /^\/s\/([^/]+)\/?$/;

// 페이지는 스트리밍으로 렌더링되어 notFound()로는 404 상태를 줄 수 없다.
// 유효하지 않은 토큰은 렌더링 전에 여기서 404로 응답한다.
export async function proxy(request: NextRequest) {
  const match = SHARE_LINK_PATH.exec(request.nextUrl.pathname);
  if (!match) {
    return NextResponse.next();
  }

  const receiver = await resolveShareLink(decodeURIComponent(match[1]));
  if (!receiver) {
    return NextResponse.rewrite(new URL("/share-link-not-found", request.url), {
      status: 404,
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/s/:token",
};
