package com.lemon.supershop.swp391fa25evdm.payment.model.dto.response;

import com.lemon.supershop.swp391fa25evdm.payment.model.enums.PaymentStatus;

import java.util.Date;

public class PaymentRes {
    private String userName;
    private int orderId;
    private int preorderId;
    private String method;
    private PaymentStatus paidStatus;
    private Date paid_at;

    public PaymentRes() {}

    public PaymentRes(String userName, int orderId, int preorderId, String method, PaymentStatus paidStatus, Date paid_at) {
        this.userName = userName;
        this.orderId = orderId;
        this.preorderId = preorderId;
        this.method = method;
        this.paidStatus = paidStatus;
        this.paid_at = paid_at;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public PaymentStatus getPaidStatus(boolean paidStatus) {
        return this.paidStatus;
    }

    public void setPaidStatus(PaymentStatus paidStatus) {
        this.paidStatus = paidStatus;
    }

    public Date getPaid_at() {
        return paid_at;
    }

    public void setPaid_at(Date paid_at) {
        this.paid_at = paid_at;
    }

    public int getPreorderId() {
        return preorderId;
    }

    public void setPreorderId(int preorderId) {
        this.preorderId = preorderId;
    }
}
