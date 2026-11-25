package com.meotto.api.domain.member.application.service;

import java.security.SecureRandom;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.SentPraiseVisibility;
import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.member.exception.MemberErrorCode;
import com.meotto.api.domain.member.presentation.request.UpdateProfileRequest;
import com.meotto.api.domain.member.presentation.request.UpdateSentPraiseVisibilityRequest;
import com.meotto.api.domain.member.presentation.request.UpdateSettingsRequest;
import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.infrastructure.file.FileStorageService;
import com.meotto.api.global.security.context.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

	private static final String HANDLE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";
	private static final int HANDLE_LENGTH = 8;
	private static final int MAX_SUGGESTION_ATTEMPTS = 10;
	private static final Pattern NICKNAME_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9 ]{2,10}$");

	private final MemberRepository memberRepository;
	private final FileStorageService fileStorageService;
	private final SecureRandom random = new SecureRandom();

	public Member getMe() {
		return getCurrentMemberEntity().toModel();
	}

	public String uploadProfileImage(MultipartFile file) {
		return fileStorageService.storeImage(file);
	}

	@Transactional
	public void updateProfile(UpdateProfileRequest request) {
		MemberEntity member = getCurrentMemberEntity();

		if (request.nickname() != null) {
			validateNickname(request.nickname());
			member.updateNickname(request.nickname());
		}
		if (request.profileImageUrl() != null) {
			member.updateProfileImageUrl(request.profileImageUrl());
		}
	}

	@Transactional
	public void updateSettings(UpdateSettingsRequest request) {
		MemberEntity member = getCurrentMemberEntity();

		if (request.notificationEnabled() != null) {
			member.updateNotificationEnabled(request.notificationEnabled());
		}
		if (request.boardPublic() != null) {
			member.updateBoardPublic(request.boardPublic());
		}
	}

	@Transactional
	public void updateSentPraiseVisibility(UpdateSentPraiseVisibilityRequest request) {
		MemberEntity member = getCurrentMemberEntity();
		member.updateSentPraiseVisibility(parseVisibility(request.visibility()));
	}

	private SentPraiseVisibility parseVisibility(String visibility) {
		try {
			return SentPraiseVisibility.valueOf(visibility);
		} catch (IllegalArgumentException | NullPointerException e) {
			throw new BusinessException(MemberErrorCode.INVALID_VISIBILITY);
		}
	}

	private MemberEntity getCurrentMemberEntity() {
		Long userId = SecurityUtil.getCurrentUserId();
		return memberRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new BusinessException(MemberErrorCode.MEMBER_NOT_FOUND));
	}

	private void validateNickname(String nickname) {
		if (!NICKNAME_PATTERN.matcher(nickname).matches()) {
			throw new BusinessException(MemberErrorCode.INVALID_NICKNAME);
		}
	}

	public String suggestHandle() {
		for (int attempt = 0; attempt < MAX_SUGGESTION_ATTEMPTS; attempt++) {
			String handle = generateRandomHandle();
			if (!memberRepository.existsByHandle(handle)) {
				return handle;
			}
		}
		throw new BusinessException(MemberErrorCode.HANDLE_SUGGESTION_FAILED);
	}

	private String generateRandomHandle() {
		StringBuilder builder = new StringBuilder(HANDLE_LENGTH);
		for (int i = 0; i < HANDLE_LENGTH; i++) {
			builder.append(HANDLE_CHARACTERS.charAt(random.nextInt(HANDLE_CHARACTERS.length())));
		}
		return builder.toString();
	}
}
