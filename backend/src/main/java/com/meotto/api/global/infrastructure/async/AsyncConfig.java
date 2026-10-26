package com.meotto.api.global.infrastructure.async;

import java.util.Map;
import java.util.concurrent.Executor;

import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {

	@Override
	@Bean(name = "asyncTaskExecutor")
	public Executor getAsyncExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(5);
		executor.setMaxPoolSize(10);
		executor.setQueueCapacity(100);
		executor.setThreadNamePrefix("async-");
		executor.setTaskDecorator(runnable -> {
			Map<String, String> mdcContext = MDC.getCopyOfContextMap();
			return () -> {
				try {
					if (mdcContext != null) {
						MDC.setContextMap(mdcContext);
					}
					runnable.run();
				} finally {
					MDC.clear();
				}
			};
		});
		executor.initialize();
		return executor;
	}
}
