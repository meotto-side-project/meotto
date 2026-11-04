package com.meotto.api.domain.user.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.meotto.api.domain.user.domain.entity.UserEntity;
import com.meotto.api.domain.user.domain.model.enums.OAuthProvider;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

	Optional<UserEntity> findByIdAndDeletedAtIsNull(Long id);

	@Query("SELECT u FROM UserEntity u WHERE u.provider = :provider "
		+ "AND u.providerId = :providerId AND u.deletedAt IS NULL")
	Optional<UserEntity> findByProviderAndProviderId(
		@Param("provider")
		OAuthProvider provider,
		@Param("providerId")
		String providerId);
}
