package com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.Response;


import java.io.Serializable;

public class VnpayRes implements Serializable {
    private String orderId;
    private long amount;
    private String bank;
    private String url;

    public VnpayRes(String orderId, long amount, String bank, String url) {
        this.orderId = orderId;
        this.amount = amount;
        this.bank = bank;
        this.url = url;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public String getBank() {
        return bank;
    }

    public void setBank(String bank) {
        this.bank = bank;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
