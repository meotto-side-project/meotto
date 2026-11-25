package com.meotto.api.domain.member.presentation.response;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;

class MemberResponseTest {

	@Test
	void from_handle이_없으면_profileCompleted가_false다() {
		Member member = MemberEntity.from(
			Member.create("닉네임", null, OAuthProvider.KAKAO, "provider-id")).toModel();

		MemberResponse response = MemberResponse.from(member);

		assertThat(response.profileCompleted()).isFalse();
	}

	@Test
	void from_handle이_있으면_profileCompleted가_true다() {
		MemberEntity entity = MemberEntity.from(
			Member.create("닉네임", null, OAuthProvider.KAKAO, "provider-id"));
		entity.updateHandle("meotto_user");

		MemberResponse response = MemberResponse.from(entity.toModel());

		assertThat(response.profileCompleted()).isTrue();
	}
}
