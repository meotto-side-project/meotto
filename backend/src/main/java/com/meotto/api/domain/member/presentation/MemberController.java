package com.meotto.api.domain.member.presentation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meotto.api.domain.member.application.service.MemberService;
import com.meotto.api.domain.member.presentation.response.HandleSuggestionResponse;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

	private final MemberService memberService;

	@Operation(summary = "아이디 랜덤 제안")
	@GetMapping("/handle-suggestion")
	public HandleSuggestionResponse getHandleSuggestion() {
		return HandleSuggestionResponse.from(memberService.suggestHandle());
	}
}
