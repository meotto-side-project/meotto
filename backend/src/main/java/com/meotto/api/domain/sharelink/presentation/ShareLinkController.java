package com.meotto.api.domain.sharelink.presentation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.meotto.api.domain.sharelink.application.service.ShareLinkService;
import com.meotto.api.domain.sharelink.presentation.response.ShareLinkResolveResponse;
import com.meotto.api.domain.sharelink.presentation.response.ShareLinkResponse;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ShareLinkController {

	private final ShareLinkService shareLinkService;

	@Operation(summary = "공유 링크 발급")
	@GetMapping("/api/members/me/share-link")
	public ShareLinkResponse getShareLink() {
		return ShareLinkResponse.from(shareLinkService.getOrCreateUrl());
	}

	@Operation(summary = "공유 링크 해석")
	@GetMapping("/api/share-links/{token}")
	public ShareLinkResolveResponse resolve(
		@PathVariable
		String token) {
		return shareLinkService.resolve(token);
	}
}
