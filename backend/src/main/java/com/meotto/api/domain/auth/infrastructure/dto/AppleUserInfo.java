package com.meotto.api.domain.auth.infrastructure.dto;

import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.global.exception.BusinessException;

import io.jsonwebtoken.Claims;

public record AppleUserInfo(String providerId) {

	public static AppleUserInfo from(Claims claims) {
		String providerId = claims.getSubject();
		if (providerId == null) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
		return new AppleUserInfo(providerId);
	}
}
