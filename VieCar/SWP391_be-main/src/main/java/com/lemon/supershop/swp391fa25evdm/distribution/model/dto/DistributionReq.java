package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DistributionReq {

    private int categoryId;
    private int dealerId;
    private int contractId;
    private int productId;

    public DistributionReq() {
    }

    public DistributionReq(int categoryId, int dealerId, int contractId, int productId) {
        this.categoryId = categoryId;
        this.dealerId = dealerId;
        this.contractId = contractId;
        this.productId = productId;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public int getContractId() {
        return contractId;
    }

    public void setContractId(int contractId) {
        this.contractId = contractId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }
}
