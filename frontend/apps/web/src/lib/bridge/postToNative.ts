declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

export type NativeBridgeMessage = { type: "AUTH_LOGIN_SUCCESS" };

export function postToNative(message: NativeBridgeMessage): void {
  if (typeof window === "undefined") {
    return;
  }
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
