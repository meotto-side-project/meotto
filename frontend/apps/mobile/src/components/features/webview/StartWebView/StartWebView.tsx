import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppWebView from "@/components/features/webview/AppWebView/AppWebView";
import { useStartFlags } from "@/components/features/webview/hooks/useStartFlags";
import { resolveStartPath } from "@/components/features/webview/utils/resolveStartPath";
import { webOrigin } from "@/lib/config/env";

export default function StartWebView() {
  const flags = useStartFlags();

  const hideSplash = useCallback(() => {
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    if (!webOrigin) {
      hideSplash();
    }
  }, [hideSplash]);

  if (!webOrigin) {
    return (
      <View style={styles.message}>
        <Text>EXPO_PUBLIC_WEB_URL이 설정되지 않았거나 올바르지 않습니다.</Text>
      </View>
    );
  }

  if (!flags) {
    return null;
  }

  return (
    <AppWebView
      origin={webOrigin}
      startPath={resolveStartPath(flags)}
      loggedIn={flags.loggedIn}
      onboardingSeen={flags.onboardingSeen}
      onFirstLoadEnd={hideSplash}
    />
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
