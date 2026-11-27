function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function isSameOrigin(url: string, origin: string): boolean {
  return parseUrl(url)?.origin === origin;
}

export function getPathname(url: string): string | null {
  return parseUrl(url)?.pathname ?? null;
}
