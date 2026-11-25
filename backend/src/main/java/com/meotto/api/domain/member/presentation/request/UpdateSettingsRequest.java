package com.meotto.api.domain.member.presentation.request;

public record UpdateSettingsRequest(Boolean notificationEnabled, Boolean boardPublic) {
}
