package com.meotto.api.domain.member.application.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.member.exception.MemberErrorCode;
import com.meotto.api.global.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

	private static final String HANDLE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";
	private static final int HANDLE_LENGTH = 8;
	private static final int MAX_SUGGESTION_ATTEMPTS = 10;

	private final MemberRepository memberRepository;
	private final SecureRandom random = new SecureRandom();

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
