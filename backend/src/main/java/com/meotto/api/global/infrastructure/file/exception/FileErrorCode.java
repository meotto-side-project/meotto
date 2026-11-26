package com.meotto.api.global.infrastructure.file.exception;

import org.springframework.http.HttpStatus;

import com.meotto.api.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileErrorCode implements ErrorCode {

	INVALID_IMAGE(HttpStatus.BAD_REQUEST, "빈 파일, 10MB 초과, jpg/png/webp/heic 외 포맷은 업로드할 수 없습니다.");

	private final HttpStatus status;
	private final String message;
}
