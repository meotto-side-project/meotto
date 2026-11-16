package com.meotto.api.domain.auth.infrastructure.dto;

import java.util.List;

public record ApplePublicKeysResponse(List<ApplePublicKey> keys) {
}
