package com.meotto.api.global.exception;

import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.meotto.api.global.infrastructure.notification.ErrorNotificationData;
import com.meotto.api.global.infrastructure.notification.NotificationType;
import com.meotto.api.global.infrastructure.notification.Notifier;

import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final Notifier notifier;

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
		return ResponseEntity
			.status(ex.getErrorCode().getStatus())
			.body(ErrorResponse.of(ex.getErrorCode(), ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(
		MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(error -> error.getField() + ": " + error.getDefaultMessage())
			.collect(Collectors.joining(", "));

		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("VALIDATION_ERROR", message));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ErrorResponse> handleConstraintViolationException(
		ConstraintViolationException ex) {
		String message = ex.getConstraintViolations()
			.stream()
			.map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
			.collect(Collectors.joining(", "));

		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("CONSTRAINT_VIOLATION", message));
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
		NoResourceFoundException ex) {
		final String message = String.format("요청한 리소스(%s)를 찾을 수 없습니다.", ex.getResourcePath());
		return ResponseEntity
			.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse("NOT_FOUND", message));
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(
		HttpRequestMethodNotSupportedException ex) {
		return ResponseEntity
			.status(HttpStatus.METHOD_NOT_ALLOWED)
			.body(new ErrorResponse("METHOD_NOT_ALLOWED", "지원하지 않는 HTTP 메서드입니다."));
	}

	@ExceptionHandler(MissingRequestCookieException.class)
	public ResponseEntity<ErrorResponse> handleMissingCookieException(MissingRequestCookieException ex) {
		String message = "필수 쿠키가 없습니다: " + ex.getCookieName();
		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("MISSING_COOKIE", message));
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ErrorResponse> handleMissingParameterException(
		MissingServletRequestParameterException ex) {
		String message = "필수 파라미터가 누락되었습니다: " + ex.getParameterName();
		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("MISSING_PARAMETER", message));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ErrorResponse> handleTypeMismatchException(
		MethodArgumentTypeMismatchException ex) {
		String message = "파라미터 타입이 올바르지 않습니다: " + ex.getName();
		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("TYPE_MISMATCH", message));
	}

	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<ErrorResponse> handleMediaTypeNotSupportedException(
		HttpMediaTypeNotSupportedException ex) {
		return ResponseEntity
			.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
			.body(new ErrorResponse("UNSUPPORTED_MEDIA_TYPE", "지원하지 않는 Content-Type입니다."));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> handleMessageNotReadableException(
		HttpMessageNotReadableException ex) {
		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("INVALID_REQUEST_BODY", "요청 본문을 읽을 수 없습니다."));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
		return ResponseEntity
			.badRequest()
			.body(new ErrorResponse("DATA_INTEGRITY_VIOLATION", "입력값이 데이터베이스 제약 조건을 위반했습니다."));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleException(Exception ex) {
		log.error("Unhandled exception occurred", ex);
		notifier.notify(NotificationType.ERROR, ErrorNotificationData.from(ex));

		return ResponseEntity
			.internalServerError()
			.body(new ErrorResponse("INTERNAL_SERVER_ERROR", "서버 에러가 발생했습니다."));
	}
}
