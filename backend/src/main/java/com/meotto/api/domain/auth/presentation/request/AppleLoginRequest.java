package com.meotto.api.domain.auth.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record AppleLoginRequest(
	@NotBlank String identityToken) {
}
