package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

public class LoginReq {
    private String identifier;
    private String password;

    public LoginReq(){
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
