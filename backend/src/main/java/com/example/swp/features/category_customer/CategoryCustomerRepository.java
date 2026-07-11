package com.example.swp.features.category_customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryCustomerRepository extends JpaRepository<CategoryCustomer, Long> {
    Optional<CategoryCustomer> findByCode(String code);
    boolean existsByCode(String code);
}
