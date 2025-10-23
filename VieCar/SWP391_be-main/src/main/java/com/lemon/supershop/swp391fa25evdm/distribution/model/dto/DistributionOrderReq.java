package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DistributionOrderReq {
    private List<Integer> productIds;
    private Integer requestedQuantity;
    private LocalDateTime requestedDeliveryDate;
    private String dealerNotes;

    public DistributionOrderReq() {}

    public List<Integer> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Integer> productIds) {
        this.productIds = productIds;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
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
