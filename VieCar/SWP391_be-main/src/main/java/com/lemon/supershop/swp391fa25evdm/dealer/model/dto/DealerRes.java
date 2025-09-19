package com.lemon.supershop.swp391fa25evdm.dealer.model.dto;

public class DealerRes {
    private String name;
    private String address;
    private String phone;
    private String email;
    private String status;

    public DealerRes() {}

    public DealerRes(String name, String address, String phone, String email, String status) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.status = status;
    }

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

    public String getStatus() {
        return status;
    }
}
