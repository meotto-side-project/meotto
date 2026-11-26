package com.meotto.api.domain.sharelink.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "share-link")
public record ShareLinkProperties(String baseUrl) {
}
