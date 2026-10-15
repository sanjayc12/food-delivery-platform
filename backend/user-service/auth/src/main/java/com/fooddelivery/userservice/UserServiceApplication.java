package com.fooddelivery.userservice;

import com.fooddelivery.userservice.entity.User;
import com.fooddelivery.userservice.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username:admin}") String username,
            @Value("${app.admin.password:1234}") String password,
            @Value("${app.admin.email:admin@foodrush.local}") String email
    ) {
        return args -> {
            User admin = userRepository.findByUsername(username).orElseGet(() -> {
                User newAdmin = new User();
                newAdmin.setUsername(username);
                newAdmin.setEmail(email);
                newAdmin.setPassword(passwordEncoder.encode(password));
                newAdmin.setRole("ADMIN");
                return newAdmin;
            });

            boolean changed = false;
            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                admin.setRole("ADMIN");
                changed = true;
            }
            if (!passwordEncoder.matches(password, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(password));
                changed = true;
            }
            if (changed || admin.getId() == null) {
                userRepository.save(admin);
            }
        };
    }
}