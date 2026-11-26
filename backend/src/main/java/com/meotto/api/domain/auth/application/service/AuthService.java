package com.meotto.api.domain.auth.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meotto.api.domain.auth.domain.repository.RefreshTokenRepository;
import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.domain.auth.infrastructure.client.AppleApiClient;
import com.meotto.api.domain.auth.infrastructure.client.KakaoApiClient;
import com.meotto.api.domain.auth.infrastructure.dto.AppleUserInfo;
import com.meotto.api.domain.auth.infrastructure.dto.KakaoUserInfo;
import com.meotto.api.domain.auth.presentation.response.LoginResponse;
import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.member.exception.MemberErrorCode;
import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.security.context.SecurityUtil;
import com.meotto.api.global.security.cookie.CookieUtil;
import com.meotto.api.global.security.jwt.JwtTokenExtractor;
import com.meotto.api.global.security.jwt.JwtTokenProvider;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

	private static final String DEFAULT_APPLE_NICKNAME = "Apple 사용자";

	private final KakaoApiClient kakaoApiClient;
	private final AppleApiClient appleApiClient;
	private final MemberRepository memberRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtTokenExtractor jwtTokenExtractor;
	private final CookieUtil cookieUtil;

	public LoginResponse loginWithKakao(String kakaoAccessToken, HttpServletResponse response) {
		KakaoUserInfo kakaoUserInfo = kakaoApiClient.getUserInfo(kakaoAccessToken);
		Member member = getOrCreateMember(
			OAuthProvider.KAKAO, kakaoUserInfo.providerId(), kakaoUserInfo.nickname(),
			kakaoUserInfo.profileImageUrl());
		issueTokens(member.id(), member.role().name(), response);
		return new LoginResponse(member.handle() == null, member.id());
	}

	public LoginResponse loginWithApple(String identityToken, HttpServletResponse response) {
		AppleUserInfo appleUserInfo = appleApiClient.verifyIdentityToken(identityToken);
		Member member = getOrCreateMember(
			OAuthProvider.APPLE, appleUserInfo.providerId(), DEFAULT_APPLE_NICKNAME, null);
		issueTokens(member.id(), member.role().name(), response);
		return new LoginResponse(member.handle() == null, member.id());
	}

	public void reissue(String refreshToken, HttpServletResponse response) {
		Claims claims = jwtTokenExtractor.parseClaims(refreshToken);
		Long userId = jwtTokenExtractor.getUserId(claims);

		String storedToken = refreshTokenRepository.findByUserId(userId)
			.orElseThrow(() -> new BusinessException(AuthErrorCode.REFRESH_TOKEN_NOT_FOUND));
		if (!storedToken.equals(refreshToken)) {
			throw new BusinessException(AuthErrorCode.INVALID_REFRESH_TOKEN);
		}

		MemberEntity member = memberRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new BusinessException(MemberErrorCode.MEMBER_NOT_FOUND));

		issueTokens(member.getId(), member.getRole().name(), response);
	}

	public void logout(HttpServletResponse response) {
		Long userId = SecurityUtil.getCurrentUserId();
		refreshTokenRepository.deleteByUserId(userId);
		cookieUtil.deleteCookies(response);
	}

	private Member getOrCreateMember(
		OAuthProvider provider, String providerId, String nickname, String profileImageUrl) {
		return memberRepository.findByProviderAndProviderId(provider, providerId)
			.map(MemberEntity::toModel)
			.orElseGet(() -> {
				Member newMember = Member.create(nickname, profileImageUrl, provider, providerId);
				return memberRepository.save(MemberEntity.from(newMember)).toModel();
			});
	}

	private void issueTokens(Long userId, String role, HttpServletResponse response) {
		String accessToken = jwtTokenProvider.createAccessToken(userId, role);
		String refreshToken = jwtTokenProvider.createRefreshToken(userId);

		refreshTokenRepository.save(userId, refreshToken);

		cookieUtil.addAccessTokenCookie(response, accessToken);
		cookieUtil.addRefreshTokenCookie(response, refreshToken);
	}
}
