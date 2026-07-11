package com.example.swp.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private PaginationInfo pagination;
    private String message;
    private final LocalDateTime timestamp = LocalDateTime.now();
    private ApiError error;

    public static <T> ApiResponseBuilder<T> builder() { return new ApiResponseBuilder<>(); }
    public static class ApiResponseBuilder<T> {
        private boolean success;
        private T data;
        private PaginationInfo pagination;
        private String message;
        private ApiError error;

        public ApiResponseBuilder<T> success(boolean success) { this.success = success; return this; }
        public ApiResponseBuilder<T> data(T data) { this.data = data; return this; }
        public ApiResponseBuilder<T> pagination(PaginationInfo pagination) { this.pagination = pagination; return this; }
        public ApiResponseBuilder<T> message(String message) { this.message = message; return this; }
        public ApiResponseBuilder<T> error(ApiError error) { this.error = error; return this; }

        public ApiResponse<T> build() {
            ApiResponse<T> r = new ApiResponse<>();
            r.success = this.success;
            r.data = this.data;
            r.pagination = this.pagination;
            r.message = this.message;
            r.error = this.error;
            return r;
        }
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation successful");
    }
    
    public static <E> ApiResponse<List<E>> success(Page<E> page) {
        return ApiResponse.<List<E>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(PaginationInfo.fromPage(page))
                .message("Operation successful")
                .build();
    }

    public static ApiResponse<Void> error(String code, String message, Object details) {
        return ApiResponse.<Void>builder()
                .success(false)
                .error(new ApiError(code, message, details))
                .build();
    }
     public static ApiResponse<Void> error(String code, String message) {
        return error(code, message, null);
    }
}

