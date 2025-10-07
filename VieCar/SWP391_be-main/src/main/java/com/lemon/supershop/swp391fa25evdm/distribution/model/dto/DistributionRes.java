package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DistributionRes {

    private int id;
    private int categoryId;
    private int dealerId;
    private int contractId;

    public DistributionRes() {
    }

    public DistributionRes(int id, int categoryId, int dealerId, int contractId) {
        this.id = id;
        this.categoryId = categoryId;
        this.dealerId = dealerId;
        this.contractId = contractId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
}

