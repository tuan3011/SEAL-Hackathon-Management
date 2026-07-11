package com.example.swp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SwpApplication {

    public static void main(String[] args) {
        SpringApplication.run(SwpApplication.class, args);
    }
}
