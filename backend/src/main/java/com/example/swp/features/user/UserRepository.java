package com.example.swp.features.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    
    Page<User> findByApprovedTrue(Pageable pageable);
    Page<User> findByApprovedFalse(Pageable pageable);
    
    Boolean existsByFptStudentId(String fptStudentId);
    Boolean existsByFptStudentIdAndIdNot(String fptStudentId, Long id);
    Boolean existsByFptStudentIdAndSchoolName(String fptStudentId, String schoolName);
}
