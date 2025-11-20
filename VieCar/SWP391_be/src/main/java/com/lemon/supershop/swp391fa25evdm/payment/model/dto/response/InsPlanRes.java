package com.lemon.supershop.swp391fa25evdm.payment.model.dto.response;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerShortRes;

public class InsPlanRes {
    private int months;
    private double interestRate;
    private String productName;
    private DealerShortRes dealer;
    private double monthPrice;

    public InsPlanRes() {
    }
    public InsPlanRes(int months, double interestRate, String productName) {
        this.months = months;
        this.interestRate = interestRate;
        this.productName = productName;
    }

    public int getMonths() {
        return months;
    }

    public void setMonths(int months) {
        this.months = months;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getMonthPrice() {
        return monthPrice;
    }

    public void setMonthPrice(double monthPrice) {
        this.monthPrice = monthPrice;
    }
}
