package com.lemon.supershop.swp391fa25evdm.user.model.dto;

public class UserReq {
    private String username;
    private String email;
    private String phone;
    private String address;
    private String roleName;
    private int dealerId;

    public UserReq() {
    }

    public String getUsername() {
        return username;
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

    public String getRoleName() {
        return roleName;
    }

    public int getDealerId() {
        return dealerId;
    }
}