package com.example.swp.features.category_customer.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCustomerResponseDto {
    private Long id;
    private LocalDate dateOfBirth;
    private LocalDate modifiedDate;
    private String address;
    private String code;
    private String email;
    private String identification;
    private String name;
    private String phone;
    private String zipCode;
}
