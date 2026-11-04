package com.meotto.api.domain.auth.infrastructure.client;

import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.domain.auth.infrastructure.dto.KakaoUserInfo;
import com.meotto.api.global.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class KakaoApiClient {

	private final WebClient kakaoWebClient;

	@SuppressWarnings("unchecked")
	public KakaoUserInfo getUserInfo(String accessToken) {
		Map<String, Object> attributes;
		try {
			attributes = kakaoWebClient.get()
				.uri("/v2/user/me")
				.headers(headers -> headers.setBearerAuth(accessToken))
				.retrieve()
				.bodyToMono(Map.class)
				.block();
		} catch (WebClientResponseException e) {
			throw new BusinessException(AuthErrorCode.INVALID_KAKAO_TOKEN);
		}

		return KakaoUserInfo.from(attributes);
	}
}
