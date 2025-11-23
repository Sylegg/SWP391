package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

import java.math.BigDecimal;

public class DistributionReceivedItemReq {

    private Integer distributionItemId;
    private Integer receivedQuantity;
    private BigDecimal dealerPrice;

    public DistributionReceivedItemReq() {
    }

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

    public BigDecimal getDealerPrice() {
        return dealerPrice;
    }

    public void setDealerPrice(BigDecimal dealerPrice) {
        this.dealerPrice = dealerPrice;
    }
}
