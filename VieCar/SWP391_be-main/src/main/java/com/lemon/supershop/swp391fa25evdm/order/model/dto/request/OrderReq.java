package com.lemon.supershop.swp391fa25evdm.order.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;


public class OrderReq {
    private int productId;
    private int contractId;
    private int dealerId;
    private String description;

    public OrderReq() {
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getContractId() {
        return contractId;
    }

    public void setContractId(int contractId) {
        this.contractId = contractId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
