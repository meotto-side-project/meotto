CREATE TABLE member (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    nickname VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(255) NULL,
    handle VARCHAR(255) NULL,
    notification_enabled BIT(1) NULL,
    board_public BIT(1) NULL,
    sent_praise_visibility ENUM('ALL', 'NAME_ONLY', 'PRIVATE') NOT NULL,
    last_active_at DATETIME(6) NULL,
    provider ENUM('KAKAO') NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_member_provider_provider_id (provider, provider_id),
    UNIQUE KEY uk_member_handle (handle)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
