package com.meotto.api.domain.auth.domain.repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.meotto.api.global.security.jwt.JwtProperties;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

	private static final String PREFIX = "refresh:";

	private final RedisTemplate<String, String> redisTemplate;
	private final JwtProperties jwtProperties;

	public void save(Long userId, String token) {
		redisTemplate.opsForValue().set(
			PREFIX + userId,
			token,
			jwtProperties.getRefreshExpiration(),
			TimeUnit.MILLISECONDS);
	}

	public Optional<String> findByUserId(Long userId) {
		return Optional.ofNullable(redisTemplate.opsForValue().get(PREFIX + userId));
	}

	public void deleteByUserId(Long userId) {
		redisTemplate.delete(PREFIX + userId);
	}
}
