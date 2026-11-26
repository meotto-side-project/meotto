package com.meotto.api.domain.sharelink.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meotto.api.domain.sharelink.domain.entity.ShareLinkEntity;

public interface ShareLinkRepository extends JpaRepository<ShareLinkEntity, Long> {

	Optional<ShareLinkEntity> findByMemberIdAndDeletedAtIsNull(Long memberId);

	Optional<ShareLinkEntity> findByTokenAndDeletedAtIsNull(String token);
}
