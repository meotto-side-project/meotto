package com.meotto.api.domain.member.presentation.response;

import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.SentPraiseVisibility;

public record MemberResponse(
	Long id,
	String nickname,
	String handle,
	String profileImageUrl,
	Boolean notificationEnabled,
	Boolean boardPublic,
	SentPraiseVisibility sentPraiseVisibility,
	boolean profileCompleted) {

	public static MemberResponse from(Member member) {
		return new MemberResponse(
			member.id(),
			member.nickname(),
			member.handle(),
			member.profileImageUrl(),
			member.notificationEnabled(),
			member.boardPublic(),
			member.sentPraiseVisibility(),
			member.handle() != null);
	}
}
