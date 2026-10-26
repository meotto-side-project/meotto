package com.meotto.api.global.infrastructure.fcm;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fcm")
public record FcmProperties(boolean enabled, String credentialsPath) {
}
