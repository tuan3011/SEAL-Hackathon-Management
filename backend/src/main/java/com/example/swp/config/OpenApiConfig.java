package com.example.swp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Hackathon Management API")
                        .version("1.0.0")
                        .description("API documentation for the Hackathon Management backend."))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("Auth")
                .packagesToScan("com.example.swp.features.auth")
                .build();
    }

    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder()
                .group("Users")
                .packagesToScan(
                        "com.example.swp.features.user",
                        "com.example.swp.features.profile"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi eventsApi() {
        return GroupedOpenApi.builder()
                .group("Events")
                .packagesToScan(
                        "com.example.swp.features.hackathon_event",
                        "com.example.swp.features.event_registration",
                        "com.example.swp.features.round",
                        "com.example.swp.features.track",
                        "com.example.swp.features.prize"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi teamsApi() {
        return GroupedOpenApi.builder()
                .group("Teams")
                .packagesToScan(
                        "com.example.swp.features.team",
                        "com.example.swp.features.team_member",
                        "com.example.swp.features.team_invitation"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi submissionsApi() {
        return GroupedOpenApi.builder()
                .group("Submissions")
                .packagesToScan("com.example.swp.features.submission")
                .build();
    }

    @Bean
    public GroupedOpenApi scoresApi() {
        return GroupedOpenApi.builder()
                .group("Scores")
                .packagesToScan(
                        "com.example.swp.features.score",
                        "com.example.swp.features.criterion",
                        "com.example.swp.features.judge_assignment"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi rankingsApi() {
        return GroupedOpenApi.builder()
                .group("Rankings")
                .packagesToScan("com.example.swp.features.ranking")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationsApi() {
        return GroupedOpenApi.builder()
                .group("Notifications")
                .packagesToScan("com.example.swp.features.notification")
                .build();
    }

    @Bean
    public GroupedOpenApi exportApi() {
        return GroupedOpenApi.builder()
                .group("Exports")
                .packagesToScan("com.example.swp.features.export")
                .build();
    }

    @Bean
    public GroupedOpenApi mentorshipApi() {
        return GroupedOpenApi.builder()
                .group("Mentorship")
                .packagesToScan("com.example.swp.features.mentorship_request")
                .build();
    }

    @Bean
    public GroupedOpenApi auditLogsApi() {
        return GroupedOpenApi.builder()
                .group("AuditLogs")
                .packagesToScan("com.example.swp.features.audit_log")
                .build();
    }

    @Bean
    public GroupedOpenApi dashboardApi() {
        return GroupedOpenApi.builder()
                .group("Dashboard")
                .packagesToScan("com.example.swp.features.dashboard")
                .build();
    }
}
