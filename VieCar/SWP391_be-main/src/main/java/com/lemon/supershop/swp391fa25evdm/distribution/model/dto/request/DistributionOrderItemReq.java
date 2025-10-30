package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.request;

public class DistributionOrderItemReq {

    private Integer productId;
    private String color;
    private Integer quantity;

    public DistributionOrderItemReq() {
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
