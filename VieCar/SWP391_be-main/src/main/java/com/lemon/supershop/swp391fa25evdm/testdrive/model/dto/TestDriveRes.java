package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TestDriveRes {

    private int id;
    private LocalDateTime scheduleDate;
    private String location;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELED
    private String notes;
    private int userId;
    private int dealerId;
    private int dealerCategoryId;

    public TestDriveRes() {
    }

    public TestDriveRes(int id, LocalDateTime scheduleDate, String location, String status, String notes, int userId, int dealerId, int dealerCategoryId) {
        this.id = id;
        this.scheduleDate = scheduleDate;
        this.location = location;
        this.status = status;
        this.notes = notes;
        this.userId = userId;
        this.dealerId = dealerId;
        this.dealerCategoryId = dealerCategoryId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
