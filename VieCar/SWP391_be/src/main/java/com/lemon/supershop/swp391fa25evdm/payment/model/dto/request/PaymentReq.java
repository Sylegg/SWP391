package com.lemon.supershop.swp391fa25evdm.payment.model.dto.request;

public class PaymentReq {
    private int userId;
    private int payforId;
    private String method;

    public PaymentReq(){}

    public int getUserId() {
        return userId;
    }

    public int getPayforId() {
        return payforId;
    }

    public String getMethod() {
        return method;
    }
}
