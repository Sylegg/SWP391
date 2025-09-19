package com.lemon.supershop.swp391fa25evdm.user.model.dto;

import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;

public class UserRes {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private RoleDto role;

    public UserRes() {}

    public UserRes(Long id, String name, String email, String phone, String address, RoleDto role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
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

    public RoleDto getRole() {
        return role;
    }
}
