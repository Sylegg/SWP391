package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;

public class AuthenRes {
    private String username;
    private String password;
    private String email;
    private String phone;
    private String address;
    private Role role;

    public AuthenRes() {
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public Role getRole() {
        return role;
    }
}
