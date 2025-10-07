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
        Role role1 = new Role("Admin", "Manage the entire system");
        Role role2 = new Role("Customer", "Customer is king");
        Role role3 = new Role("EVM Staff", "");
        Role role4 = new Role("Dealer Manager", "Manage the dealer");
        Role role5 = new Role("Dealer Staff", "");

        roleRepo.save(role1);
        roleRepo.save(role2);
        roleRepo.save(role3);
        roleRepo.save(role4);
        roleRepo.save(role5);
    }
}
