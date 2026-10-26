package com.meotto.api.global.infrastructure.notification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

public record ErrorNotificationData(
	String errorType,
	String message,
	String stackTrace,
	String serverName,
	LocalDateTime timestamp) {
	private static final int MAX_STACK_TRACE_LINES = 10;

	public static ErrorNotificationData from(Exception ex) {
		return new ErrorNotificationData(
			ex.getClass().getSimpleName(),
			ex.getMessage() != null ? ex.getMessage() : "No message",
			extractStackTrace(ex),
			System.getenv().getOrDefault("SERVER_NAME", "local"),
			LocalDateTime.now());
	}

	private static String extractStackTrace(Exception ex) {
		return Arrays.stream(ex.getStackTrace())
			.limit(MAX_STACK_TRACE_LINES)
			.map(StackTraceElement::toString)
			.collect(Collectors.joining("\n"));
	}
}
