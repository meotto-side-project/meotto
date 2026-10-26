package com.meotto.api.global.infrastructure.file;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cloud.aws.s3")
public record S3Properties(String bucket, String region) {
}
