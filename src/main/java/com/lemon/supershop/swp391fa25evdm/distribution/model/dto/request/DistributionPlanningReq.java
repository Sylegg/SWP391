package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

import java.time.LocalDateTime;

public class DistributionPlanningReq {

    private LocalDateTime estimatedDeliveryDate;
    private String evmNotes;

    public DistributionPlanningReq() {
    }

    public LocalDateTime getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public String getEvmNotes() {
        return evmNotes;
    }

    public void setEvmNotes(String evmNotes) {
        this.evmNotes = evmNotes;
    }
}
