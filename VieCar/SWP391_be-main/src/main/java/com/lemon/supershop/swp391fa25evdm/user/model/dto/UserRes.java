package com.lemon.supershop.swp391fa25evdm.user.model.dto;

import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;

public class UserRes {
    private int id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private RoleDto role;

    public UserRes() {}

    public UserRes(int id, String name, String email, String phone, String address, RoleDto role) {}

    public int getId() {
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
