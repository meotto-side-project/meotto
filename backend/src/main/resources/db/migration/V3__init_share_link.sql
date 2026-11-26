CREATE TABLE share_link (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    member_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_share_link_member_id (member_id),
    UNIQUE KEY uk_share_link_token (token)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
