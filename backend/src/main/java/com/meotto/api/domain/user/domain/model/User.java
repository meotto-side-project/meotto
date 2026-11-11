package com.meotto.api.domain.user.domain.model;

import java.time.LocalDateTime;

import com.meotto.api.domain.user.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.user.domain.model.enums.UserRole;

public record User(
	Long id,
	String nickname,
	String profileImageUrl,
	OAuthProvider provider,
	String providerId,
	UserRole role,
	LocalDateTime createdAt,
	LocalDateTime updatedAt) {

	public static User create(
		String nickname, String profileImageUrl, OAuthProvider provider, String providerId) {
		return new User(null, nickname, profileImageUrl, provider, providerId, UserRole.USER, null, null);
	}
}
