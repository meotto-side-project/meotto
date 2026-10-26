package com.meotto.api.global.security.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SecurityErrorCode implements ErrorCode {

	ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");

	private final HttpStatus status;
	private final String message;
}
