package com.meotto.api.domain.sharelink.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.sharelink.domain.entity.ShareLinkEntity;
import com.meotto.api.domain.sharelink.domain.model.ShareLink;
import com.meotto.api.domain.sharelink.domain.repository.ShareLinkRepository;
import com.meotto.api.domain.sharelink.exception.ShareLinkErrorCode;
import com.meotto.api.domain.sharelink.infrastructure.ShareLinkProperties;
import com.meotto.api.domain.sharelink.presentation.response.ShareLinkResolveResponse;
import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.security.context.SecurityUtil;

@ExtendWith(MockitoExtension.class)
class ShareLinkServiceTest {

	@Mock
	private ShareLinkRepository shareLinkRepository;

	@Mock
	private MemberRepository memberRepository;

	private ShareLinkService shareLinkService;

	@BeforeEach
	void setUp() {
		shareLinkService = new ShareLinkService(
			shareLinkRepository, memberRepository, new ShareLinkProperties("https://meotto.io.kr/s"));
	}

	@Test
	void getOrCreateUrl_기존_토큰이_있으면_그대로_반환한다() {
		ShareLinkEntity existing = ShareLinkEntity.from(ShareLink.create(1L, "existing-token"));
		when(shareLinkRepository.findByMemberIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(existing));

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			String url = shareLinkService.getOrCreateUrl();

			assertThat(url).isEqualTo("https://meotto.io.kr/s/existing-token");
			verify(shareLinkRepository, never()).save(any());
		}
	}

	@Test
	void getOrCreateUrl_토큰이_없으면_새로_발급해서_저장한다() {
		when(shareLinkRepository.findByMemberIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			String url = shareLinkService.getOrCreateUrl();

			assertThat(url).startsWith("https://meotto.io.kr/s/");
			verify(shareLinkRepository).save(any());
		}
	}

	@Test
	void resolve_유효한_토큰이면_받는사람_정보를_반환한다() {
		ShareLinkEntity shareLink = ShareLinkEntity.from(ShareLink.create(1L, "token"));
		when(shareLinkRepository.findByTokenAndDeletedAtIsNull("token")).thenReturn(Optional.of(shareLink));

		MemberEntity receiver = MemberEntity.from(
			Member.create("받는사람", null, OAuthProvider.KAKAO, "provider-id"));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(receiver));

		ShareLinkResolveResponse response = shareLinkService.resolve("token");

		assertThat(response.receiverNickname()).isEqualTo("받는사람");
	}

	@Test
	void resolve_토큰이_없으면_404_예외() {
		when(shareLinkRepository.findByTokenAndDeletedAtIsNull("unknown")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> shareLinkService.resolve("unknown"))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND));
	}

	@Test
	void resolve_소유_회원이_탈퇴했으면_410_예외() {
		ShareLinkEntity shareLink = ShareLinkEntity.from(ShareLink.create(1L, "token"));
		when(shareLinkRepository.findByTokenAndDeletedAtIsNull("token")).thenReturn(Optional.of(shareLink));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> shareLinkService.resolve("token"))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(ShareLinkErrorCode.SHARE_LINK_INVALID));
	}
}
