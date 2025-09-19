package com.lemon.supershop.swp391fa25evdm.configuration;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepo roleRepository;

    @Autowired
    private UserRepo userRepo;

    @Override
    public void run(String... args) throws Exception {
        // Ensure roles exist (idempotent)
        ensureRole("Customer", "Khách hàng sử dụng dịch vụ");
        ensureRole("Admin", "Quản trị viên hệ thống");
        ensureRole("EVM_Staff", "Nhân viên EVM");
        ensureRole("Dealer_Manager", "Quản lý đại lý");
        ensureRole("Dealer_Staff", "Nhân viên đại lý");
        System.out.println("✅ Roles ensured.");

        // Seed default users for development/testing (idempotent)
        seedUserIfMissing(
                "customer1",
                "customer@example.com",
                "0901234567",
                "123 Demo Street",
                "password123",
                "Customer"
        );

        seedUserIfMissing(
                "admin",
                "admin@example.com",
                "0900000000",
                "Admin HQ",
                "admin123",
                "Admin"
        );
    }

    private void ensureRole(String name, String description) {
        Role existing = roleRepository.findByNameContainingIgnoreCase(name);
        if (existing == null) {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }

    private void seedUserIfMissing(String username, String email, String phone, String address, String password, String roleName) {
        boolean missing = (email != null && !email.isBlank() && !userRepo.existsByEmail(email))
                && (username != null && !username.isBlank() && !userRepo.existsByUsername(username));

        if (missing) {
            Role role = roleRepository.findByNameContainingIgnoreCase(roleName);
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPhone(phone);
            user.setAddress(address);
            user.setPassword(password); // NOTE: plain text for dev only
            user.setIsBlack("FALSE");
            user.setRole(role);
            userRepo.save(user);
            System.out.println("✅ Seeded user: " + username + " (" + roleName + ")");
        }
    }
}