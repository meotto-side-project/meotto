package com.meotto.api.domain.sharelink.application.service;

import java.util.UUID;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.sharelink.domain.entity.ShareLinkEntity;
import com.meotto.api.domain.sharelink.domain.model.ShareLink;
import com.meotto.api.domain.sharelink.domain.repository.ShareLinkRepository;
import com.meotto.api.domain.sharelink.exception.ShareLinkErrorCode;
import com.meotto.api.domain.sharelink.infrastructure.ShareLinkProperties;
import com.meotto.api.domain.sharelink.presentation.response.ShareLinkResolveResponse;
import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.security.context.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@EnableConfigurationProperties(ShareLinkProperties.class)
public class ShareLinkService {

	private final ShareLinkRepository shareLinkRepository;
	private final MemberRepository memberRepository;
	private final ShareLinkProperties shareLinkProperties;

	@Transactional
	public String getOrCreateUrl() {
		Long memberId = SecurityUtil.getCurrentUserId();
		String token = shareLinkRepository.findByMemberIdAndDeletedAtIsNull(memberId)
			.map(ShareLinkEntity::getToken)
			.orElseGet(() -> issueToken(memberId));
		return shareLinkProperties.baseUrl() + "/" + token;
	}

	private String issueToken(Long memberId) {
		String token = UUID.randomUUID().toString().replace("-", "");
		shareLinkRepository.save(ShareLinkEntity.from(ShareLink.create(memberId, token)));
		return token;
	}

	public ShareLinkResolveResponse resolve(String token) {
		ShareLinkEntity shareLink = shareLinkRepository.findByTokenAndDeletedAtIsNull(token)
			.orElseThrow(() -> new BusinessException(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND));

		MemberEntity receiver = memberRepository.findByIdAndDeletedAtIsNull(shareLink.getMemberId())
			.orElseThrow(() -> new BusinessException(ShareLinkErrorCode.SHARE_LINK_INVALID));

		return ShareLinkResolveResponse.of(receiver.getId(), receiver.getNickname());
	}
}
