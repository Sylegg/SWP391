package com.lemon.supershop.swp391fa25evdm.configuration;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitilizer implements CommandLineRunner {

    @Autowired
    private RoleRepo roleRepo;

    @Override
    public void run(String... args) throws Exception {
        // Only insert default roles if they don't already exist
        createRoleIfMissing("Admin", "Manage the entire system");
        createRoleIfMissing("Customer", "Customer is king");
        createRoleIfMissing("EVM Staff", "");
        createRoleIfMissing("Dealer Manager", "Manage the dealer");
        createRoleIfMissing("Dealer Staff", "");
    }

    private void createRoleIfMissing(String name, String description) {
        boolean exists = roleRepo.findByNameContainingIgnoreCase(name).isPresent();
        if (!exists) {
            roleRepo.save(new Role(name, description));
        }
    }
}
