package com.meotto.api.domain.auth.presentation.response;

public record LoginResponse(boolean needsProfileSetup, Long memberId) {
}
