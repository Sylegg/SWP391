package com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.dto;

public class VnpayReq {
    private Long amount;           // Số tiền (VNĐ)
    private String orderInfo;      // Thông tin đơn hàng
    private String orderId;        // Mã đơn hàng
    private Long subscriptionId;   // ID gói subscription (nếu có)

    public VnpayReq() {
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
}
