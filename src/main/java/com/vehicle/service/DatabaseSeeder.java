package com.vehicle.service;

import com.vehicle.service.model.User;
import com.vehicle.service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo, PasswordEncoder passwordEncoder, org.springframework.jdbc.core.JdbcTemplate jdbc) {
        return args -> {
            try {
                jdbc.execute("ALTER TABLE service_tickets MODIFY user_id BIGINT NULL");
            } catch (Exception e) {
                System.out.println("Could not alter table: " + e.getMessage());
            }
            if (userRepo.findByUsername("Admin01").isEmpty()) {
                User admin = new User();
                admin.setUsername("Admin01");
                admin.setPassword(passwordEncoder.encode("Admin012026"));
                admin.setRole("Owner");
                admin.setFullName("System Owner");
                admin.setSecurityQuestion("What is your workshop name?");
                admin.setSecurityAnswer("Premium Auto Services");
                userRepo.save(admin);
                System.out.println("Default Owner account Admin01 created.");
            }
        };
    }
}
