package com.meotto.api.domain.member.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberErrorCode implements ErrorCode {

	MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 회원을 찾을 수 없습니다."),
	HANDLE_SUGGESTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "아이디 제안을 생성하지 못했습니다. 다시 시도해주세요."),
	INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "닉네임은 2~10자의 한글/영문/숫자/공백만 허용합니다.");

	private final HttpStatus status;
	private final String message;
}
