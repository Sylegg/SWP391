package com.lemon.supershop.swp391fa25evdm.payment.model.dto.request;

public class InsPlanReq {
    private int months;
    private double InterestRate;
    private int productId;
    private int dealerId;

    public InsPlanReq() {
    }

    public int getMonths() {
        return months;
    }

    public double getInterestRate() {
        return InterestRate;
    }

    public int getProductId() {
        return productId;
    }

    public int getDealerId() {
        return dealerId;
    }
}
