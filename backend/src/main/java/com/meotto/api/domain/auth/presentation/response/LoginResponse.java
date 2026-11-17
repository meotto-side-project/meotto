package com.meotto.api.domain.auth.presentation.response;

public record LoginResponse(boolean isNewMember, Long memberId) {
}
