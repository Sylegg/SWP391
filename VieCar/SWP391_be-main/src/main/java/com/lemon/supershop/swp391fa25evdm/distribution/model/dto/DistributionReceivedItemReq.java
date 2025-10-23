package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

public class DistributionReceivedItemReq {
    private Integer distributionItemId;
    private Integer receivedQuantity;

    public DistributionReceivedItemReq() {}

    public Integer getDistributionItemId() {
        return distributionItemId;
    }

    public void setDistributionItemId(Integer distributionItemId) {
        this.distributionItemId = distributionItemId;
    }

    public Integer getReceivedQuantity() {
        return receivedQuantity;
    }

    public void setReceivedQuantity(Integer receivedQuantity) {
        this.receivedQuantity = receivedQuantity;
    }
}
