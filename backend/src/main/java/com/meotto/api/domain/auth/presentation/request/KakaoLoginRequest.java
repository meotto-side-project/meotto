package com.meotto.api.domain.auth.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record KakaoLoginRequest(
	@NotBlank String accessToken) {
}
