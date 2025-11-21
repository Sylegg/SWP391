package com.lemon.supershop.swp391fa25evdm.user.model.dto;

import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;

public class UserRes {
    private int id;
    private String name;
    private String username;  // Added for frontend compatibility
    private String email;
    private String phone;
    private String address;
    private String role;
    private UserStatus status;
    private Integer dealerId;
    private String dealerName;
    private String dealerAddress;
    private String temporaryPassword;  // Only used for Google login profile completion notification

    public UserRes() {}

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
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

    public String getRole() {
        return role;
    }

    public UserStatus getStatus() {return status;}

    public Integer getDealerId() {
        return dealerId;
    }

    public String getDealerName() {
        return dealerName;
    }

    public String getDealerAddress() {
        return dealerAddress;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
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

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDealerId(Integer dealerId) {
        this.dealerId = dealerId;
    }

    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }

    public void setDealerAddress(String dealerAddress) {
        this.dealerAddress = dealerAddress;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
