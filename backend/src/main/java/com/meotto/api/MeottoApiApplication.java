package com.meotto.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.meotto.api.global.infrastructure.flyway.FlywayMigrationRunner;

@EnableJpaAuditing
@EnableScheduling
@SpringBootApplication
public class MeottoApiApplication {

	public static void main(String[] args) {
		FlywayMigrationRunner.run();
		SpringApplication.run(MeottoApiApplication.class, args);
	}

}
