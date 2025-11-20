package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto;

import java.time.LocalDateTime;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TestDriveRes {

    private int id;
    private LocalDateTime scheduleDate;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELED
    private String notes;
<<<<<<< HEAD
    private String location;
=======
    private String specificVIN;
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
    private UserRes user;
    private DealerRes dealer;
    private String productName;
    private String productModelName; // Customer's requested model name
    private String categoryName; // Customer's requested category
    private UserRes escortStaff; // Staff member assigned to accompany

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

<<<<<<< HEAD
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
=======
    public String getSpecificVIN() {
        return specificVIN;
    }

    public void setSpecificVIN(String specificVIN) {
        this.specificVIN = specificVIN;
    }

    public String getProductModelName() {
        return productModelName;
    }

    public void setProductModelName(String productModelName) {
        this.productModelName = productModelName;
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
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
    }
}
