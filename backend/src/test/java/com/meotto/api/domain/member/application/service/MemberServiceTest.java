package com.meotto.api.domain.member.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.member.domain.repository.MemberRepository;
import com.meotto.api.domain.member.exception.MemberErrorCode;
import com.meotto.api.domain.member.presentation.request.UpdateProfileRequest;
import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.infrastructure.file.FileStorageService;
import com.meotto.api.global.security.context.SecurityUtil;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

	@InjectMocks
	private MemberService memberService;

	@Mock
	private MemberRepository memberRepository;

	@Mock
	private FileStorageService fileStorageService;

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

	@Test
	void uploadProfileImage_FileStorageService에_위임하고_URL을_반환한다() {
		MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", "data".getBytes());
		when(fileStorageService.storeImage(file))
			.thenReturn("https://test-bucket.s3.ap-northeast-2.amazonaws.com/a.jpg");

		String url = memberService.uploadProfileImage(file);

		assertThat(url).isEqualTo("https://test-bucket.s3.ap-northeast-2.amazonaws.com/a.jpg");
	}

	@Test
	void updateProfile_유효한_닉네임이면_변경된다() {
		MemberEntity member = MemberEntity.from(
			Member.create("기존닉네임", null, OAuthProvider.KAKAO, "provider-id"));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(member));

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			memberService.updateProfile(new UpdateProfileRequest("새닉네임", "https://example.com/a.jpg"));
		}

		assertThat(member.getNickname()).isEqualTo("새닉네임");
		assertThat(member.getProfileImageUrl()).isEqualTo("https://example.com/a.jpg");
	}

	@Test
	void updateProfile_닉네임이_1자면_예외를_던진다() {
		MemberEntity member = MemberEntity.from(
			Member.create("기존닉네임", null, OAuthProvider.KAKAO, "provider-id"));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(member));

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			assertThatThrownBy(() -> memberService.updateProfile(new UpdateProfileRequest("가", null)))
				.isInstanceOf(BusinessException.class)
				.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
					.isEqualTo(MemberErrorCode.INVALID_NICKNAME));
		}
	}

	@Test
	void updateProfile_닉네임에_특수문자가있으면_예외를_던진다() {
		MemberEntity member = MemberEntity.from(
			Member.create("기존닉네임", null, OAuthProvider.KAKAO, "provider-id"));
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(member));

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			assertThatThrownBy(() -> memberService.updateProfile(new UpdateProfileRequest("닉네임!!", null)))
				.isInstanceOf(BusinessException.class)
				.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
					.isEqualTo(MemberErrorCode.INVALID_NICKNAME));
		}
	}

	@Test
	void updateProfile_회원이_없으면_404_예외() {
		when(memberRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

		try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
			mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);

			assertThatThrownBy(() -> memberService.updateProfile(new UpdateProfileRequest("닉네임", null)))
				.isInstanceOf(BusinessException.class)
				.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
					.isEqualTo(MemberErrorCode.MEMBER_NOT_FOUND));
		}
	}
}
