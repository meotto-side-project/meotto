import { useRef } from "react";
import { Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview/lib/WebViewTypes";

import { BRIDGE_MESSAGE_TYPE } from "@/components/features/webview/constants/messages";
import {
  WEB_PATH,
  type WebPath,
} from "@/components/features/webview/constants/paths";
import {
  parseIncomingBridgeMessage,
  serializeOutgoingBridgeMessage,
} from "@/components/features/webview/schemas/bridge";
import {
  getPathname,
  isSameOrigin,
} from "@/components/features/webview/utils/url";
import { saveLoggedIn, saveOnboardingSeen } from "@/lib/storage/flags";

type AppWebViewProps = {
  origin: string;
  startPath: WebPath;
  loggedIn: boolean;
  onboardingSeen: boolean;
  onFirstLoadEnd: () => void;
};

const BLANK_URL = "about:blank";

export default function AppWebView({
  origin,
  startPath,
  loggedIn,
  onboardingSeen,
  onFirstLoadEnd,
}: AppWebViewProps) {
  const webViewRef = useRef<WebView<object>>(null);
  const loggedInRef = useRef(loggedIn);
  const onboardingSeenRef = useRef(onboardingSeen);
  const authStateSentRef = useRef(false);
  const firstLoadEndedRef = useRef(false);

  // originWhitelist는 접두사 비교라 "http://a.com.evil"도 통과하므로 origin을 정확히 다시 비교한다.
  const handleShouldStartLoad = (request: ShouldStartLoadRequest) => {
    if (request.url === BLANK_URL || isSameOrigin(request.url, origin)) {
      return true;
    }
    Linking.openURL(request.url).catch(() => undefined);
    return false;
  };

  // Next 클라이언트 라우팅(pushState)도 이 콜백으로 들어온다
  // (iOS history shim, Android doUpdateVisitedHistory).
  const handleNavigationStateChange = (navigation: WebViewNavigation) => {
    if (onboardingSeenRef.current || !isSameOrigin(navigation.url, origin)) {
      return;
    }
    if (getPathname(navigation.url) === WEB_PATH.login) {
      onboardingSeenRef.current = true;
      void saveOnboardingSeen();
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!isSameOrigin(event.nativeEvent.url, origin)) {
      return;
    }
    const message = parseIncomingBridgeMessage(event.nativeEvent.data);
    if (!message) {
      return;
    }
    switch (message.type) {
      case BRIDGE_MESSAGE_TYPE.authLoginSuccess:
        loggedInRef.current = true;
        void saveLoggedIn();
        break;
    }
  };

  // iOS는 pushState에도 onLoad/onLoadEnd가 불려서 둘 다 한 번만 실행한다.
  const handleLoad = () => {
    if (authStateSentRef.current) {
      return;
    }
    authStateSentRef.current = true;
    webViewRef.current?.postMessage(
      serializeOutgoingBridgeMessage({
        type: BRIDGE_MESSAGE_TYPE.authState,
        payload: { loggedIn: loggedInRef.current },
      }),
    );
  };

  const handleLoadEnd = () => {
    if (firstLoadEndedRef.current) {
      return;
    }
    firstLoadEndedRef.current = true;
    onFirstLoadEnd();
  };

  return (
    // 기본 제네릭(undefined)이면 TS 6에서 props가 never가 된다.
    <WebView<object>
      ref={webViewRef}
      style={styles.webView}
      source={{ uri: `${origin}${startPath}` }}
      originWhitelist={[origin]}
      onShouldStartLoadWithRequest={handleShouldStartLoad}
      onNavigationStateChange={handleNavigationStateChange}
      onMessage={handleMessage}
      onLoad={handleLoad}
      onLoadEnd={handleLoadEnd}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
