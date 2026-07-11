package com.example.swp.features.category_customer;

import com.example.swp.features.category_customer.dto.request.CategoryCustomerRequestDto;
import com.example.swp.features.category_customer.dto.response.CategoryCustomerResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/CategoryCustomers")
@RequiredArgsConstructor
public class CategoryCustomerController {

    private final CategoryCustomerService categoryCustomerService;

    @GetMapping
    public ResponseEntity<List<CategoryCustomerResponseDto>> getAllCategoryCustomers() {
        List<CategoryCustomerResponseDto> response = categoryCustomerService.getAllCategoryCustomers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryCustomerResponseDto> getCategoryCustomerById(@PathVariable Long id) {
        CategoryCustomerResponseDto response = categoryCustomerService.getCategoryCustomerById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<CategoryCustomerResponseDto> createCategoryCustomer(
            @Valid @RequestBody CategoryCustomerRequestDto requestDto) {
        CategoryCustomerResponseDto response = categoryCustomerService.createCategoryCustomer(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<CategoryCustomerResponseDto> updateCategoryCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CategoryCustomerRequestDto requestDto) {
        CategoryCustomerResponseDto response = categoryCustomerService.updateCategoryCustomer(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteCategoryCustomer(@PathVariable Long id) {
        categoryCustomerService.deleteCategoryCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
