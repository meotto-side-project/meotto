package com.meotto.api.domain.member.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.member.exception.MemberErrorCode;
import com.meotto.api.global.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

	@InjectMocks
	private MemberService memberService;

	@Mock
	private MemberRepository memberRepository;

	@Test
	void suggestHandle_중복이없으면_8자리_랜덤_아이디를_반환한다() {
		when(memberRepository.existsByHandle(any())).thenReturn(false);

		String handle = memberService.suggestHandle();

		assertThat(handle).hasSize(8);
		assertThat(handle).matches("[a-z0-9]{8}");
	}

	@Test
	void suggestHandle_계속_중복이면_예외를_던진다() {
		when(memberRepository.existsByHandle(any())).thenReturn(true);

		assertThatThrownBy(() -> memberService.suggestHandle())
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(MemberErrorCode.HANDLE_SUGGESTION_FAILED));
	}
}
