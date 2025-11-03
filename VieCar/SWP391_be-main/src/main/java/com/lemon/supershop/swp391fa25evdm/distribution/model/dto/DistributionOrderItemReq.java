package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

public class DistributionOrderItemReq {
    // ✅ Hỗ trợ CẢ 2: productId (cho sản phẩm cụ thể) HOẶC categoryId (cho đơn theo danh mục)
    private Integer productId;    // Optional: ID sản phẩm cụ thể (nếu có)
    private Integer categoryId;   // Optional: ID danh mục (nếu đặt theo danh mục)
    private String color;
    private Integer quantity;

    public DistributionOrderItemReq() {}

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
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
