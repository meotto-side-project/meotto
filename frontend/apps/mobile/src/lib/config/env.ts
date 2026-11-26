function parseOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const { origin, protocol } = new URL(value);
    if (protocol !== "http:" && protocol !== "https:") {
      return null;
    }
    return origin;
  } catch {
    return null;
  }
}

// Expo는 EXPO_PUBLIC_* 를 정적 멤버 접근으로 쓸 때만 값을 인라인한다.
export const webOrigin = parseOrigin(process.env.EXPO_PUBLIC_WEB_URL);
