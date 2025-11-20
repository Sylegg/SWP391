package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.request;

import java.time.LocalDateTime;

public class TestDriveReq {

    private LocalDateTime scheduleDate;
    private String notes;
    private String status;
    private int userId;
    private int dealerId;
    private int productId;
    private int categoryId;
    private String productModelName;
    private int escortStaffId;

    public TestDriveReq() {
    }

    public LocalDateTime getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDateTime scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getProductModelName() {
        return productModelName;
    }

    public void setProductModelName(String productModelName) {
        this.productModelName = productModelName;
    }

    public int getEscortStaffId() {
        return escortStaffId;
    }

    public void setEscortStaffId(int escortStaffId) {
        this.escortStaffId = escortStaffId;
    }
}
