package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

public class RegisterReq {
    private String username;
    private String phone;
    private String email;
    private String address;
    private String roleName;
    private String password;
    private String confirmPassword;
    private Integer dealerId;
    private Boolean emailVerified;

    public RegisterReq() {}

    public String getUsername() {
        return username;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getAddress() {
        return address;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public Integer getDealerId() {
        return dealerId;
    }

    public void setDealerId(Integer dealerId) {
        this.dealerId = dealerId;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
