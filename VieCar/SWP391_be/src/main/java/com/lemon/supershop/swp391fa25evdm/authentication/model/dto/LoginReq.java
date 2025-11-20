package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

public class LoginReq {
    private String identifier;
    private String password;

    public LoginReq(){
    }

    public String getPassword() {
        return password;
    }

    public String getIdentifier() {
        return identifier;
    }
}
