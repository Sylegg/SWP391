package com.lemon.supershop.swp391fa25evdm.order.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;


public class OrderReq {
    private int userId;
    private int productId;
     private int contractId;
    private int dealerId;

    public OrderReq() {
    }

    public OrderReq(int userId, int productId, int contractId, int dealerId) {
        this.userId = userId;
        this.productId = productId;
        this.contractId = contractId;
        this.dealerId = dealerId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
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
}
