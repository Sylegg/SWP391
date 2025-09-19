package com.lemon.supershop.swp391fa25evdm.configuration;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedRoles(RoleRepo roleRepo) {
        return args -> {
            ensureRole(roleRepo, "Admin", "System administrator");
            ensureRole(roleRepo, "Customer", "Default customer role");
            ensureRole(roleRepo, "Dealer_Manager", "Dealer manager role");
            ensureRole(roleRepo, "Dealer_Staff", "Dealer staff role");
            ensureRole(roleRepo, "EVM_Staff", "EVM staff role");
        };
    }

    private void ensureRole(RoleRepo roleRepo, String name, String description) {
        Role existing = roleRepo.findByNameContainingIgnoreCase(name);
        if (existing == null) {
            roleRepo.save(new Role(name, description));
        }
    }
}
