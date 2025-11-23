package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.response;

import java.time.LocalDateTime;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;

public class TestDriveRes {

    private int id;
    private LocalDateTime scheduleDate;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELED
    private String notes;
    private String location;
    private UserRes user;
    private DealerRes dealer;
    private Integer productId;
    private String productName;
    private String specificVIN;
    private Integer categoryId;
    private String categoryName; // Customer's requested category
    private UserRes escortStaff;
    private Integer attemptNumber;

    public TestDriveRes() {
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

    public UserRes getUser() {
        return user;
    }

    public void setUser(UserRes user) {
        this.user = user;
    }

    public DealerRes getDealer() {
        return dealer;
    }

    public void setDealer(DealerRes dealer) {
        this.dealer = dealer;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public UserRes getEscortStaff() {
        return escortStaff;
    }

    public void setEscortStaff(UserRes escortStaff) {
        this.escortStaff = escortStaff;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getSpecificVIN() {
        return specificVIN;
    }

    public void setSpecificVIN(String specificVIN) {
        this.specificVIN = specificVIN;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

//    public Integer getAttemptNumber() {
//        return attemptNumber;
//    }
//
//    public void setAttemptNumber(Integer attemptNumber) {
//        this.attemptNumber = attemptNumber;
//    }
}
