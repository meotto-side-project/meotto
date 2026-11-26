package com.meotto.api.domain.sharelink.presentation.response;

public record ShareLinkResponse(String url) {

	public static ShareLinkResponse from(String url) {
		return new ShareLinkResponse(url);
	}
}
