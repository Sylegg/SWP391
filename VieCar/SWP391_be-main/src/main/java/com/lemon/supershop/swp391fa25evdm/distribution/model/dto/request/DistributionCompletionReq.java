package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

import java.time.LocalDateTime;
import java.util.List;

public class DistributionCompletionReq {

    private Integer receivedQuantity;
    private LocalDateTime actualDeliveryDate;
    private String feedback;
    private List<DistributionReceivedItemReq> items;

    public DistributionCompletionReq() {
    }

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

    public List<DistributionReceivedItemReq> getItems() {
        return items;
    }

    public void setItems(List<DistributionReceivedItemReq> items) {
        this.items = items;
    }
}
