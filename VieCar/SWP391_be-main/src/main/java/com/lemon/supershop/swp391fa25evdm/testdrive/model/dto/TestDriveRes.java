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
    private UserRes user;
    private DealerRes dealer;
    private String productName;

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
}
