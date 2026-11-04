package com.meotto.api.domain.auth.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class KakaoClientConfig {

	@Bean
	public WebClient kakaoWebClient() {
		return WebClient.builder()
			.baseUrl("https://kapi.kakao.com")
			.build();
	}
}
