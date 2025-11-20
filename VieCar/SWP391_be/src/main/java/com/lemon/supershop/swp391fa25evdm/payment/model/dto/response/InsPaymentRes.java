package com.lemon.supershop.swp391fa25evdm.payment.model.dto.response;

import jakarta.persistence.Column;

import java.time.LocalDateTime;

public class InsPaymentRes {
    private int installmentNumber;
    private LocalDateTime dueDate;
    private double expectedAmount;
    private boolean paid;

    public InsPaymentRes() {
    }

    public void setInstallmentNumber(int installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public void setExpectedAmount(double expectedAmount) {
        this.expectedAmount = expectedAmount;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public int getInstallmentNumber() {
        return installmentNumber;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public double getExpectedAmount() {
        return expectedAmount;
    }

    public boolean isPaid() {
        return paid;
    }
}
