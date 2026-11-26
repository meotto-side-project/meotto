package com.meotto.api.domain.sharelink.domain.model;

import java.time.LocalDateTime;

public record ShareLink(
	Long id,
	Long memberId,
	String token,
	LocalDateTime createdAt,
	LocalDateTime updatedAt) {

	public static ShareLink create(Long memberId, String token) {
		return new ShareLink(null, memberId, token, null, null);
	}
}
