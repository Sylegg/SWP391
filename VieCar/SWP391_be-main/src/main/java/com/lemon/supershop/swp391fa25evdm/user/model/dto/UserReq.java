package com.lemon.supershop.swp391fa25evdm.user.model.dto;

import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;

public class UserReq {
    private String username;
    private String email;
    private String phone;
    private String address;
    private String password;
    private String roleName;
    private int dealerId;
    private UserStatus status;
    private Boolean emailVerified;

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

    public String getPassword() {
        return password;
    }

    public String getRoleName() {
        return roleName;
    }

    public int getDealerId() {
        return dealerId;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}