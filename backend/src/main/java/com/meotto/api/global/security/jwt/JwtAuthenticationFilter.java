package com.meotto.api.global.security.jwt;

import java.io.IOException;
import java.util.List;

import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.security.cookie.CookieUtil;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenExtractor jwtTokenExtractor;
	private final CookieUtil cookieUtil;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {
		String token = cookieUtil.extractAccessToken(request);

		if (token != null) {
			try {
				Claims claims = jwtTokenExtractor.parseClaims(token);
				Long userId = jwtTokenExtractor.getUserId(claims);
				String role = jwtTokenExtractor.getRole(claims);
				List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId,
					null, authorities);
				SecurityContextHolder.getContext().setAuthentication(authentication);
				MDC.put("userId", userId.toString());
			} catch (BusinessException ex) {
				log.debug("JWT 인증 건너뜀: {}", ex.getMessage());
			}
		}

		filterChain.doFilter(request, response);
	}
}
