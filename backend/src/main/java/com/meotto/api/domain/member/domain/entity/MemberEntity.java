package com.meotto.api.domain.member.domain.entity;

import java.time.LocalDateTime;

import com.meotto.api.domain.member.domain.model.Member;
import com.meotto.api.domain.member.domain.model.enums.MemberRole;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.member.domain.model.enums.SentPraiseVisibility;
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
@Table(name = "member", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"provider", "provider_id"}),
	@UniqueConstraint(columnNames = {"handle"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MemberEntity extends BaseEntity {

	@Column(nullable = false)
	private String nickname;

	@Column(name = "profile_image_url", nullable = true)
	private String profileImageUrl;

	@Column(nullable = true)
	private String handle;

	@Column(name = "notification_enabled", nullable = true)
	private Boolean notificationEnabled;

	@Column(name = "board_public", nullable = true)
	private Boolean boardPublic;

	@Column(name = "sent_praise_visibility", nullable = false)
	@Enumerated(EnumType.STRING)
	private SentPraiseVisibility sentPraiseVisibility;

	@Column(name = "last_active_at", nullable = true)
	private LocalDateTime lastActiveAt;

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
			model.nickname(),
			model.profileImageUrl(),
			model.handle(),
			model.notificationEnabled(),
			model.boardPublic(),
			model.sentPraiseVisibility(),
			model.lastActiveAt(),
			model.provider(),
			model.providerId(),
			model.role());
	}

	public void updateNickname(String nickname) {
		this.nickname = nickname;
	}

	public void updateHandle(String handle) {
		this.handle = handle;
	}

	public void updateProfileImageUrl(String profileImageUrl) {
		this.profileImageUrl = profileImageUrl;
	}

	public void updateNotificationEnabled(Boolean notificationEnabled) {
		this.notificationEnabled = notificationEnabled;
	}

	public void updateBoardPublic(Boolean boardPublic) {
		this.boardPublic = boardPublic;
	}

	public void updateSentPraiseVisibility(SentPraiseVisibility sentPraiseVisibility) {
		this.sentPraiseVisibility = sentPraiseVisibility;
	}

	public Member toModel() {
		return new Member(
			getId(),
			nickname,
			profileImageUrl,
			handle,
			notificationEnabled,
			boardPublic,
			sentPraiseVisibility,
			lastActiveAt,
			provider,
			providerId,
			role,
			getCreatedAt(),
			getUpdatedAt());
	}
}
