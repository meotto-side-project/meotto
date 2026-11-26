package com.meotto.api.domain.member.presentation.response;

public record ProfileImageUploadResponse(String imageUrl) {

	public static ProfileImageUploadResponse from(String imageUrl) {
		return new ProfileImageUploadResponse(imageUrl);
	}
}
