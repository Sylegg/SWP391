package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductReq;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class DistributionReq {

    private int categoryId;
    private int dealerId;
    private int contractId;
    private List<Integer> productId;

    public DistributionReq() {
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

    public List<Integer> getProductId() {
        return productId;
    }

    public void setProductId(List<Integer> productId) {
        this.productId = productId;
    }
}
