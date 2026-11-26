package com.meotto.api.domain.auth.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

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

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@InjectMocks
	private AuthService authService;

	@Mock
	private KakaoApiClient kakaoApiClient;
	@Mock
	private AppleApiClient appleApiClient;
	@Mock
	private MemberRepository memberRepository;
	@Mock
	private RefreshTokenRepository refreshTokenRepository;
	@Mock
	private JwtTokenProvider jwtTokenProvider;
	@Mock
	private JwtTokenExtractor jwtTokenExtractor;
	@Mock
	private CookieUtil cookieUtil;
	@Mock
	private HttpServletResponse response;

	@Test
	void loginWithKakao_신규유저면_유저를_생성하고_프로필설정이_필요하다() {
		KakaoUserInfo kakaoUserInfo = KakaoUserInfo.builder()
			.providerId("123")
			.nickname("멋토유저")
			.profileImageUrl("https://kakao.com/profile.jpg")
			.build();
		when(kakaoApiClient.getUserInfo("kakao-access-token")).thenReturn(kakaoUserInfo);
		when(memberRepository.findByProviderAndProviderId(OAuthProvider.KAKAO, "123")).thenReturn(Optional.empty());

		MemberEntity savedEntity = MemberEntity.from(
			Member.create("멋토유저", "https://kakao.com/profile.jpg", OAuthProvider.KAKAO, "123"));
		ReflectionTestUtils.setField(savedEntity, "id", 1L);
		when(memberRepository.save(any())).thenReturn(savedEntity);

		when(jwtTokenProvider.createAccessToken(1L, "USER")).thenReturn("access-token");
		when(jwtTokenProvider.createRefreshToken(1L)).thenReturn("refresh-token");

		LoginResponse loginResponse = authService.loginWithKakao("kakao-access-token", response);

		ArgumentCaptor<MemberEntity> savedCaptor = ArgumentCaptor.forClass(MemberEntity.class);
		verify(memberRepository, times(1)).save(savedCaptor.capture());
		assertThat(savedCaptor.getValue().getProfileImageUrl()).isEqualTo("https://kakao.com/profile.jpg");
		verify(refreshTokenRepository).save(1L, "refresh-token");
		verify(cookieUtil).addAccessTokenCookie(response, "access-token");
		verify(cookieUtil).addRefreshTokenCookie(response, "refresh-token");
		assertThat(loginResponse.needsProfileSetup()).isTrue();
		assertThat(loginResponse.memberId()).isEqualTo(1L);
	}

	@Test
	void loginWithKakao_기존유저지만_프로필설정을_안했으면_필요하다() {
		KakaoUserInfo kakaoUserInfo = KakaoUserInfo.builder()
			.providerId("123")
			.nickname("멋토유저")
			.build();
		when(kakaoApiClient.getUserInfo("kakao-access-token")).thenReturn(kakaoUserInfo);

		MemberEntity existingEntity = MemberEntity.from(
			Member.create("멋토유저", null, OAuthProvider.KAKAO, "123"));
		ReflectionTestUtils.setField(existingEntity, "id", 1L);
		when(memberRepository.findByProviderAndProviderId(OAuthProvider.KAKAO, "123"))
			.thenReturn(Optional.of(existingEntity));

		when(jwtTokenProvider.createAccessToken(1L, "USER")).thenReturn("access-token");
		when(jwtTokenProvider.createRefreshToken(1L)).thenReturn("refresh-token");

		LoginResponse loginResponse = authService.loginWithKakao("kakao-access-token", response);

		verify(memberRepository, never()).save(any());
		verify(refreshTokenRepository).save(1L, "refresh-token");
		assertThat(loginResponse.needsProfileSetup()).isTrue();
		assertThat(loginResponse.memberId()).isEqualTo(1L);
	}

	@Test
	void loginWithKakao_프로필설정을_마친유저면_필요없다() {
		KakaoUserInfo kakaoUserInfo = KakaoUserInfo.builder()
			.providerId("123")
			.nickname("멋토유저")
			.build();
		when(kakaoApiClient.getUserInfo("kakao-access-token")).thenReturn(kakaoUserInfo);

		MemberEntity existingEntity = MemberEntity.from(
			Member.create("멋토유저", null, OAuthProvider.KAKAO, "123"));
		ReflectionTestUtils.setField(existingEntity, "id", 1L);
		existingEntity.updateHandle("meotto_user");
		when(memberRepository.findByProviderAndProviderId(OAuthProvider.KAKAO, "123"))
			.thenReturn(Optional.of(existingEntity));

		when(jwtTokenProvider.createAccessToken(1L, "USER")).thenReturn("access-token");
		when(jwtTokenProvider.createRefreshToken(1L)).thenReturn("refresh-token");

		LoginResponse loginResponse = authService.loginWithKakao("kakao-access-token", response);

		verify(memberRepository, never()).save(any());
		assertThat(loginResponse.needsProfileSetup()).isFalse();
		assertThat(loginResponse.memberId()).isEqualTo(1L);
	}

	@Test
	void loginWithApple_신규유저면_유저를_생성하고_프로필설정이_필요하다() {
		AppleUserInfo appleUserInfo = new AppleUserInfo("apple-sub-123");
		when(appleApiClient.verifyIdentityToken("identity-token")).thenReturn(appleUserInfo);
		when(memberRepository.findByProviderAndProviderId(OAuthProvider.APPLE, "apple-sub-123"))
			.thenReturn(Optional.empty());

		MemberEntity savedEntity = MemberEntity.from(
			Member.create("Apple 사용자", null, OAuthProvider.APPLE, "apple-sub-123"));
		ReflectionTestUtils.setField(savedEntity, "id", 2L);
		when(memberRepository.save(any())).thenReturn(savedEntity);

		when(jwtTokenProvider.createAccessToken(2L, "USER")).thenReturn("access-token");
		when(jwtTokenProvider.createRefreshToken(2L)).thenReturn("refresh-token");

		LoginResponse loginResponse = authService.loginWithApple("identity-token", response);

		ArgumentCaptor<MemberEntity> savedCaptor = ArgumentCaptor.forClass(MemberEntity.class);
		verify(memberRepository, times(1)).save(savedCaptor.capture());
		assertThat(savedCaptor.getValue().getNickname()).isEqualTo("Apple 사용자");
		assertThat(savedCaptor.getValue().getProvider()).isEqualTo(OAuthProvider.APPLE);
		verify(refreshTokenRepository).save(2L, "refresh-token");
		assertThat(loginResponse.needsProfileSetup()).isTrue();
		assertThat(loginResponse.memberId()).isEqualTo(2L);
	}

	@Test
	void loginWithApple_프로필설정을_마친유저면_필요없다() {
		AppleUserInfo appleUserInfo = new AppleUserInfo("apple-sub-123");
		when(appleApiClient.verifyIdentityToken("identity-token")).thenReturn(appleUserInfo);

		MemberEntity existingEntity = MemberEntity.from(
			Member.create("Apple 사용자", null, OAuthProvider.APPLE, "apple-sub-123"));
		ReflectionTestUtils.setField(existingEntity, "id", 2L);
		existingEntity.updateHandle("apple_user");
		when(memberRepository.findByProviderAndProviderId(OAuthProvider.APPLE, "apple-sub-123"))
			.thenReturn(Optional.of(existingEntity));

		when(jwtTokenProvider.createAccessToken(2L, "USER")).thenReturn("access-token");
		when(jwtTokenProvider.createRefreshToken(2L)).thenReturn("refresh-token");

		LoginResponse loginResponse = authService.loginWithApple("identity-token", response);

		verify(memberRepository, never()).save(any());
		verify(refreshTokenRepository).save(2L, "refresh-token");
		assertThat(loginResponse.needsProfileSetup()).isFalse();
		assertThat(loginResponse.memberId()).isEqualTo(2L);
	}

	@Test
	void reissue_저장된리프레시토큰이없으면_예외() {
		Claims claims = mock(Claims.class);
		when(jwtTokenExtractor.parseClaims("refresh-token")).thenReturn(claims);
		when(jwtTokenExtractor.getUserId(claims)).thenReturn(1L);
		when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.reissue("refresh-token", response))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(AuthErrorCode.REFRESH_TOKEN_NOT_FOUND));
	}

	@Test
	void reissue_저장된토큰과_불일치하면_예외() {
		Claims claims = mock(Claims.class);
		when(jwtTokenExtractor.parseClaims("refresh-token")).thenReturn(claims);
		when(jwtTokenExtractor.getUserId(claims)).thenReturn(1L);
		when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.of("other-token"));

		assertThatThrownBy(() -> authService.reissue("refresh-token", response))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(AuthErrorCode.INVALID_REFRESH_TOKEN));
	}

	@Test
	void reissue_유저가없으면_예외() {
		Claims claims = mock(Claims.class);
		when(jwtTokenExtractor.parseClaims("refresh-token")).thenReturn(claims);
		when(jwtTokenExtractor.getUserId(claims)).thenReturn(1L);
		when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.of("refresh-token"));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.reissue("refresh-token", response))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(MemberErrorCode.MEMBER_NOT_FOUND));
	}

	@Test
	void reissue_유효하면_토큰을_재발급한다() {
		Claims claims = mock(Claims.class);
		when(jwtTokenExtractor.parseClaims("refresh-token")).thenReturn(claims);
		when(jwtTokenExtractor.getUserId(claims)).thenReturn(1L);
		when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.of("refresh-token"));

		MemberEntity entity = MemberEntity.from(Member.create("멋토유저", null, OAuthProvider.KAKAO, "123"));
		ReflectionTestUtils.setField(entity, "id", 1L);
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(entity));

		when(jwtTokenProvider.createAccessToken(1L, "USER")).thenReturn("new-access-token");
		when(jwtTokenProvider.createRefreshToken(1L)).thenReturn("new-refresh-token");

		authService.reissue("refresh-token", response);

		verify(cookieUtil).addAccessTokenCookie(response, "new-access-token");
		verify(cookieUtil).addRefreshTokenCookie(response, "new-refresh-token");
		verify(refreshTokenRepository).save(1L, "new-refresh-token");
	}

	@Test
	void logout_리프레시토큰을_삭제하고_쿠키를_삭제한다() {
		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			authService.logout(response);

			verify(refreshTokenRepository).deleteByUserId(1L);
			verify(cookieUtil).deleteCookies(response);
		}
	}
}
