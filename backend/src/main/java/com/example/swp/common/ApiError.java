package com.example.swp.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private String code;
    private String message;
    private Object details;
    
    public ApiError() {}
    public ApiError(String code, String message, Object details) {
        this.code = code;
        this.message = message;
        this.details = details;
    }
}
