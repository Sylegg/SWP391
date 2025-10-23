package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import java.time.LocalDateTime;

public class DistributionCompletionReq {
    private Integer receivedQuantity;
    private LocalDateTime actualDeliveryDate;
    private String feedback;

    public DistributionCompletionReq() {}

    public Integer getReceivedQuantity() {
        return receivedQuantity;
    }

    public void setReceivedQuantity(Integer receivedQuantity) {
        this.receivedQuantity = receivedQuantity;
    }

    public LocalDateTime getActualDeliveryDate() {
        return actualDeliveryDate;
    }

    public void setActualDeliveryDate(LocalDateTime actualDeliveryDate) {
        this.actualDeliveryDate = actualDeliveryDate;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
