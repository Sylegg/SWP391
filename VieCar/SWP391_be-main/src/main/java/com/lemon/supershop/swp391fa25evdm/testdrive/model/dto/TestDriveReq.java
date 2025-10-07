package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TestDriveReq {

    private LocalDateTime scheduleDate;
    private String location;
    private String notes;
    private String status;
    private int userId;
    private int dealerId;
    private int dealerCategoryId;

    public TestDriveReq() {
    }

    public TestDriveReq(LocalDateTime scheduleDate, String location, String notes, String status, int userId, int dealerId, int dealerCategoryId) {
        this.scheduleDate = scheduleDate;
        this.location = location;
        this.notes = notes;
        this.status = status;
        this.userId = userId;
        this.dealerId = dealerId;
        this.dealerCategoryId = dealerCategoryId;
    }

    public LocalDateTime getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDateTime scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public int getDealerCategoryId() {
        return dealerCategoryId;
    }

    public void setDealerCategoryId(int dealerCategoryId) {
        this.dealerCategoryId = dealerCategoryId;
    }
}
