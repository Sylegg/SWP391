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

    public Integer getDealerId() {
        return dealerId;
    }
}
