package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
import java.math.BigDecimal;

public class DistributionItemRes {
    private Integer id;
    private ProductRes product;
    private Integer categoryId; // Cho trường hợp đặt theo category (product = null)
    private CategoryRes category; // Category object để hiển thị name
    private String color;
    private Integer quantity;
    private Integer approvedQuantity; // Số lượng EVM duyệt
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

    public Integer getApprovedQuantity() {
        return approvedQuantity;
    }

    public void setApprovedQuantity(Integer approvedQuantity) {
        this.approvedQuantity = approvedQuantity;
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
}
