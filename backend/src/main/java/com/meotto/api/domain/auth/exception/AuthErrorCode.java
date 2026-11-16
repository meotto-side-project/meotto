package com.meotto.api.domain.auth.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {

	INVALID_KAKAO_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 카카오 액세스 토큰입니다."),
	REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "리프레시 토큰이 존재하지 않습니다. 다시 로그인해주세요."),
	INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다.");

	private final HttpStatus status;
	private final String message;
}
