package com.lemon.supershop.swp391fa25evdm.dealer.model.dto;

public class   DealerReq {
    private String name;
    private String address;
    private String phone;
    private String email;
    private String taxcode;
    private int userId;

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

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTaxcode(String taxcode) {
        this.taxcode = taxcode;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}
