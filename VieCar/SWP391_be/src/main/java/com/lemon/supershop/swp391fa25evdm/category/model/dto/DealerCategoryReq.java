package com.lemon.supershop.swp391fa25evdm.category.model.dto;

public class DealerCategoryReq {
    private String name;
    private int quantity;
    private String description;
    private String status;
    private int categoryId;
    private int dealerId;

    public DealerCategoryReq() {
    }

    public DealerCategoryReq(String name, int quantity, String description, String status, int categoryId, int dealerId) {
        this.name = name;
        this.quantity = quantity;
        this.description = description;
        this.status = status;
        this.categoryId = categoryId;
        this.dealerId = dealerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
}
