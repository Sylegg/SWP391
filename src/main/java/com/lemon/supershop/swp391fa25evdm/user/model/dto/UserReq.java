package com.lemon.supershop.swp391fa25evdm.user.model.dto;

import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;

public class UserReq {
    private String username;
    private String email;
    private String phone;
    private String address;
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

    public String getRoleName() {
        return roleName;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
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