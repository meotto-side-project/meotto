package com.meotto.api.domain.auth.infrastructure.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import org.junit.jupiter.api.Test;

import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.global.exception.BusinessException;

class KakaoUserInfoTest {

	@Test
	void from_카카오응답을_파싱한다() {
		Map<String, Object> attributes = Map.of(
			"id", 123456789L,
			"kakao_account", Map.of(
				"email", "user@kakao.com",
				"profile", Map.of(
					"nickname", "멋토유저",
					"profile_image_url", "https://example.com/profile.png")));

		KakaoUserInfo info = KakaoUserInfo.from(attributes);

		assertThat(info.providerId()).isEqualTo("123456789");
		assertThat(info.email()).isEqualTo("user@kakao.com");
		assertThat(info.nickname()).isEqualTo("멋토유저");
		assertThat(info.profileImageUrl()).isEqualTo("https://example.com/profile.png");
	}

	@Test
	void from_id가없으면_예외() {
		Map<String, Object> attributes = Map.of("kakao_account", Map.of("email", "user@kakao.com"));

		assertThatThrownBy(() -> KakaoUserInfo.from(attributes))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(AuthErrorCode.INVALID_KAKAO_TOKEN));
	}
}
