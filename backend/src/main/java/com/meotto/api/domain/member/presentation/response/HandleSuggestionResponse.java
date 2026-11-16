package com.meotto.api.domain.member.presentation.response;

public record HandleSuggestionResponse(String handle) {

	public static HandleSuggestionResponse from(String handle) {
		return new HandleSuggestionResponse(handle);
	}
}
