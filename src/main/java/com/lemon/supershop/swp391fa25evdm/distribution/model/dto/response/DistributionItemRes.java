package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.response;

import java.math.BigDecimal;

import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;

public class DistributionItemRes {
    private Integer id;
    private ProductRes product;
    private Integer categoryId;
    private CategoryRes category;
    private String color;
    private Integer quantity;
    private Integer approvedQuantity;
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

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public CategoryRes getCategory() {
        return category;
    }

    public void setCategory(CategoryRes category) {
        this.category = category;
    }

    public Integer getApprovedQuantity() {
        return approvedQuantity;
    }

    public void setApprovedQuantity(Integer approvedQuantity) {
        this.approvedQuantity = approvedQuantity;
    }
}