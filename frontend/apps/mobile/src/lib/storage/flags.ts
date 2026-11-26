import * as SecureStore from "expo-secure-store";

const FLAG_KEY = {
  loggedIn: "loggedIn",
  onboardingSeen: "onboardingSeen",
} as const;

const FLAG_ON = "true";

export type StartFlags = {
  loggedIn: boolean;
  onboardingSeen: boolean;
};

async function readFlag(key: string): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(key)) === FLAG_ON;
  } catch {
    return false;
  }
}

// 저장 실패는 다음 실행 때 온보딩·로그인을 한 번 더 보는 정도라 현재 세션을 막지 않는다.
async function writeFlag(key: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, FLAG_ON);
  } catch {
    return;
  }
}

export async function readStartFlags(): Promise<StartFlags> {
  const [loggedIn, onboardingSeen] = await Promise.all([
    readFlag(FLAG_KEY.loggedIn),
    readFlag(FLAG_KEY.onboardingSeen),
  ]);
  return { loggedIn, onboardingSeen };
}

export function saveLoggedIn(): Promise<void> {
  return writeFlag(FLAG_KEY.loggedIn);
}

export function saveOnboardingSeen(): Promise<void> {
  return writeFlag(FLAG_KEY.onboardingSeen);
}
