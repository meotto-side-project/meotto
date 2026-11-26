package com.meotto.api.domain.sharelink.presentation.response;

public record ShareLinkResolveResponse(Long receiverId, String receiverNickname) {

	public static ShareLinkResolveResponse of(Long receiverId, String receiverNickname) {
		return new ShareLinkResolveResponse(receiverId, receiverNickname);
	}
}
