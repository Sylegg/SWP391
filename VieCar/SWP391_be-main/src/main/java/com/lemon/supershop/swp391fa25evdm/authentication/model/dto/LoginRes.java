package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

public class LoginRes {
    private String token;
    private String refreshToken;
    private String username;
    private String role;

    public LoginRes(String token, String refreshToken, String username, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public String getRefreshToken(){
        return refreshToken;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
