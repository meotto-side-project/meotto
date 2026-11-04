package com.meotto.api.domain.auth.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meotto.api.domain.auth.domain.repository.RefreshTokenRepository;
import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.domain.auth.infrastructure.client.KakaoApiClient;
import com.meotto.api.domain.auth.infrastructure.dto.KakaoUserInfo;
import com.meotto.api.domain.user.domain.entity.UserEntity;
import com.meotto.api.domain.user.domain.model.User;
import com.meotto.api.domain.user.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.user.domain.repository.UserRepository;
import com.meotto.api.domain.user.exception.UserErrorCode;
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

	private final KakaoApiClient kakaoApiClient;
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtTokenExtractor jwtTokenExtractor;
	private final CookieUtil cookieUtil;

	public void loginWithKakao(String kakaoAccessToken, HttpServletResponse response) {
		KakaoUserInfo kakaoUserInfo = kakaoApiClient.getUserInfo(kakaoAccessToken);
		User user = getOrCreateUser(kakaoUserInfo);
		issueTokens(user.id(), user.email(), user.role().name(), response);
	}

	public void reissue(String refreshToken, HttpServletResponse response) {
		Claims claims = jwtTokenExtractor.parseClaims(refreshToken);
		Long userId = jwtTokenExtractor.getUserId(claims);

		String storedToken = refreshTokenRepository.findByUserId(userId)
			.orElseThrow(() -> new BusinessException(AuthErrorCode.REFRESH_TOKEN_NOT_FOUND));
		if (!storedToken.equals(refreshToken)) {
			throw new BusinessException(AuthErrorCode.INVALID_REFRESH_TOKEN);
		}

		UserEntity user = userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

		issueTokens(user.getId(), user.getEmail(), user.getRole().name(), response);
	}

	public void logout(HttpServletResponse response) {
		Long userId = SecurityUtil.getCurrentUserId();
		refreshTokenRepository.deleteByUserId(userId);
		cookieUtil.deleteCookies(response);
	}

	private User getOrCreateUser(KakaoUserInfo info) {
		return userRepository.findByProviderAndProviderId(OAuthProvider.KAKAO, info.providerId())
			.map(UserEntity::toModel)
			.orElseGet(() -> {
				User newUser = User.create(info.email(), info.nickname(), OAuthProvider.KAKAO, info.providerId());
				return userRepository.save(UserEntity.from(newUser)).toModel();
			});
	}

	private void issueTokens(Long userId, String email, String role, HttpServletResponse response) {
		String accessToken = jwtTokenProvider.createAccessToken(userId, email, role);
		String refreshToken = jwtTokenProvider.createRefreshToken(userId);

		refreshTokenRepository.save(userId, refreshToken);

		cookieUtil.addAccessTokenCookie(response, accessToken);
		cookieUtil.addRefreshTokenCookie(response, refreshToken);
	}
}
