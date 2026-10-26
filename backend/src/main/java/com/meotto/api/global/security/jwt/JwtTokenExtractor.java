package com.meotto.api.global.security.jwt;

import org.springframework.stereotype.Component;

import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.security.exception.JwtErrorCode;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenExtractor {

	private final JwtProperties jwtProperties;

	public Claims parseClaims(String token) {
		try {
			return Jwts.parser()
				.verifyWith(jwtProperties.getSecretKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
		} catch (ExpiredJwtException e) {
			throw new BusinessException(JwtErrorCode.EXPIRED_TOKEN);
		} catch (SecurityException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
			throw new BusinessException(JwtErrorCode.INVALID_TOKEN);
		}
	}

	public Long getUserId(Claims claims) {
		try {
			return Long.parseLong(claims.getSubject());
		} catch (NumberFormatException e) {
			throw new BusinessException(JwtErrorCode.INVALID_TOKEN);
		}
	}

	public String getEmail(Claims claims) {
		return claims.get("email", String.class);
	}

	public String getRole(Claims claims) {
		String role = claims.get("role", String.class);
		if (role == null) {
			throw new BusinessException(JwtErrorCode.INVALID_TOKEN);
		}
		return role;
	}
}
