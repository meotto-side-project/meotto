package com.meotto.api.domain.auth.infrastructure.dto;

import java.util.Map;

import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.global.exception.BusinessException;

import lombok.Builder;

@Builder
public record KakaoUserInfo(
	String providerId,
	String email,
	String nickname,
	String profileImageUrl) {

	@SuppressWarnings("unchecked")
	public static KakaoUserInfo from(Map<String, Object> attributes) {
		Object id = attributes == null ? null : attributes.get("id");
		if (id == null) {
			throw new BusinessException(AuthErrorCode.INVALID_KAKAO_TOKEN);
		}

		Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");
		Map<String, Object> profile = kakaoAccount == null ? null : (Map<String, Object>)kakaoAccount.get("profile");

		return KakaoUserInfo.builder()
			.providerId(String.valueOf(id))
			.email(kakaoAccount == null ? null : (String)kakaoAccount.get("email"))
			.nickname(profile == null ? null : (String)profile.get("nickname"))
			.profileImageUrl(profile == null ? null : (String)profile.get("profile_image_url"))
			.build();
	}
}
