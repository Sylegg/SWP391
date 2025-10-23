package com.lemon.supershop.swp391fa25evdm.contract.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class ContractReq {
    private LocalDateTime signedDate;
    private String fileUrl; // link PDF hợp đồng lưu trên server
    private int orderId;
    private int userId;
    private String status;

    public ContractReq() {
    }

    public ContractReq(LocalDateTime signedDate, String fileUrl, int orderId, int userId, String status) {
        this.signedDate = signedDate;
        this.fileUrl = fileUrl;
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
    }

    public LocalDateTime getSignedDate() {
        return signedDate;
    }

    public void setSignedDate(LocalDateTime signedDate) {
        this.signedDate = signedDate;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
