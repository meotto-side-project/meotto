package com.meotto.api.domain.member.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.meotto.api.domain.member.application.service.MemberService;
import com.meotto.api.domain.member.presentation.request.UpdateProfileRequest;
import com.meotto.api.domain.member.presentation.response.HandleSuggestionResponse;
import com.meotto.api.domain.member.presentation.response.ProfileImageUploadResponse;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

	private final MemberService memberService;

	@Operation(summary = "아이디 랜덤 제안")
	@GetMapping("/handle-suggestion")
	public HandleSuggestionResponse getHandleSuggestion() {
		return HandleSuggestionResponse.from(memberService.suggestHandle());
	}

	@Operation(summary = "프로필 사진 업로드")
	@PostMapping("/me/profile-image")
	@ResponseStatus(HttpStatus.CREATED)
	public ProfileImageUploadResponse uploadProfileImage(
		@RequestParam("file")
		MultipartFile file) {
		return ProfileImageUploadResponse.from(memberService.uploadProfileImage(file));
	}

	@Operation(summary = "프로필 변경")
	@PatchMapping("/me/profile")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void updateProfile(
		@RequestBody
		UpdateProfileRequest request) {
		memberService.updateProfile(request);
	}
}
