package com.meotto.api.domain.auth.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.meotto.api.domain.auth.application.service.AuthService;
import com.meotto.api.domain.auth.presentation.request.KakaoLoginRequest;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@Operation(summary = "카카오 소셜 로그인")
	@PostMapping("/auth/kakao")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void loginWithKakao(
		@Valid
		@RequestBody
		KakaoLoginRequest request, HttpServletResponse response) {
		authService.loginWithKakao(request.accessToken(), response);
	}

	@Operation(summary = "토큰 재발급")
	@PostMapping("/auth/reissue")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void reissue(
		@CookieValue("refresh_token")
		String refreshToken, HttpServletResponse response) {
		authService.reissue(refreshToken, response);
	}

	@Operation(summary = "로그아웃")
	@PostMapping("/auth/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout(HttpServletResponse response) {
		authService.logout(response);
	}
}
