package com.meotto.api.domain.member.domain.model;

import java.time.LocalDateTime;

import com.meotto.api.domain.member.domain.model.enums.MemberRole;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.member.domain.model.enums.SentPraiseVisibility;

public record Member(
	Long id,
	String nickname,
	String profileImageUrl,
	String handle,
	Boolean notificationEnabled,
	Boolean boardPublic,
	SentPraiseVisibility sentPraiseVisibility,
	LocalDateTime lastActiveAt,
	OAuthProvider provider,
	String providerId,
	MemberRole role,
	LocalDateTime createdAt,
	LocalDateTime updatedAt) {

	public static Member create(
		String nickname, String profileImageUrl, OAuthProvider provider, String providerId) {
		return new Member(null, nickname, profileImageUrl, null, null, null,
			SentPraiseVisibility.ALL, null, provider, providerId, MemberRole.USER, null, null);
	}
}
