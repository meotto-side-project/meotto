// send-stamp Plan이 확정하기 전까지의 가정 경로다. 확정되면 이 상수만 바꾼다.
export const SHARE_LINK_ROUTES = {
  sendStamp: (token: string) => `/send/${encodeURIComponent(token)}`,
} as const;
