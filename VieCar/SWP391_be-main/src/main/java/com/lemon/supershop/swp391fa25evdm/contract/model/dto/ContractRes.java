package com.lemon.supershop.swp391fa25evdm.contract.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class ContractRes {
    private int id;
    private LocalDateTime signedDate;
    private String fileUrl; // link PDF hợp đồng lưu trên server
    private Integer orderId;
    private Integer userId;
    private String status;

    public ContractRes() {
    }

    public ContractRes(int id, LocalDateTime signedDate, String fileUrl, Integer orderId, Integer userId, String status) {
        this.id = id;
        this.signedDate = signedDate;
        this.fileUrl = fileUrl;
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
