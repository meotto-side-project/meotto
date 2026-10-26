package com.meotto.api.global.security.jwt;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

	private final JwtProperties jwtProperties;

	public String createAccessToken(Long userId, String email, String role) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtProperties.getAccessExpiration());

		return Jwts.builder()
			.subject(String.valueOf(userId))
			.claim("email", email)
			.claim("role", role)
			.issuedAt(now)
			.expiration(expiryDate)
			.signWith(jwtProperties.getSecretKey())
			.compact();
	}

	public String createRefreshToken(Long userId) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshExpiration());

		return Jwts.builder()
			.subject(String.valueOf(userId))
			.issuedAt(now)
			.expiration(expiryDate)
			.signWith(jwtProperties.getSecretKey())
			.compact();
	}
}
