package com.lemon.supershop.swp391fa25evdm.dealer.model.dto;

public class   DealerReq {
    private String name;
    private String address;
    private String phone;
    private String email;
    private String taxcode;
    private Integer userId; // ID của user có role dealer manager

    public DealerReq() {}

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getTaxcode() {
        return taxcode;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
