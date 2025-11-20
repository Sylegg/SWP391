package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

import java.math.BigDecimal;

import java.math.BigDecimal;
public class DistributionReceivedItemReq {

    private Integer distributionItemId;
    private Integer receivedQuantity;
<<<<<<< HEAD:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/request/DistributionReceivedItemReq.java
=======
    // Optional: allow dealer to update dealerPrice upon receipt
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/DistributionReceivedItemReq.java
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
