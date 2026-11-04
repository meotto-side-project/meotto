package com.meotto.api.domain.user.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {

	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 유저를 찾을 수 없습니다.");

	private final HttpStatus status;
	private final String message;
}
