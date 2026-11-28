export const SHARE_LINK_ENDPOINTS = {
  resolve: (token: string) => `/api/share-links/${encodeURIComponent(token)}`,
} as const;
