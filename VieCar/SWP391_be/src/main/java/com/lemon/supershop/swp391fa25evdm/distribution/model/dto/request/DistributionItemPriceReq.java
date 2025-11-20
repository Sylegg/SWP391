package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

import java.math.BigDecimal;

public class DistributionItemPriceReq {

    private Integer approvedQuantity;
    private Integer distributionItemId;
    private BigDecimal dealerPrice;

    public DistributionItemPriceReq() {
    }

    public Integer getDistributionItemId() {
        return distributionItemId;
    }

    public void setDistributionItemId(Integer distributionItemId) {
        this.distributionItemId = distributionItemId;
    }

    public BigDecimal getDealerPrice() {
        return dealerPrice;
    }

    public void setDealerPrice(BigDecimal dealerPrice) {
        this.dealerPrice = dealerPrice;
    }

    public Integer getApprovedQuantity() {
        return approvedQuantity;
    }

    public void setApprovedQuantity(Integer approvedQuantity) {
        this.approvedQuantity = approvedQuantity;
    }
}
