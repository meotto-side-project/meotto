package com.meotto.api.domain.member.domain.entity;

import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.MemberRole;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.global.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member", uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MemberEntity extends BaseEntity {

	@Column(nullable = false)
	private String nickname;

	@Column(name = "profile_image_url", nullable = true)
	private String profileImageUrl;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private OAuthProvider provider;

	@Column(name = "provider_id", nullable = false)
	private String providerId;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private MemberRole role;

	public static MemberEntity from(Member model) {
		return new MemberEntity(
			model.nickname(), model.profileImageUrl(), model.provider(), model.providerId(), model.role());
	}

	public Member toModel() {
		return new Member(
			getId(), nickname, profileImageUrl, provider, providerId, role, getCreatedAt(), getUpdatedAt());
	}
}
