package com.meotto.api.domain.user.domain.entity;

import com.meotto.api.domain.user.domain.model.User;
import com.meotto.api.domain.user.domain.model.enums.OAuthProvider;
import com.meotto.api.domain.user.domain.model.enums.UserRole;
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
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserEntity extends BaseEntity {

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
	private UserRole role;

	public static UserEntity from(User model) {
		return new UserEntity(
			model.nickname(), model.profileImageUrl(), model.provider(), model.providerId(), model.role());
	}

	public User toModel() {
		return new User(
			getId(), nickname, profileImageUrl, provider, providerId, role, getCreatedAt(), getUpdatedAt());
	}
}
