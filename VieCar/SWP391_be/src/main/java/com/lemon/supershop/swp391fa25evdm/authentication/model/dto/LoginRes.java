package com.lemon.supershop.swp391fa25evdm.authentication.model.dto;

public class LoginRes {
    private String token;
    private String refreshToken;
    private String username;
    private String role;
    private Integer userId;
    private Integer dealerId;
    private String dealerName;
    private String dealerAddress;

    public LoginRes(String token, String refreshToken, String username, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public LoginRes(String token, String refreshToken, String username, String role, Integer userId, Integer dealerId, String dealerName, String dealerAddress) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.dealerId = dealerId;
        this.dealerName = dealerName;
        this.dealerAddress = dealerAddress;
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

    public void setToken(String token) {
        this.token = token;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getDealerId() {
        return dealerId;
    }

    public void setDealerId(Integer dealerId) {
        this.dealerId = dealerId;
    }

    public String getDealerName() {
        return dealerName;
    }

    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }

    public String getDealerAddress() {
        return dealerAddress;
    }

    public void setDealerAddress(String dealerAddress) {
        this.dealerAddress = dealerAddress;
    }
}
