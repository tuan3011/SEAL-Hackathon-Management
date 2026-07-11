package com.example.swp.features.category_customer;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "category_customer")
public class CategoryCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "modified_date", nullable = false)
    private LocalDate modifiedDate;

    @Column(nullable = false)
    private String address;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String identification;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(name = "zip_code", nullable = false)
    private String zipCode;
}
