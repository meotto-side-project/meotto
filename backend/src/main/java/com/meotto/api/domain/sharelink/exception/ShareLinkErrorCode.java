package com.meotto.api.domain.sharelink.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ShareLinkErrorCode implements ErrorCode {

	SHARE_LINK_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 공유 링크입니다."),
	SHARE_LINK_INVALID(HttpStatus.GONE, "더 이상 유효하지 않은 공유 링크입니다.");

	private final HttpStatus status;
	private final String message;
}
