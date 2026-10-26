package com.meotto.api.global.security.cookie;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cookie")
public class CookieProperties {

	private boolean secure = true;
	private String sameSite = "None";
	private String domain = "";
	private String path = "/";
}
