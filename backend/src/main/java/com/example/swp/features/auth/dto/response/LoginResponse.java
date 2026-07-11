package com.example.swp.features.auth.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;

    public static LoginResponseBuilder builder() { return new LoginResponseBuilder(); }
    public static class LoginResponseBuilder {
        private String accessToken;
        private String refreshToken;

        public LoginResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public LoginResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }

        public LoginResponse build() {
            LoginResponse r = new LoginResponse();
            r.accessToken = this.accessToken;
            r.refreshToken = this.refreshToken;
            return r;
        }
    }
}


