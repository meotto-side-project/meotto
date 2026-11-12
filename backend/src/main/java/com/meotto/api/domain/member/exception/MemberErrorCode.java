package com.meotto.api.domain.member.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberErrorCode implements ErrorCode {

	MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 회원을 찾을 수 없습니다.");

	private final HttpStatus status;
	private final String message;
}
