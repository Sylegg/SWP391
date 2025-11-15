package com.lemon.supershop.swp391fa25evdm.vnpay.model.dto.response;

import java.io.Serializable;

/**
 * VNPay Payment Response DTO
 * 
 * Chứa thông tin response sau khi tạo URL thanh toán VNPay
 */
public class VnpayRes implements Serializable {
    
    private String orderId;      // Mã đơn hàng
    private long amount;         // Số tiền thanh toán (VNĐ)
    private String bank;         // Mã ngân hàng (NCB, VIETCOMBANK, etc.)
    private String url;          // URL thanh toán VNPay

    public VnpayRes() {}

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
