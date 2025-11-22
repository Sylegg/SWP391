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
    private Boolean isNewUser;  // Flag để phân biệt user mới cần điền thông tin

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

    public Integer getUserId() {
        return userId;
    }

    public Integer getDealerId() {
        return dealerId;
    }

    public String getDealerName() {
        return dealerName;
    }

    public String getDealerAddress() {
        return dealerAddress;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
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

    public Boolean getIsNewUser() {
        return isNewUser;
    }

    public void setIsNewUser(Boolean isNewUser) {
        this.isNewUser = isNewUser;
    }
}
