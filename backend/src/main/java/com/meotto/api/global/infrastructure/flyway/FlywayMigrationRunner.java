package com.meotto.api.global.infrastructure.flyway;

import org.flywaydb.core.Flyway;

public final class FlywayMigrationRunner {

	public static void run() {
		String host = System.getenv().getOrDefault("RELATION_DATABASE_HOST", "localhost");
		String port = System.getenv("RELATION_DATABASE_PORT");
		String database = System.getenv().getOrDefault("RELATION_DATABASE_DATABASE", "meotto");
		String username = System.getenv("RELATION_DATABASE_USERNAME");
		String password = System.getenv("RELATION_DATABASE_PASSWORD");

		String url = ("jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true"
			+ "&serverTimezone=Asia/Seoul&characterEncoding=UTF-8")
			.formatted(host, port, database);

		Flyway.configure()
			.dataSource(url, username, password)
			.baselineOnMigrate(true)
			.baselineVersion("1")
			.load()
			.migrate();
	}
}
