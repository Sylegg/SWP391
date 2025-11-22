package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import java.time.LocalDateTime;

public class DistributionPlanningReq {
    private LocalDateTime estimatedDeliveryDate;
    // ❌ Xóa: private Integer actualQuantity;
    private String evmNotes;

    public DistributionPlanningReq() {}

    public LocalDateTime getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    // ❌ Xóa actualQuantity getter/setter
    // public Integer getActualQuantity() { return actualQuantity; }
    // public void setActualQuantity(Integer actualQuantity) { this.actualQuantity = actualQuantity; }

    public String getEvmNotes() {
        return evmNotes;
    }

    public void setEvmNotes(String evmNotes) {
        this.evmNotes = evmNotes;
    }
}
