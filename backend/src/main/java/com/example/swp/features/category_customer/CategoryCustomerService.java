package com.example.swp.features.category_customer;

import com.example.swp.features.category_customer.dto.request.CategoryCustomerRequestDto;
import com.example.swp.features.category_customer.dto.response.CategoryCustomerResponseDto;

import java.util.List;

public interface CategoryCustomerService {
    List<CategoryCustomerResponseDto> getAllCategoryCustomers();
    CategoryCustomerResponseDto getCategoryCustomerById(Long id);
    CategoryCustomerResponseDto createCategoryCustomer(CategoryCustomerRequestDto requestDto);
    CategoryCustomerResponseDto updateCategoryCustomer(Long id, CategoryCustomerRequestDto requestDto);
    void deleteCategoryCustomer(Long id);
}
