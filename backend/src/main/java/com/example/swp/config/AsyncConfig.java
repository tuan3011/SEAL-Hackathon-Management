package com.example.swp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Cấu hình Async + Retry cho hệ thống.
 *
 * - @EnableAsync:  Kích hoạt xử lý annotation @Async qua AOP proxy.
 * - @EnableRetry:  Kích hoạt xử lý annotation @Retryable qua AOP proxy.
 *
 * Thread pool "notificationExecutor" dùng riêng cho gửi notification,
 * tách biệt khỏi HTTP request thread pool để không ảnh hưởng API response time.
 */
@Configuration
@EnableAsync
@EnableRetry
public class AsyncConfig {

    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);       // 2 thread luôn sẵn sàng
        executor.setMaxPoolSize(5);        // Tối đa 5 thread khi tải cao
        executor.setQueueCapacity(100);    // Hàng đợi chứa tối đa 100 task
        executor.setThreadNamePrefix("notification-");
        executor.initialize();
        return executor;
    }
}
