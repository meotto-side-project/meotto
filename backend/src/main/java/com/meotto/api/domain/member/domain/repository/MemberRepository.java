package com.meotto.api.domain.member.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.meotto.api.domain.member.domain.entity.MemberEntity;
import com.meotto.api.domain.member.domain.model.enums.OAuthProvider;

public interface MemberRepository extends JpaRepository<MemberEntity, Long> {

	Optional<MemberEntity> findByIdAndDeletedAtIsNull(Long id);

	@Query("SELECT m FROM MemberEntity m WHERE m.provider = :provider "
		+ "AND m.providerId = :providerId AND m.deletedAt IS NULL")
	Optional<MemberEntity> findByProviderAndProviderId(
		@Param("provider")
		OAuthProvider provider,
		@Param("providerId")
		String providerId);
}
