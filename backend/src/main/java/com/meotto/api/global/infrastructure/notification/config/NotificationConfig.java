package com.meotto.api.global.infrastructure.notification.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.reactive.function.client.WebClient;

import com.meotto.api.global.infrastructure.notification.NotificationProperties;

@Configuration
@EnableAsync
@EnableConfigurationProperties(NotificationProperties.class)
public class NotificationConfig {

	@Bean
	public WebClient notificationWebClient() {
		return WebClient.builder()
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}
}
