package com.example.swp.config;

import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@seal.com");
            admin.setRole(Role.ADMIN);
            admin.setApproved(true);
            admin.setVerified(true);
            userRepository.save(admin);
            log.info("Default admin user created with username 'admin' and password 'admin123'");
        } else {
            // Force approve and verify the admin just in case it was created via register API
            User admin = userRepository.findByUsername("admin").get();
            boolean changed = false;
            if (!admin.isApproved()) {
                admin.setApproved(true);
                changed = true;
            }
            if (!admin.isVerified()) {
                admin.setVerified(true);
                changed = true;
            }
            if (admin.getRole() != Role.ADMIN) {
                admin.setRole(Role.ADMIN);
                changed = true;
            }
            if (changed) {
                userRepository.save(admin);
                log.info("Admin user permissions forced to approved/verified and Role.ADMIN");
            }
        }
    }
}
