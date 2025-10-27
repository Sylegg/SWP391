package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import java.math.BigDecimal;

public class DistributionItemRes {
    private Integer id;
    private ProductRes product;
    private String color;
    private Integer quantity;
    private BigDecimal dealerPrice;

    public DistributionItemRes() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ProductRes getProduct() {
        return product;
    }

    public void setProduct(ProductRes product) {
        this.product = product;
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

    public BigDecimal getDealerPrice() {
        return dealerPrice;
    }

    public void setDealerPrice(BigDecimal dealerPrice) {
        this.dealerPrice = dealerPrice;
    }
}
