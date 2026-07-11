package com.example.swp.features.category_customer.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCustomerRequestDto {

    @NotNull(message = "Date of birth cannot be null")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Address cannot be blank")
    private String address;

    @NotBlank(message = "Code cannot be blank")
    private String code;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Identification cannot be blank")
    private String identification;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Phone number cannot be blank")
    private String phone;

    @NotBlank(message = "Zip code cannot be blank")
    private String zipCode;
}
