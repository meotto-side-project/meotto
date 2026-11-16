package com.meotto.api.domain.auth.infrastructure.client;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meotto.api.domain.auth.exception.AuthErrorCode;
import com.meotto.api.domain.auth.infrastructure.dto.ApplePublicKey;
import com.meotto.api.domain.auth.infrastructure.dto.ApplePublicKeysResponse;
import com.meotto.api.domain.auth.infrastructure.dto.AppleUserInfo;
import com.meotto.api.global.exception.BusinessException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppleApiClient {

	private static final String ISSUER = "https://appleid.apple.com";

	private final WebClient appleWebClient;
	private final ObjectMapper objectMapper;

	@Value("${apple.bundle-id}")
	private String bundleId;

	public AppleUserInfo verifyIdentityToken(String identityToken) {
		try {
			String kid = extractKid(identityToken);
			RSAPublicKey publicKey = resolvePublicKey(kid);

			Claims claims = Jwts.parser()
				.verifyWith(publicKey)
				.build()
				.parseSignedClaims(identityToken)
				.getPayload();

			if (!ISSUER.equals(claims.getIssuer()) || !bundleId.equals(claims.get("aud", String.class))) {
				throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
			}

			return AppleUserInfo.from(claims);
		} catch (JwtException | IllegalArgumentException e) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
	}

	private String extractKid(String identityToken) {
		String[] parts = identityToken.split("\\.");
		if (parts.length < 2) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}

		String headerJson = new String(Decoders.BASE64URL.decode(parts[0]), StandardCharsets.UTF_8);
		Map<?, ?> header = readHeader(headerJson);
		Object kid = header.get("kid");
		if (kid == null) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
		return kid.toString();
	}

	private Map<?, ?> readHeader(String headerJson) {
		try {
			return objectMapper.readValue(headerJson, Map.class);
		} catch (Exception e) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
	}

	private RSAPublicKey resolvePublicKey(String kid) {
		ApplePublicKey key = fetchPublicKeys().keys().stream()
			.filter(k -> kid.equals(k.kid()))
			.findFirst()
			.orElseThrow(() -> new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN));

		BigInteger modulus = new BigInteger(1, Decoders.BASE64URL.decode(key.n()));
		BigInteger exponent = new BigInteger(1, Decoders.BASE64URL.decode(key.e()));

		try {
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			return (RSAPublicKey)keyFactory.generatePublic(new RSAPublicKeySpec(modulus, exponent));
		} catch (Exception e) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
	}

	private ApplePublicKeysResponse fetchPublicKeys() {
		ApplePublicKeysResponse response = appleWebClient.get()
			.uri("/auth/keys")
			.retrieve()
			.bodyToMono(ApplePublicKeysResponse.class)
			.block();

		if (response == null) {
			throw new BusinessException(AuthErrorCode.INVALID_APPLE_TOKEN);
		}
		return response;
	}
}
