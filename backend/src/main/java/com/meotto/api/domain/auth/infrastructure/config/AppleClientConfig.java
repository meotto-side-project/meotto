package com.meotto.api.domain.auth.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AppleClientConfig {

	@Bean
	public WebClient appleWebClient() {
		return WebClient.builder()
			.baseUrl("https://appleid.apple.com")
			.build();
	}
}
