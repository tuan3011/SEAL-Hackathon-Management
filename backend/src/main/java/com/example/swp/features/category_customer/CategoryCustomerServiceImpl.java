package com.example.swp.features.category_customer;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.category_customer.dto.request.CategoryCustomerRequestDto;
import com.example.swp.features.category_customer.dto.response.CategoryCustomerResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CategoryCustomerServiceImpl implements CategoryCustomerService {

    private final CategoryCustomerRepository categoryCustomerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryCustomerResponseDto> getAllCategoryCustomers() {
        return categoryCustomerRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryCustomerResponseDto getCategoryCustomerById(Long id) {
        CategoryCustomer categoryCustomer = categoryCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category customer not found with ID: " + id));
        return mapToResponseDto(categoryCustomer);
    }

    @Override
    @Transactional
    public CategoryCustomerResponseDto createCategoryCustomer(CategoryCustomerRequestDto requestDto) {
        if (categoryCustomerRepository.existsByCode(requestDto.getCode())) {
            throw new IllegalStateException("Category customer code already exists: " + requestDto.getCode());
        }

        CategoryCustomer categoryCustomer = CategoryCustomer.builder()
                .dateOfBirth(requestDto.getDateOfBirth())
                .modifiedDate(LocalDate.now())
                .address(requestDto.getAddress())
                .code(requestDto.getCode())
                .email(requestDto.getEmail())
                .identification(requestDto.getIdentification())
                .name(requestDto.getName())
                .phone(requestDto.getPhone())
                .zipCode(requestDto.getZipCode())
                .build();

        CategoryCustomer savedEntity = categoryCustomerRepository.save(categoryCustomer);
        return mapToResponseDto(savedEntity);
    }

    @Override
    @Transactional
    public CategoryCustomerResponseDto updateCategoryCustomer(Long id, CategoryCustomerRequestDto requestDto) {
        CategoryCustomer categoryCustomer = categoryCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category customer not found with ID: " + id));

        // If code is changed, ensure the new code is unique
        if (!categoryCustomer.getCode().equals(requestDto.getCode()) &&
                categoryCustomerRepository.existsByCode(requestDto.getCode())) {
            throw new IllegalStateException("Category customer code already exists: " + requestDto.getCode());
        }

        categoryCustomer.setDateOfBirth(requestDto.getDateOfBirth());
        categoryCustomer.setAddress(requestDto.getAddress());
        categoryCustomer.setCode(requestDto.getCode());
        categoryCustomer.setEmail(requestDto.getEmail());
        categoryCustomer.setIdentification(requestDto.getIdentification());
        categoryCustomer.setName(requestDto.getName());
        categoryCustomer.setPhone(requestDto.getPhone());
        categoryCustomer.setZipCode(requestDto.getZipCode());
        categoryCustomer.setModifiedDate(LocalDate.now());

        CategoryCustomer updatedEntity = categoryCustomerRepository.save(categoryCustomer);
        return mapToResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteCategoryCustomer(Long id) {
        if (!categoryCustomerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category customer not found with ID: " + id);
        }
        categoryCustomerRepository.deleteById(id);
    }

    private CategoryCustomerResponseDto mapToResponseDto(CategoryCustomer entity) {
        return CategoryCustomerResponseDto.builder()
                .id(entity.getId())
                .dateOfBirth(entity.getDateOfBirth())
                .modifiedDate(entity.getModifiedDate())
                .address(entity.getAddress())
                .code(entity.getCode())
                .email(entity.getEmail())
                .identification(entity.getIdentification())
                .name(entity.getName())
                .phone(entity.getPhone())
                .zipCode(entity.getZipCode())
                .build();
    }
}
