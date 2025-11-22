package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DistributionOrderReq {
    private Integer dealerId; // Optional - required for dealer-request flow, not needed for submit-order flow
    private List<DistributionOrderItemReq> items;
    private LocalDateTime requestedDeliveryDate;
    private String dealerNotes;

    public DistributionOrderReq() {}

    public Integer getDealerId() {
        return dealerId;
    }

    public void setDealerId(Integer dealerId) {
        this.dealerId = dealerId;
    }

    public List<DistributionOrderItemReq> getItems() {
        return items;
    }

    public void setItems(List<DistributionOrderItemReq> items) {
        this.items = items;
    }

    public LocalDateTime getRequestedDeliveryDate() {
        return requestedDeliveryDate;
    }

    public void setRequestedDeliveryDate(LocalDateTime requestedDeliveryDate) {
        this.requestedDeliveryDate = requestedDeliveryDate;
    }

    public String getDealerNotes() {
        return dealerNotes;
    }

    public void setDealerNotes(String dealerNotes) {
        this.dealerNotes = dealerNotes;
    }
}
