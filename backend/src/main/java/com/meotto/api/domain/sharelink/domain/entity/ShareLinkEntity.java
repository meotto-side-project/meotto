package com.meotto.api.domain.sharelink.domain.entity;

import com.meotto.api.domain.sharelink.domain.model.ShareLink;
import com.meotto.api.global.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "share_link", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"member_id"}),
	@UniqueConstraint(columnNames = {"token"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ShareLinkEntity extends BaseEntity {

	@Column(name = "member_id", nullable = false)
	private Long memberId;

	@Column(nullable = false)
	private String token;

	public static ShareLinkEntity from(ShareLink model) {
		return new ShareLinkEntity(model.memberId(), model.token());
	}

	public ShareLink toModel() {
		return new ShareLink(getId(), memberId, token, getCreatedAt(), getUpdatedAt());
	}
}
